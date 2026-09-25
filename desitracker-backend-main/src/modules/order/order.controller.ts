import { Request, Response } from "express";
import * as orderService from "./order.service";
import { Types } from "mongoose";
import { resolvePrincipal, isBusinessMember } from "../../utils/lib/businessAccess";

// Who is placing this order decides what discount it may carry. The client's
// numbers are never used for the amount — the service works that out from the
// percent (applyDiscount).
//   staff of this business  -> the percent they chose (member or manual reason)
//   signed-in member        -> this business's own memberDiscountPercent, and
//                              the order is linked to THEM, not to whatever
//                              member_id the body names
//   anyone else (guest)     -> no discount, no member link
const resolveOrderDiscount = async (req: Request, business_id: string) => {
  const body = req.body || {};
  const principal = await resolvePrincipal(req);
  if (principal && principal.role !== "member" && await isBusinessMember(principal, business_id)) {
    const md = body.membershipDiscount || {};
    const percent = md.applied ? Number(md.percent) || 0 : 0;
    return {
      percent,
      offer: md.offer ?? null,
      member: body.member_id || null,
      memberSerial: body.memberSerial || null,
    };
  }
  if (principal?.role === "member") {
    // Loaded lazily, the same way the service loads Business, to keep this
    // module out of any model import cycle.
    const { Business } = await import("../business/business.model");
    const { Member } = await import("../members/member.model");
    const [biz, me] = await Promise.all([
      Business.findById(business_id).select("memberDiscountPercent").lean(),
      Member.findById(principal.id).select("serialNumber active").lean(),
    ]);
    if (me && (me as any).active !== false) {
      return {
        percent: Number((biz as any)?.memberDiscountPercent) || 0,
        offer: null,
        member: String((me as any)._id),
        memberSerial: (me as any).serialNumber || null,
      };
    }
  }
  return { percent: 0, offer: null, member: null, memberSerial: null };
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      business_id,
      user_id,
      // Who actually took the order. user_id is the business OWNER (products
      // are keyed by them), so without these two the app cannot tell one
      // waiter's tickets from another's — every Ready-to-Serve list came back
      // empty because the only id on the order belonged to the owner.
      staffUserId,
      staffName,
      businessName,
      tableNo,
      notes,
      items,
      totals,
      currency,
      status,
      customerName,
      customerPhone,
      customerEmail,
      guestCount,
      orderType,
      deliveryAddress,
      deliveryFee,
      requestedTime,
    } = req.body;

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "items are required." });
      return;
    }

    // Order type is what separates a table, a collection and a doorstep. The
    // API used to accept a delivery with no address and no phone, so a broken
    // order could be written by any client. Enforce it here, not only in the
    // apps.
    const type = orderType || "dine-in";
    if (!["dine-in", "takeaway", "delivery"].includes(type)) {
      res.status(400).json({ error: "orderType must be dine-in, takeaway or delivery." });
      return;
    }
    if (type !== "dine-in") {
      // Nobody is at a table: the phone number is the only way to reach them.
      if (!String(customerName || "").trim()) {
        res.status(400).json({ error: "customerName is required for pickup and delivery orders." });
        return;
      }
      if (!String(customerPhone || "").trim()) {
        res.status(400).json({ error: "customerPhone is required for pickup and delivery orders." });
        return;
      }
    }
    if (type === "delivery" && !String(deliveryAddress || "").trim()) {
      res.status(400).json({ error: "deliveryAddress is required for delivery orders." });
      return;
    }

    if (!Types.ObjectId.isValid(String(business_id))) {
      res.status(400).json({ error: "business_id is invalid." });
      return;
    }
    const discount = await resolveOrderDiscount(req, String(business_id));

    const created = await orderService.createOrder({
      business_id,
      user_id,
      staffUserId: staffUserId || undefined,
      staffName: staffName || "",
      businessName,
      // A table number only means something for dine-in. Carrying one on a
      // pickup order made the service occupy — and later free — a table that
      // nobody ever sat at.
      tableNo: type === "dine-in" ? tableNo : "",
      notes,
      items,
      totalQty: Number(totals?.totalQty || 0),
      subtotal: Number(totals?.subtotal || 0),
      memberSerial: discount.memberSerial,
      member: discount.member,
      // Amount and payable are filled in by the service from the server-side
      // subtotal; only the percent decided above goes in.
      membershipDiscount: {
        applied: discount.percent > 0,
        percent: discount.percent,
        discountAmount: 0,
        payable: 0,
        offer: discount.offer,
      },
      currency,
      status: status || "pending",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      guestCount: guestCount ? Number(guestCount) : 0,
      orderType: type,
      deliveryAddress: deliveryAddress || "",
      deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
      requestedTime: requestedTime || "",
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create order" });
  }
};

const listOrders = async (req: Request, res: Response) => {
  try {
    const { business_id, user_id, member_id, status, from, to, limit } = (req.query as any) as {
      business_id?: string;
      user_id?: string;
      member_id?: string;
      status?: string;
      from?: string;
      to?: string;
      limit?: string;
    };

    // Allow listing by business (staff/owner view), by user (a regular
    // customer's own history), or by member (a member's own history --
    // separate from user_id because a staff-placed order's user_id is the
    // business owner, not the member who was seated). At least one scope is
    // required so we never return the whole orders collection.
    if (!business_id && !user_id && !member_id) {
      res.status(400).json({ error: "business_id, user_id or member_id is required." });
      return;
    }

    const items = await orderService.listOrders({ business_id, user_id, member_id, status, from, to, limit });
    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch orders" });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const { business_id } = (req.query as any) as { business_id?: string };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const one = await orderService.getOrderById((req.params.id as string), business_id);
    if (!one) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(one);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch order" });
  }
};

const updateOrder = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.body;

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const updated = await orderService.updateOrder((req.params.id as string), business_id, req.body);
    if (!updated) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to update order" });
  }
};

const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { business_id } = (req.query as any) as { business_id?: string };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const result = await orderService.deleteOrder((req.params.id as string), business_id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to delete order" });
  }
};

const addItemsToOrder = async (req: Request, res: Response) => {
  try {
    const { business_id, items } = req.body;
    if (!business_id || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "business_id and items array are required." });
      return;
    }

    const updated = await orderService.addItemsToOrder((req.params.id as string), business_id, items);
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to add items to order" });
  }
};

const updateOrderItemKitchenStatus = async (req: Request, res: Response) => {
  try {
    const { business_id, status } = req.body;
    if (!business_id || !status) {
      res.status(400).json({ error: "business_id and status are required." });
      return;
    }

    const updated = await orderService.updateOrderItemKitchenStatus((req.params.id as string), (req.params.itemId as string), business_id, status);
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to update item kitchen status" });
  }
};

const recordPayment = async (req: Request, res: Response) => {
  try {
    const { business_id, method, amount, tenderedAmount, change, reference, paidBy, paidByName, note } = req.body;
    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }
    if (!method || amount == null) {
      res.status(400).json({ error: "method and amount are required." });
      return;
    }
    const updated = await orderService.recordPayment((req.params.id as string), business_id, {
      method, amount, tenderedAmount, change, reference, paidBy, paidByName, note,
    });
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Failed to record payment" });
  }
};

const requestItemVoid = async (req: Request, res: Response) => {
  try {
    const { business_id, reason, requestedBy, requestedByName } = req.body;
    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }
    const updated = await orderService.requestItemVoid(
      (req.params.id as string), (req.params.itemId as string), business_id,
      { reason, requestedBy, requestedByName }
    );
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Failed to request void" });
  }
};

const decideItemVoid = async (req: Request, res: Response) => {
  try {
    const { business_id, decision, decidedBy, decidedByName, decisionNote } = req.body;
    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }
    const updated = await orderService.decideItemVoid(
      (req.params.id as string), (req.params.voidId as string), business_id,
      { decision, decidedBy, decidedByName, decisionNote }
    );
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Failed to decide void" });
  }
};

const transferTable = async (req: Request, res: Response) => {
  try {
    const { business_id, toTable, transferredBy, transferredByName, reason } = req.body;
    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }
    const updated = await orderService.transferTable((req.params.id as string), business_id, {
      toTable, transferredBy, transferredByName, reason,
    });
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(err?.statusCode || 500).json({ error: err?.message || "Failed to transfer table" });
  }
};

export const OrderControllers = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addItemsToOrder,
  updateOrderItemKitchenStatus,
  recordPayment,
  requestItemVoid,
  decideItemVoid,
  transferTable,
};