import { Order } from "./order.model";
import { Table } from "../table/table.model";
import { getSocketIO } from "../../utils/socket";
import AppError from "../../errors/AppError";
import { sendExpoPush } from "../../utils/lib/push";
import { RotaEmployee } from "../rota/employee/employee.model";
import { RotaTimesheet } from "../rota/timesheet/timesheet.model";

// What a product actually costs right now, discount included.
//
// This mirrors the `final_price` virtual on the product schema. It has to be
// duplicated rather than reused because the lookup below uses `.lean()`, and
// lean documents carry no virtuals — the previous `.select('price')` therefore
// returned the pre-discount price and quietly overwrote the discounted price
// the waiter had quoted at the table. A dish on 20% off was shown at 80 and
// billed at 100.
const effectivePrice = (p: any, now = new Date()): number => {
  const base = Number(p?.price) || 0;
  const pct = Number(p?.discount_percent) || 0;
  if (pct <= 0) return base;
  const start = p?.discount_start ? new Date(p.discount_start) : null;
  const end = p?.discount_end ? new Date(p.discount_end) : null;
  if (start && now < start) return base;   // discount hasn't started
  if (end && now > end) return base;       // discount has expired
  return Math.round(base * (1 - pct / 100) * 100) / 100;
};

// Catalog prices for a set of product ids, scoped to one business so an id
// from another tenant can never set a price here.
const catalogPriceMap = async (ids: any[], business_id: any) => {
  const map = new Map<string, number>();
  if (!ids.length) return map;
  const { default: Product } = await import('../product/product.model');
  const products = await Product.find({ _id: { $in: ids }, business_id })
    .select('price discount_percent discount_start discount_end')
    .lean();
  products.forEach((p: any) => map.set(String(p._id), effectivePrice(p)));
  return map;
};

export const createOrder = async (payload: any) => {
  // If this is a dine-in order and tableNo is provided, link to the table.
  // Auto-create the table record if it doesn't exist yet — staff often type a
  // table number without first configuring it in the floor view.
  const needsTable =
    (payload.orderType || 'dine-in') === 'dine-in' && !!payload.tableNo;
  if (needsTable) {
    // Ensure the table exists WITHOUT a find-then-create race — the unique index
    // on { business_id, tableNo } backs this upsert.
    const existing = await Table.findOneAndUpdate(
      { business_id: payload.business_id, tableNo: payload.tableNo },
      {
        $setOnInsert: {
          business_id: payload.business_id,
          tableNo: payload.tableNo,
          capacity: payload.guestCount && payload.guestCount > 0 ? payload.guestCount : 4,
          status: 'AVAILABLE',
        },
      },
      { new: true, upsert: true },
    );
    // Fast-fail before doing order work; the authoritative claim happens
    // atomically after the order is saved (below).
    if (existing.status !== 'AVAILABLE') {
      throw new AppError(400, `Table ${payload.tableNo} is already occupied`);
    }
  }

  // Set default initial statuses
  payload.status = "pending";
  payload.paymentStatus = "UNPAID";

  // Flatten totals from nested payload (frontend sends { totals: { totalQty, subtotal, grandTotal } })
  if (payload.totals) {
    if (payload.totals.totalQty != null) payload.totalQty = payload.totals.totalQty;
    if (payload.totals.subtotal != null && payload.subtotal == null) payload.subtotal = payload.totals.subtotal;
  }

  if (payload.items && Array.isArray(payload.items)) {
    payload.items.forEach((item: any) => {
      item.kitchenStatus = "SENT_TO_KITCHEN";
      item.sentToKitchenAt = new Date();
      item.round = 1;
    });
    // Fallback: compute totalQty from items if not provided
    if (payload.totalQty == null) {
      payload.totalQty = payload.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0);
    }
  }

  // Never trust client-supplied prices/subtotal (guest checkout is unauthenticated).
  // Override each line price with the catalog price for this business when the
  // product is known; manual/custom items (no matching product) keep their
  // submitted price but clamped to >= 0. Subtotal is always recomputed from the
  // corrected line prices, so a tampered total can't create a free order.
  if (payload.items && Array.isArray(payload.items)) {
    try {
      const ids = payload.items
        .map((it: any) => it.productId || it.product_id || it._id)
        .filter(Boolean);
      const priceMap = await catalogPriceMap(ids, payload.business_id);
      payload.items = payload.items.map((it: any) => {
        const pid = String(it.productId || it.product_id || it._id || '');
        const catalogPrice = priceMap.get(pid);
        const price = catalogPrice != null ? catalogPrice : Math.max(0, Number(it.price) || 0);
        return { ...it, price };
      });
      const subtotal = payload.items.reduce(
        (s: number, it: any) => s + Number(it.price) * (Number(it.quantity) || 1),
        0,
      );
      payload.subtotal = subtotal;
      if (payload.membershipDiscount && !payload.membershipDiscount.applied) {
        payload.membershipDiscount.payable = subtotal;
      }
    } catch (e: any) {
      // Defensive: if catalog lookup fails (e.g. malformed id), fall back to the
      // submitted prices rather than blocking the order. Still clamp negatives.
      console.error('[order] price recompute failed:', e?.message);
      payload.items = payload.items.map((it: any) => ({ ...it, price: Math.max(0, Number(it.price) || 0) }));
    }
  }

  const doc = new Order(payload);
  await doc.save();

  // Atomically claim the table only if it's still AVAILABLE. Two concurrent
  // orders for the same table can both pass the fast-fail check above, but only
  // one will win this conditional update — the loser is rolled back.
  if (needsTable) {
    const claimed = await Table.findOneAndUpdate(
      { business_id: payload.business_id, tableNo: payload.tableNo, status: 'AVAILABLE' },
      { status: 'OCCUPIED', activeOrderId: doc._id },
      { new: true },
    );
    if (!claimed) {
      await Order.deleteOne({ _id: doc._id });
      throw new AppError(400, `Table ${payload.tableNo} is already occupied`);
    }
    const io = getSocketIO();
    io.to(`business_${payload.business_id}`).emit('table_updated', claimed);
  }

  // Broadcast new order to KDS
  const io = getSocketIO();
  io.to(`business_${payload.business_id}`).emit('new_order', doc);

  // Push notification to the business owner.
  try {
    const { Business } = await import('../business/business.model');
    const { User } = await import('../user/user/user.model');
    const business = await Business.findById(payload.business_id).select('owner name').lean();
    if (business?.owner) {
      const owner = await User.findById(business.owner).select('expoPushToken').lean();
      const token = (owner as any)?.expoPushToken;
      if (token) {
        const tableLabel = payload.tableNo ? ` — Table ${payload.tableNo}` : '';
        await sendExpoPush({
          to: token,
          title: '🛎️ New Order',
          body: `New order received${tableLabel}`,
          sound: 'default',
          data: { type: 'NEW_ORDER', businessId: String(payload.business_id) },
        });
      }
    }
  } catch (e: any) {
    console.error('[push] order notify failed:', e?.message);
  }

  // Also push to staff who have kitchen access (so the kitchen is alerted even if
  // the KDS screen isn't open). Best-effort — never blocks order creation.
  try {
    const { RotaRole } = await import('../rota/role/role.model');
    const { RotaEmployee } = await import('../rota/employee/employee.model');

    const roles = await RotaRole.find({ business: payload.business_id, isDeleted: false })
      .select('_id permissions')
      .lean();
    const kitchenRoleIds = roles
      .filter((r: any) => r.permissions?.canAccessKitchen || r.permissions?.isSuperAdmin)
      .map((r: any) => String(r._id));

    if (kitchenRoleIds.length) {
      const staff = await RotaEmployee.find({
        business: payload.business_id,
        isDeleted: false,
        status: 'ACTIVE',
        role: { $in: kitchenRoleIds },
        expoPushToken: { $ne: null },
      })
        .select('expoPushToken')
        .lean();

      const tokens = staff.map((s: any) => s.expoPushToken).filter(Boolean);
      if (tokens.length) {
        const tableLabel = payload.tableNo ? ` — Table ${payload.tableNo}` : '';
        await sendExpoPush({
          to: tokens,
          title: '🍳 New Kitchen Order',
          body: `New order to prepare${tableLabel}`,
          sound: 'default',
          data: { type: 'NEW_KITCHEN_ORDER', businessId: String(payload.business_id) },
        });
      }
    }
  } catch (e: any) {
    console.error('[push] kitchen notify failed:', e?.message);
  }

  // Email the business owner about the new order. Fire-and-forget so a slow or
  // failing mail server NEVER delays or breaks order creation. Owner only
  // (owner User.email + business contact email) — staff already get the push
  // above, so we don't flood every staff inbox on each order.
  void (async () => {
    try {
      const { resolveBusinessRecipients } = await import('../../utils/lib/businessRecipients');
      const sendEmail = (await import('../../utils/lib/sendEmail')).default;
      const { newOrderOwnerTemplate, orderTypeLabel } = await import('./order.template');

      const { businessName, recipients, notify } = await resolveBusinessRecipients(String(payload.business_id));
      if (notify.emailOnNewOrder && recipients.length) {
        const subject = `🛎️ New ${orderTypeLabel(doc.orderType)} order — ${businessName}`;
        const message = newOrderOwnerTemplate({ businessName, order: doc });
        for (const email of recipients) {
          try {
            await sendEmail({ email, fromName: businessName, subject, message });
          } catch (mailErr: any) {
            console.error('[order] owner email failed for', email, mailErr?.message);
          }
        }
      }
    } catch (e: any) {
      console.error('[order] owner email block failed:', e?.message);
    }
  })();

  return doc;
};

export const addItemsToOrder = async (id: string, business_id: string, newItems: any[]) => {
  const order = await Order.findOne({ _id: id, business_id });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.status !== 'pending' || order.paymentStatus === 'PAID') {
    throw new AppError(400, "Cannot add items to a completed or paid order");
  }

  // Determine the next round number
  const currentMaxRound = order.items.reduce((max: number, item: any) => Math.max(max, item.round || 1), 0);
  const nextRound = currentMaxRound + 1;

  // Same rule as createOrder: never trust a client-supplied price. This path
  // had no check at all, so a second round could be added at any price the
  // caller chose — and the two order paths could bill the same dish
  // differently depending on which screen the waiter used.
  let priceMap = new Map<string, number>();
  try {
    priceMap = await catalogPriceMap(
      newItems.map((it: any) => it.productId || it.product_id || it._id).filter(Boolean),
      business_id,
    );
  } catch (e: any) {
    // A catalog lookup failure must not block food reaching the kitchen; fall
    // back to the submitted prices, clamped, exactly as createOrder does.
    console.error('[order] add-items price lookup failed:', e?.message);
  }

  // Append new items
  const itemsToAdd = newItems.map(item => {
    const pid = String(item.productId || item.product_id || item._id || '');
    const catalogPrice = priceMap.get(pid);
    return {
      ...item,
      price: catalogPrice != null ? catalogPrice : Math.max(0, Number(item.price) || 0),
      kitchenStatus: "SENT_TO_KITCHEN",
      sentToKitchenAt: new Date(),
      round: nextRound,
    };
  });

  order.items.push(...itemsToAdd);
  
  // Recalculate totals
  order.totalQty += itemsToAdd.reduce((sum, item) => sum + (item.quantity || 1), 0);
  order.subtotal += itemsToAdd.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  if (order.membershipDiscount?.applied) {
     order.membershipDiscount.payable = order.subtotal - (order.membershipDiscount.discountAmount || 0);
  } else if (order.membershipDiscount) {
     order.membershipDiscount.payable = order.subtotal;
  }

  await order.save();

  // Broadcast to KDS that new items were added
  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('order_items_added', { orderId: order._id, newItems: itemsToAdd, round: nextRound });

  return order;
};

export const updateOrderItemKitchenStatus = async (orderId: string, itemId: string, business_id: string, status: string) => {
  const order = await Order.findOne({ _id: orderId, business_id });
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const item = order.items.find((i: any) => i._id.toString() === itemId);
  if (!item) {
    throw new AppError(404, "Item not found in order");
  }

  item.kitchenStatus = status as any;
  await order.save();

  const io = getSocketIO();

  // When an item is ready, check if the original waiter is still clocked in.
  // If they've clocked out (shift ended), fall back to all active staff so
  // nobody is left waiting for a notification that will never come.
  let fallbackToAll = false;
  if (status === 'DONE' && order.user_id) {
    try {
      const emp = await RotaEmployee.findOne({ user: order.user_id, business: business_id }).lean();
      if (emp) {
        const openSheet = await RotaTimesheet.findOne({
          employee: emp._id,
          business: business_id,
          clockOut: null,
        }).lean();
        if (!openSheet) fallbackToAll = true; // waiter clocked out → notify everyone
      }
    } catch (_) {
      // On any lookup failure, default to targeted (safe fallback)
    }
  }

  io.to(`business_${business_id}`).emit('order_item_status_updated', {
    orderId,
    itemId,
    status,
    userId: fallbackToAll ? null : order.user_id,
    fallbackToAll, // true = original waiter is off-shift, any active waiter should pick it up
  });

  return order;
};

export const listOrders = async ({
  business_id,
  user_id,
  status,
}: {
  business_id?: string;
  user_id?: string;
  status?: string;
}) => {
  const q: any = {};
  if (business_id) q.business_id = business_id;
  if (user_id) q.user_id = user_id;
  if (status) q.status = status;

  return Order.find(q).sort({ createdAt: -1 });
};

export const getOrderById = async (id: string, business_id: string) => {
  return Order.findOne({ _id: id, business_id });
};

export const updateOrder = async (id: string, business_id: string, updates: any) => {
  const order = await Order.findOne({ _id: id, business_id });
  if (!order) throw new AppError(404, "Order not found");

  const oldPaymentStatus = order.paymentStatus;

  // Prices as they stand before this edit, keyed by line. A price on an order
  // is a historical record — it is what the customer agreed to pay. Re-reading
  // the catalog for lines that are already on the order would silently re-price
  // food that was ordered, cooked and eaten at yesterday's price the moment
  // somebody edits the menu, so a waiter fixing a typo in a customer's name
  // could change the bill.
  const priorPrices = new Map<string, number>(
    (order.items || []).map((it: any) => [String(it._id), Number(it.price) || 0])
  );

  Object.assign(order, updates);

  // Editing the item list has to move the money with it. This used to be a
  // bare Object.assign, so removing a dish left `subtotal` untouched — and
  // since recordPayment bills from computeGrandTotal(order), which reads
  // `subtotal`, the customer was still charged for food that was taken off
  // the order. Prices are re-read from the catalog for the same reason they
  // are on create: a client must not be able to name its own price.
  //
  // Only runs when the caller actually sent items; callers that just flip
  // paymentStatus or kitchenStatus are left alone.
  if (Array.isArray(updates?.items)) {
    try {
      // Only lines that are NEW to this order need a catalog price. Anything
      // already on it keeps what it was sold at.
      const addedLines = order.items.filter((it: any) => !priorPrices.has(String(it._id)));
      const priceMap = await catalogPriceMap(
        addedLines
          .map((it: any) => it.productId || it.product_id || it._id)
          .filter(Boolean),
        business_id,
      );
      order.items.forEach((it: any) => {
        const prior = priorPrices.get(String(it._id));
        if (prior != null) { it.price = prior; return; }
        // New line — priced from the catalog for the same reason create does:
        // a client must not be able to name its own price.
        const catalogPrice = priceMap.get(String(it.productId || it.product_id || it._id || ''));
        it.price = catalogPrice != null ? catalogPrice : Math.max(0, Number(it.price) || 0);
      });
    } catch (e: any) {
      console.error('[order] update price re-read failed:', e?.message);
    }

    // VOIDED lines stay in the array for audit but are not billed — the same
    // rule the void-approval path applies to the rollups.
    const billable = order.items.filter((it: any) => it.kitchenStatus !== 'VOIDED');
    order.totalQty = billable.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0);
    order.subtotal = billable.reduce(
      (s: number, it: any) => s + Number(it.price || 0) * (Number(it.quantity) || 1),
      0,
    );
    if (order.membershipDiscount?.applied) {
      order.membershipDiscount.payable = Math.max(
        0,
        order.subtotal - (Number(order.membershipDiscount.discountAmount) || 0),
      );
    } else if (order.membershipDiscount) {
      order.membershipDiscount.payable = order.subtotal;
    }
  }

  await order.save();

  // If payment status changed to PAID, free up the table
  if (oldPaymentStatus !== 'PAID' && order.paymentStatus === 'PAID') {
    if (order.orderType === 'dine-in' && order.tableNo) {
      const table = await Table.findOne({ business_id, tableNo: order.tableNo });
      if (table && table.activeOrderId?.toString() === order._id.toString()) {
        table.status = 'AVAILABLE';
        table.activeOrderId = null;
        await table.save();
        
        const io = getSocketIO();
        io.to(`business_${business_id}`).emit('table_updated', table);
      }
    }
  }

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit('order_updated', order);

  return order;
};

// Compute what the customer owes right now (subtotal minus discount).
const computeGrandTotal = (order: any): number => {
  const sub = Number(order.subtotal) || 0;
  const disc = Number(order.membershipDiscount?.discountAmount) || 0;
  return Math.max(0, sub - disc);
};

export const recordPayment = async (
  orderId: string,
  business_id: string,
  payload: {
    method: string;
    amount: number;
    tenderedAmount?: number;
    change?: number;
    reference?: string;
    paidBy?: string;
    paidByName?: string;
    note?: string;
  }
) => {
  const order = await Order.findOne({ _id: orderId, business_id });
  if (!order) throw new AppError(404, "Order not found");
  if (order.paymentStatus === "PAID") {
    throw new AppError(400, "Order is already fully paid");
  }

  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(400, "Payment amount must be greater than 0");
  }

  const grandTotal = computeGrandTotal(order);
  const alreadyPaid = Number(order.amountPaid) || 0;
  const remaining = Math.max(0, grandTotal - alreadyPaid);

  // Don't over-collect — clamp to remaining (any overpay becomes change for cash)
  const applied = Math.min(amount, remaining);
  const change =
    payload.method === "CASH" && payload.tenderedAmount
      ? Math.max(0, Number(payload.tenderedAmount) - applied)
      : Number(payload.change) || 0;

  order.payments.push({
    method: payload.method,
    amount: applied,
    tenderedAmount: payload.tenderedAmount,
    change,
    reference: payload.reference || "",
    paidBy: payload.paidBy,
    paidByName: payload.paidByName || "",
    paidAt: new Date(),
    note: payload.note || "",
  } as any);

  order.amountPaid = alreadyPaid + applied;
  order.grandTotal = grandTotal;

  if (order.amountPaid >= grandTotal) {
    order.paymentStatus = "PAID";
    order.paidInFullAt = new Date();
  } else if (order.amountPaid > 0) {
    order.paymentStatus = "PARTIAL";
  }

  await order.save();

  // When fully paid, free the table.
  if (order.paymentStatus === "PAID" && order.orderType === "dine-in" && order.tableNo) {
    const table = await Table.findOne({ business_id, tableNo: order.tableNo });
    if (table && table.activeOrderId?.toString() === order._id.toString()) {
      table.status = "AVAILABLE";
      table.activeOrderId = null;
      await table.save();
      const io = getSocketIO();
      io.to(`business_${business_id}`).emit("table_updated", table);
    }
  }

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit("order_updated", order);
  io.to(`business_${business_id}`).emit("order_payment_recorded", {
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    amountPaid: order.amountPaid,
    grandTotal,
  });

  return order;
};

export const requestItemVoid = async (
  orderId: string,
  itemId: string,
  business_id: string,
  payload: { reason: string; requestedBy?: string; requestedByName?: string }
) => {
  if (!payload?.reason?.trim()) {
    throw new AppError(400, "Reason is required");
  }
  const order = await Order.findOne({ _id: orderId, business_id });
  if (!order) throw new AppError(404, "Order not found");

  const item = order.items.find((i: any) => i._id.toString() === itemId);
  if (!item) throw new AppError(404, "Item not found in order");

  // Block duplicate pending requests for the same item.
  const existing = order.voidRequests.find(
    (v: any) => v.itemId?.toString() === itemId && v.status === "PENDING"
  );
  if (existing) {
    throw new AppError(400, "A cancel request is already pending for this item");
  }

  order.voidRequests.push({
    itemId: item._id,
    itemName: item.name,
    quantity: item.quantity,
    reason: payload.reason.trim(),
    requestedBy: payload.requestedBy,
    requestedByName: payload.requestedByName || "",
    requestedAt: new Date(),
    status: "PENDING",
  } as any);

  await order.save();

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit("order_void_requested", {
    orderId: order._id,
    itemId,
    itemName: item.name,
    reason: payload.reason.trim(),
  });
  io.to(`business_${business_id}`).emit("order_updated", order);

  return order;
};

export const decideItemVoid = async (
  orderId: string,
  voidId: string,
  business_id: string,
  payload: {
    decision: "APPROVED" | "REJECTED";
    decidedBy?: string;
    decidedByName?: string;
    decisionNote?: string;
  }
) => {
  if (payload?.decision !== "APPROVED" && payload?.decision !== "REJECTED") {
    throw new AppError(400, "decision must be APPROVED or REJECTED");
  }
  const order = await Order.findOne({ _id: orderId, business_id });
  if (!order) throw new AppError(404, "Order not found");

  const vr = order.voidRequests.find((v: any) => v._id.toString() === voidId);
  if (!vr) throw new AppError(404, "Void request not found");
  if (vr.status !== "PENDING") {
    throw new AppError(400, "Void request has already been decided");
  }

  vr.status = payload.decision;
  vr.decidedBy = payload.decidedBy as any;
  vr.decidedByName = payload.decidedByName || "";
  vr.decidedAt = new Date();
  vr.decisionNote = payload.decisionNote || "";

  // On approval — flag item, reduce totals.
  if (payload.decision === "APPROVED") {
    const item = order.items.find((i: any) => i._id.toString() === vr.itemId?.toString());
    if (item) {
      const removeQty = Number(vr.quantity) || Number(item.quantity) || 0;
      const removePrice = Number(item.price) * removeQty;
      item.kitchenStatus = "VOIDED";
      // Don't physically remove — keep audit. Subtract from rollups.
      order.totalQty = Math.max(0, (Number(order.totalQty) || 0) - removeQty);
      order.subtotal = Math.max(0, (Number(order.subtotal) || 0) - removePrice);
      if (order.membershipDiscount?.applied) {
        order.membershipDiscount.payable = Math.max(
          0,
          order.subtotal - (Number(order.membershipDiscount.discountAmount) || 0)
        );
      } else if (order.membershipDiscount) {
        order.membershipDiscount.payable = order.subtotal;
      }
    }
  }

  await order.save();

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit("order_void_decided", {
    orderId: order._id,
    voidId,
    decision: payload.decision,
  });
  io.to(`business_${business_id}`).emit("order_updated", order);

  return order;
};

export const transferTable = async (
  orderId: string,
  business_id: string,
  payload: { toTable: string; transferredBy?: string; transferredByName?: string; reason?: string }
) => {
  const toTable = (payload?.toTable || "").trim();
  if (!toTable) throw new AppError(400, "toTable is required");

  const order = await Order.findOne({ _id: orderId, business_id });
  if (!order) throw new AppError(404, "Order not found");
  if (order.paymentStatus === "PAID") {
    throw new AppError(400, "Cannot transfer a paid order");
  }

  const fromTable = order.tableNo || "";
  if (fromTable === toTable) {
    throw new AppError(400, "Already on that table");
  }

  // Destination table must be free (or auto-create).
  let destTable = await Table.findOne({ business_id, tableNo: toTable });
  if (destTable && destTable.status !== "AVAILABLE") {
    throw new AppError(400, `Table ${toTable} is already occupied`);
  }
  if (!destTable) {
    destTable = await Table.create({
      business_id,
      tableNo: toTable,
      capacity: order.guestCount && order.guestCount > 0 ? order.guestCount : 4,
      status: "AVAILABLE",
    });
    const io = getSocketIO();
    io.to(`business_${business_id}`).emit("table_added", destTable);
  }

  // Free old table.
  if (fromTable) {
    const oldTable = await Table.findOne({ business_id, tableNo: fromTable });
    if (oldTable && oldTable.activeOrderId?.toString() === order._id.toString()) {
      oldTable.status = "AVAILABLE";
      oldTable.activeOrderId = null;
      await oldTable.save();
      const io = getSocketIO();
      io.to(`business_${business_id}`).emit("table_updated", oldTable);
    }
  }

  // Occupy new table.
  destTable.status = "OCCUPIED";
  destTable.activeOrderId = order._id as any;
  await destTable.save();

  order.tableTransfers.push({
    fromTable,
    toTable,
    transferredBy: payload.transferredBy,
    transferredByName: payload.transferredByName || "",
    reason: payload.reason || "",
    transferredAt: new Date(),
  } as any);
  order.tableNo = toTable;
  await order.save();

  const io = getSocketIO();
  io.to(`business_${business_id}`).emit("table_updated", destTable);
  io.to(`business_${business_id}`).emit("order_updated", order);
  io.to(`business_${business_id}`).emit("order_table_transferred", {
    orderId: order._id,
    fromTable,
    toTable,
  });

  return order;
};

export const deleteOrder = async (id: string, business_id: string) => {
  const order = await Order.findOne({ _id: id, business_id });
  if (order && order.orderType === 'dine-in' && order.tableNo) {
    const table = await Table.findOne({ business_id, tableNo: order.tableNo });
    if (table && table.activeOrderId?.toString() === order._id.toString()) {
      table.status = 'AVAILABLE';
      table.activeOrderId = null;
      await table.save();
      const io = getSocketIO();
      io.to(`business_${business_id}`).emit('table_updated', table);
    }
  }

  await Order.findOneAndDelete({ _id: id, business_id });
  return { message: "Order deleted successfully" };
};