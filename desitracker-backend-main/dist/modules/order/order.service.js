"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.transferTable = exports.decideItemVoid = exports.requestItemVoid = exports.recordPayment = exports.updateOrder = exports.getOrderById = exports.listOrders = exports.updateOrderItemKitchenStatus = exports.addItemsToOrder = exports.createOrder = void 0;
const order_model_1 = require("./order.model");
const table_model_1 = require("../table/table.model");
const socket_1 = require("../../utils/socket");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const push_1 = require("../../utils/lib/push");
const employee_model_1 = require("../rota/employee/employee.model");
const timesheet_model_1 = require("../rota/timesheet/timesheet.model");
// What a product actually costs right now, discount included.
//
// This mirrors the `final_price` virtual on the product schema. It has to be
// duplicated rather than reused because the lookup below uses `.lean()`, and
// lean documents carry no virtuals — the previous `.select('price')` therefore
// returned the pre-discount price and quietly overwrote the discounted price
// the waiter had quoted at the table. A dish on 20% off was shown at 80 and
// billed at 100.
const effectivePrice = (p, now = new Date()) => {
    const base = Number(p === null || p === void 0 ? void 0 : p.price) || 0;
    const pct = Number(p === null || p === void 0 ? void 0 : p.discount_percent) || 0;
    if (pct <= 0)
        return base;
    const start = (p === null || p === void 0 ? void 0 : p.discount_start) ? new Date(p.discount_start) : null;
    const end = (p === null || p === void 0 ? void 0 : p.discount_end) ? new Date(p.discount_end) : null;
    if (start && now < start)
        return base; // discount hasn't started
    if (end && now > end)
        return base; // discount has expired
    return Math.round(base * (1 - pct / 100) * 100) / 100;
};
// Catalog prices for a set of product ids, scoped to one business so an id
// from another tenant can never set a price here.
const catalogPriceMap = (ids, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    const map = new Map();
    if (!ids.length)
        return map;
    const { default: Product } = yield Promise.resolve().then(() => __importStar(require('../product/product.model')));
    const products = yield Product.find({ _id: { $in: ids }, business_id })
        .select('price discount_percent discount_start discount_end')
        .lean();
    products.forEach((p) => map.set(String(p._id), effectivePrice(p)));
    return map;
});
const createOrder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // If this is a dine-in order and tableNo is provided, link to the table.
    // Auto-create the table record if it doesn't exist yet — staff often type a
    // table number without first configuring it in the floor view.
    const needsTable = (payload.orderType || 'dine-in') === 'dine-in' && !!payload.tableNo;
    if (needsTable) {
        // Ensure the table exists WITHOUT a find-then-create race — the unique index
        // on { business_id, tableNo } backs this upsert.
        const existing = yield table_model_1.Table.findOneAndUpdate({ business_id: payload.business_id, tableNo: payload.tableNo }, {
            $setOnInsert: {
                business_id: payload.business_id,
                tableNo: payload.tableNo,
                capacity: payload.guestCount && payload.guestCount > 0 ? payload.guestCount : 4,
                status: 'AVAILABLE',
            },
        }, { new: true, upsert: true });
        // Fast-fail before doing order work; the authoritative claim happens
        // atomically after the order is saved (below).
        if (existing.status !== 'AVAILABLE') {
            throw new AppError_1.default(400, `Table ${payload.tableNo} is already occupied`);
        }
    }
    // Set default initial statuses
    payload.status = "pending";
    payload.paymentStatus = "UNPAID";
    // Flatten totals from nested payload (frontend sends { totals: { totalQty, subtotal, grandTotal } })
    if (payload.totals) {
        if (payload.totals.totalQty != null)
            payload.totalQty = payload.totals.totalQty;
        if (payload.totals.subtotal != null && payload.subtotal == null)
            payload.subtotal = payload.totals.subtotal;
    }
    if (payload.items && Array.isArray(payload.items)) {
        payload.items.forEach((item) => {
            item.kitchenStatus = "SENT_TO_KITCHEN";
            item.sentToKitchenAt = new Date();
            item.round = 1;
        });
        // Fallback: compute totalQty from items if not provided
        if (payload.totalQty == null) {
            payload.totalQty = payload.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
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
                .map((it) => it.productId || it.product_id || it._id)
                .filter(Boolean);
            const priceMap = yield catalogPriceMap(ids, payload.business_id);
            payload.items = payload.items.map((it) => {
                const pid = String(it.productId || it.product_id || it._id || '');
                const catalogPrice = priceMap.get(pid);
                const price = catalogPrice != null ? catalogPrice : Math.max(0, Number(it.price) || 0);
                return Object.assign(Object.assign({}, it), { price });
            });
            const subtotal = payload.items.reduce((s, it) => s + Number(it.price) * (Number(it.quantity) || 1), 0);
            payload.subtotal = subtotal;
            if (payload.membershipDiscount && !payload.membershipDiscount.applied) {
                payload.membershipDiscount.payable = subtotal;
            }
        }
        catch (e) {
            // Defensive: if catalog lookup fails (e.g. malformed id), fall back to the
            // submitted prices rather than blocking the order. Still clamp negatives.
            console.error('[order] price recompute failed:', e === null || e === void 0 ? void 0 : e.message);
            payload.items = payload.items.map((it) => (Object.assign(Object.assign({}, it), { price: Math.max(0, Number(it.price) || 0) })));
        }
    }
    const doc = new order_model_1.Order(payload);
    yield doc.save();
    // Atomically claim the table only if it's still AVAILABLE. Two concurrent
    // orders for the same table can both pass the fast-fail check above, but only
    // one will win this conditional update — the loser is rolled back.
    if (needsTable) {
        const claimed = yield table_model_1.Table.findOneAndUpdate({ business_id: payload.business_id, tableNo: payload.tableNo, status: 'AVAILABLE' }, { status: 'OCCUPIED', activeOrderId: doc._id }, { new: true });
        if (!claimed) {
            yield order_model_1.Order.deleteOne({ _id: doc._id });
            throw new AppError_1.default(400, `Table ${payload.tableNo} is already occupied`);
        }
        const io = (0, socket_1.getSocketIO)();
        io.to(`business_${payload.business_id}`).emit('table_updated', claimed);
    }
    // Broadcast new order to KDS
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${payload.business_id}`).emit('new_order', doc);
    // Push notification to the business owner.
    try {
        const { Business } = yield Promise.resolve().then(() => __importStar(require('../business/business.model')));
        const { User } = yield Promise.resolve().then(() => __importStar(require('../user/user/user.model')));
        const business = yield Business.findById(payload.business_id).select('owner name').lean();
        if (business === null || business === void 0 ? void 0 : business.owner) {
            const owner = yield User.findById(business.owner).select('expoPushToken').lean();
            const token = owner === null || owner === void 0 ? void 0 : owner.expoPushToken;
            if (token) {
                const tableLabel = payload.tableNo ? ` — Table ${payload.tableNo}` : '';
                yield (0, push_1.sendExpoPush)({
                    to: token,
                    title: '🛎️ New Order',
                    body: `New order received${tableLabel}`,
                    sound: 'default',
                    data: { type: 'NEW_ORDER', businessId: String(payload.business_id) },
                });
            }
        }
    }
    catch (e) {
        console.error('[push] order notify failed:', e === null || e === void 0 ? void 0 : e.message);
    }
    // Also push to staff who have kitchen access (so the kitchen is alerted even if
    // the KDS screen isn't open). Best-effort — never blocks order creation.
    try {
        const { RotaRole } = yield Promise.resolve().then(() => __importStar(require('../rota/role/role.model')));
        const { RotaEmployee } = yield Promise.resolve().then(() => __importStar(require('../rota/employee/employee.model')));
        const roles = yield RotaRole.find({ business: payload.business_id, isDeleted: false })
            .select('_id permissions')
            .lean();
        const kitchenRoleIds = roles
            .filter((r) => { var _a, _b; return ((_a = r.permissions) === null || _a === void 0 ? void 0 : _a.canAccessKitchen) || ((_b = r.permissions) === null || _b === void 0 ? void 0 : _b.isSuperAdmin); })
            .map((r) => String(r._id));
        if (kitchenRoleIds.length) {
            const staff = yield RotaEmployee.find({
                business: payload.business_id,
                isDeleted: false,
                status: 'ACTIVE',
                role: { $in: kitchenRoleIds },
                expoPushToken: { $ne: null },
            })
                .select('expoPushToken')
                .lean();
            const tokens = staff.map((s) => s.expoPushToken).filter(Boolean);
            if (tokens.length) {
                const tableLabel = payload.tableNo ? ` — Table ${payload.tableNo}` : '';
                yield (0, push_1.sendExpoPush)({
                    to: tokens,
                    title: '🍳 New Kitchen Order',
                    body: `New order to prepare${tableLabel}`,
                    sound: 'default',
                    data: { type: 'NEW_KITCHEN_ORDER', businessId: String(payload.business_id) },
                });
            }
        }
    }
    catch (e) {
        console.error('[push] kitchen notify failed:', e === null || e === void 0 ? void 0 : e.message);
    }
    // Email the business owner about the new order. Fire-and-forget so a slow or
    // failing mail server NEVER delays or breaks order creation. Owner only
    // (owner User.email + business contact email) — staff already get the push
    // above, so we don't flood every staff inbox on each order.
    void (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { resolveBusinessRecipients } = yield Promise.resolve().then(() => __importStar(require('../../utils/lib/businessRecipients')));
            const sendEmail = (yield Promise.resolve().then(() => __importStar(require('../../utils/lib/sendEmail')))).default;
            const { newOrderOwnerTemplate, orderTypeLabel } = yield Promise.resolve().then(() => __importStar(require('./order.template')));
            const { businessName, recipients, notify } = yield resolveBusinessRecipients(String(payload.business_id));
            if (notify.emailOnNewOrder && recipients.length) {
                const subject = `🛎️ New ${orderTypeLabel(doc.orderType)} order — ${businessName}`;
                const message = newOrderOwnerTemplate({ businessName, order: doc });
                for (const email of recipients) {
                    try {
                        yield sendEmail({ email, fromName: businessName, subject, message });
                    }
                    catch (mailErr) {
                        console.error('[order] owner email failed for', email, mailErr === null || mailErr === void 0 ? void 0 : mailErr.message);
                    }
                }
            }
        }
        catch (e) {
            console.error('[order] owner email block failed:', e === null || e === void 0 ? void 0 : e.message);
        }
    }))();
    return doc;
});
exports.createOrder = createOrder;
const addItemsToOrder = (id, business_id, newItems) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const order = yield order_model_1.Order.findOne({ _id: id, business_id });
    if (!order) {
        throw new AppError_1.default(404, "Order not found");
    }
    if (order.status !== 'pending' || order.paymentStatus === 'PAID') {
        throw new AppError_1.default(400, "Cannot add items to a completed or paid order");
    }
    // Determine the next round number
    const currentMaxRound = order.items.reduce((max, item) => Math.max(max, item.round || 1), 0);
    const nextRound = currentMaxRound + 1;
    // Same rule as createOrder: never trust a client-supplied price. This path
    // had no check at all, so a second round could be added at any price the
    // caller chose — and the two order paths could bill the same dish
    // differently depending on which screen the waiter used.
    let priceMap = new Map();
    try {
        priceMap = yield catalogPriceMap(newItems.map((it) => it.productId || it.product_id || it._id).filter(Boolean), business_id);
    }
    catch (e) {
        // A catalog lookup failure must not block food reaching the kitchen; fall
        // back to the submitted prices, clamped, exactly as createOrder does.
        console.error('[order] add-items price lookup failed:', e === null || e === void 0 ? void 0 : e.message);
    }
    // Append new items
    const itemsToAdd = newItems.map(item => {
        const pid = String(item.productId || item.product_id || item._id || '');
        const catalogPrice = priceMap.get(pid);
        return Object.assign(Object.assign({}, item), { price: catalogPrice != null ? catalogPrice : Math.max(0, Number(item.price) || 0), kitchenStatus: "SENT_TO_KITCHEN", sentToKitchenAt: new Date(), round: nextRound });
    });
    order.items.push(...itemsToAdd);
    // Recalculate totals
    order.totalQty += itemsToAdd.reduce((sum, item) => sum + (item.quantity || 1), 0);
    order.subtotal += itemsToAdd.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    if ((_a = order.membershipDiscount) === null || _a === void 0 ? void 0 : _a.applied) {
        order.membershipDiscount.payable = order.subtotal - (order.membershipDiscount.discountAmount || 0);
    }
    else if (order.membershipDiscount) {
        order.membershipDiscount.payable = order.subtotal;
    }
    yield order.save();
    // Broadcast to KDS that new items were added
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('order_items_added', { orderId: order._id, newItems: itemsToAdd, round: nextRound });
    return order;
});
exports.addItemsToOrder = addItemsToOrder;
const updateOrderItemKitchenStatus = (orderId, itemId, business_id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findOne({ _id: orderId, business_id });
    if (!order) {
        throw new AppError_1.default(404, "Order not found");
    }
    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item) {
        throw new AppError_1.default(404, "Item not found in order");
    }
    item.kitchenStatus = status;
    yield order.save();
    const io = (0, socket_1.getSocketIO)();
    // When an item is ready, check if the original waiter is still clocked in.
    // If they've clocked out (shift ended), fall back to all active staff so
    // nobody is left waiting for a notification that will never come.
    let fallbackToAll = false;
    if (status === 'DONE' && order.user_id) {
        try {
            const emp = yield employee_model_1.RotaEmployee.findOne({ user: order.user_id, business: business_id }).lean();
            if (emp) {
                const openSheet = yield timesheet_model_1.RotaTimesheet.findOne({
                    employee: emp._id,
                    business: business_id,
                    clockOut: null,
                }).lean();
                if (!openSheet)
                    fallbackToAll = true; // waiter clocked out → notify everyone
            }
        }
        catch (_) {
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
});
exports.updateOrderItemKitchenStatus = updateOrderItemKitchenStatus;
const listOrders = (_a) => __awaiter(void 0, [_a], void 0, function* ({ business_id, user_id, status, }) {
    const q = {};
    if (business_id)
        q.business_id = business_id;
    if (user_id)
        q.user_id = user_id;
    if (status)
        q.status = status;
    return order_model_1.Order.find(q).sort({ createdAt: -1 });
});
exports.listOrders = listOrders;
const getOrderById = (id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    return order_model_1.Order.findOne({ _id: id, business_id });
});
exports.getOrderById = getOrderById;
const updateOrder = (id, business_id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const order = yield order_model_1.Order.findOne({ _id: id, business_id });
    if (!order)
        throw new AppError_1.default(404, "Order not found");
    const oldPaymentStatus = order.paymentStatus;
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
    if (Array.isArray(updates === null || updates === void 0 ? void 0 : updates.items)) {
        try {
            const priceMap = yield catalogPriceMap(order.items
                .map((it) => it.productId || it.product_id || it._id)
                .filter(Boolean), business_id);
            order.items.forEach((it) => {
                const catalogPrice = priceMap.get(String(it.productId || it.product_id || it._id || ''));
                it.price = catalogPrice != null ? catalogPrice : Math.max(0, Number(it.price) || 0);
            });
        }
        catch (e) {
            console.error('[order] update price re-read failed:', e === null || e === void 0 ? void 0 : e.message);
        }
        // VOIDED lines stay in the array for audit but are not billed — the same
        // rule the void-approval path applies to the rollups.
        const billable = order.items.filter((it) => it.kitchenStatus !== 'VOIDED');
        order.totalQty = billable.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
        order.subtotal = billable.reduce((s, it) => s + Number(it.price || 0) * (Number(it.quantity) || 1), 0);
        if ((_a = order.membershipDiscount) === null || _a === void 0 ? void 0 : _a.applied) {
            order.membershipDiscount.payable = Math.max(0, order.subtotal - (Number(order.membershipDiscount.discountAmount) || 0));
        }
        else if (order.membershipDiscount) {
            order.membershipDiscount.payable = order.subtotal;
        }
    }
    yield order.save();
    // If payment status changed to PAID, free up the table
    if (oldPaymentStatus !== 'PAID' && order.paymentStatus === 'PAID') {
        if (order.orderType === 'dine-in' && order.tableNo) {
            const table = yield table_model_1.Table.findOne({ business_id, tableNo: order.tableNo });
            if (table && ((_b = table.activeOrderId) === null || _b === void 0 ? void 0 : _b.toString()) === order._id.toString()) {
                table.status = 'AVAILABLE';
                table.activeOrderId = null;
                yield table.save();
                const io = (0, socket_1.getSocketIO)();
                io.to(`business_${business_id}`).emit('table_updated', table);
            }
        }
    }
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('order_updated', order);
    return order;
});
exports.updateOrder = updateOrder;
// Compute what the customer owes right now (subtotal minus discount).
const computeGrandTotal = (order) => {
    var _a;
    const sub = Number(order.subtotal) || 0;
    const disc = Number((_a = order.membershipDiscount) === null || _a === void 0 ? void 0 : _a.discountAmount) || 0;
    return Math.max(0, sub - disc);
};
const recordPayment = (orderId, business_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const order = yield order_model_1.Order.findOne({ _id: orderId, business_id });
    if (!order)
        throw new AppError_1.default(404, "Order not found");
    if (order.paymentStatus === "PAID") {
        throw new AppError_1.default(400, "Order is already fully paid");
    }
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError_1.default(400, "Payment amount must be greater than 0");
    }
    const grandTotal = computeGrandTotal(order);
    const alreadyPaid = Number(order.amountPaid) || 0;
    const remaining = Math.max(0, grandTotal - alreadyPaid);
    // Don't over-collect — clamp to remaining (any overpay becomes change for cash)
    const applied = Math.min(amount, remaining);
    const change = payload.method === "CASH" && payload.tenderedAmount
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
    });
    order.amountPaid = alreadyPaid + applied;
    order.grandTotal = grandTotal;
    if (order.amountPaid >= grandTotal) {
        order.paymentStatus = "PAID";
        order.paidInFullAt = new Date();
    }
    else if (order.amountPaid > 0) {
        order.paymentStatus = "PARTIAL";
    }
    yield order.save();
    // When fully paid, free the table.
    if (order.paymentStatus === "PAID" && order.orderType === "dine-in" && order.tableNo) {
        const table = yield table_model_1.Table.findOne({ business_id, tableNo: order.tableNo });
        if (table && ((_a = table.activeOrderId) === null || _a === void 0 ? void 0 : _a.toString()) === order._id.toString()) {
            table.status = "AVAILABLE";
            table.activeOrderId = null;
            yield table.save();
            const io = (0, socket_1.getSocketIO)();
            io.to(`business_${business_id}`).emit("table_updated", table);
        }
    }
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit("order_updated", order);
    io.to(`business_${business_id}`).emit("order_payment_recorded", {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        amountPaid: order.amountPaid,
        grandTotal,
    });
    return order;
});
exports.recordPayment = recordPayment;
const requestItemVoid = (orderId, itemId, business_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = payload === null || payload === void 0 ? void 0 : payload.reason) === null || _a === void 0 ? void 0 : _a.trim())) {
        throw new AppError_1.default(400, "Reason is required");
    }
    const order = yield order_model_1.Order.findOne({ _id: orderId, business_id });
    if (!order)
        throw new AppError_1.default(404, "Order not found");
    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item)
        throw new AppError_1.default(404, "Item not found in order");
    // Block duplicate pending requests for the same item.
    const existing = order.voidRequests.find((v) => { var _a; return ((_a = v.itemId) === null || _a === void 0 ? void 0 : _a.toString()) === itemId && v.status === "PENDING"; });
    if (existing) {
        throw new AppError_1.default(400, "A cancel request is already pending for this item");
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
    });
    yield order.save();
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit("order_void_requested", {
        orderId: order._id,
        itemId,
        itemName: item.name,
        reason: payload.reason.trim(),
    });
    io.to(`business_${business_id}`).emit("order_updated", order);
    return order;
});
exports.requestItemVoid = requestItemVoid;
const decideItemVoid = (orderId, voidId, business_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((payload === null || payload === void 0 ? void 0 : payload.decision) !== "APPROVED" && (payload === null || payload === void 0 ? void 0 : payload.decision) !== "REJECTED") {
        throw new AppError_1.default(400, "decision must be APPROVED or REJECTED");
    }
    const order = yield order_model_1.Order.findOne({ _id: orderId, business_id });
    if (!order)
        throw new AppError_1.default(404, "Order not found");
    const vr = order.voidRequests.find((v) => v._id.toString() === voidId);
    if (!vr)
        throw new AppError_1.default(404, "Void request not found");
    if (vr.status !== "PENDING") {
        throw new AppError_1.default(400, "Void request has already been decided");
    }
    vr.status = payload.decision;
    vr.decidedBy = payload.decidedBy;
    vr.decidedByName = payload.decidedByName || "";
    vr.decidedAt = new Date();
    vr.decisionNote = payload.decisionNote || "";
    // On approval — flag item, reduce totals.
    if (payload.decision === "APPROVED") {
        const item = order.items.find((i) => { var _a; return i._id.toString() === ((_a = vr.itemId) === null || _a === void 0 ? void 0 : _a.toString()); });
        if (item) {
            const removeQty = Number(vr.quantity) || Number(item.quantity) || 0;
            const removePrice = Number(item.price) * removeQty;
            item.kitchenStatus = "VOIDED";
            // Don't physically remove — keep audit. Subtract from rollups.
            order.totalQty = Math.max(0, (Number(order.totalQty) || 0) - removeQty);
            order.subtotal = Math.max(0, (Number(order.subtotal) || 0) - removePrice);
            if ((_a = order.membershipDiscount) === null || _a === void 0 ? void 0 : _a.applied) {
                order.membershipDiscount.payable = Math.max(0, order.subtotal - (Number(order.membershipDiscount.discountAmount) || 0));
            }
            else if (order.membershipDiscount) {
                order.membershipDiscount.payable = order.subtotal;
            }
        }
    }
    yield order.save();
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit("order_void_decided", {
        orderId: order._id,
        voidId,
        decision: payload.decision,
    });
    io.to(`business_${business_id}`).emit("order_updated", order);
    return order;
});
exports.decideItemVoid = decideItemVoid;
const transferTable = (orderId, business_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const toTable = ((payload === null || payload === void 0 ? void 0 : payload.toTable) || "").trim();
    if (!toTable)
        throw new AppError_1.default(400, "toTable is required");
    const order = yield order_model_1.Order.findOne({ _id: orderId, business_id });
    if (!order)
        throw new AppError_1.default(404, "Order not found");
    if (order.paymentStatus === "PAID") {
        throw new AppError_1.default(400, "Cannot transfer a paid order");
    }
    const fromTable = order.tableNo || "";
    if (fromTable === toTable) {
        throw new AppError_1.default(400, "Already on that table");
    }
    // Destination table must be free (or auto-create).
    let destTable = yield table_model_1.Table.findOne({ business_id, tableNo: toTable });
    if (destTable && destTable.status !== "AVAILABLE") {
        throw new AppError_1.default(400, `Table ${toTable} is already occupied`);
    }
    if (!destTable) {
        destTable = yield table_model_1.Table.create({
            business_id,
            tableNo: toTable,
            capacity: order.guestCount && order.guestCount > 0 ? order.guestCount : 4,
            status: "AVAILABLE",
        });
        const io = (0, socket_1.getSocketIO)();
        io.to(`business_${business_id}`).emit("table_added", destTable);
    }
    // Free old table.
    if (fromTable) {
        const oldTable = yield table_model_1.Table.findOne({ business_id, tableNo: fromTable });
        if (oldTable && ((_a = oldTable.activeOrderId) === null || _a === void 0 ? void 0 : _a.toString()) === order._id.toString()) {
            oldTable.status = "AVAILABLE";
            oldTable.activeOrderId = null;
            yield oldTable.save();
            const io = (0, socket_1.getSocketIO)();
            io.to(`business_${business_id}`).emit("table_updated", oldTable);
        }
    }
    // Occupy new table.
    destTable.status = "OCCUPIED";
    destTable.activeOrderId = order._id;
    yield destTable.save();
    order.tableTransfers.push({
        fromTable,
        toTable,
        transferredBy: payload.transferredBy,
        transferredByName: payload.transferredByName || "",
        reason: payload.reason || "",
        transferredAt: new Date(),
    });
    order.tableNo = toTable;
    yield order.save();
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit("table_updated", destTable);
    io.to(`business_${business_id}`).emit("order_updated", order);
    io.to(`business_${business_id}`).emit("order_table_transferred", {
        orderId: order._id,
        fromTable,
        toTable,
    });
    return order;
});
exports.transferTable = transferTable;
const deleteOrder = (id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const order = yield order_model_1.Order.findOne({ _id: id, business_id });
    if (order && order.orderType === 'dine-in' && order.tableNo) {
        const table = yield table_model_1.Table.findOne({ business_id, tableNo: order.tableNo });
        if (table && ((_a = table.activeOrderId) === null || _a === void 0 ? void 0 : _a.toString()) === order._id.toString()) {
            table.status = 'AVAILABLE';
            table.activeOrderId = null;
            yield table.save();
            const io = (0, socket_1.getSocketIO)();
            io.to(`business_${business_id}`).emit('table_updated', table);
        }
    }
    yield order_model_1.Order.findOneAndDelete({ _id: id, business_id });
    return { message: "Order deleted successfully" };
});
exports.deleteOrder = deleteOrder;
