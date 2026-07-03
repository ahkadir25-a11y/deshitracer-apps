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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderControllers = void 0;
const orderService = __importStar(require("./order.service"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, user_id, businessName, tableNo, notes, items, totals, membershipDiscount, currency, status, customerName, customerPhone, customerEmail, guestCount, orderType, deliveryAddress, deliveryFee, requestedTime, } = req.body;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: "items are required." });
            return;
        }
        const created = yield orderService.createOrder({
            business_id,
            user_id,
            businessName,
            tableNo,
            notes,
            items,
            totalQty: Number((totals === null || totals === void 0 ? void 0 : totals.totalQty) || 0),
            subtotal: Number((totals === null || totals === void 0 ? void 0 : totals.subtotal) || 0),
            membershipDiscount: membershipDiscount || {
                applied: false,
                percent: 0,
                discountAmount: 0,
                payable: Number((totals === null || totals === void 0 ? void 0 : totals.subtotal) || 0),
                offer: null,
            },
            currency,
            status: status || "pending",
            customerName: customerName || "",
            customerPhone: customerPhone || "",
            customerEmail: customerEmail || "",
            guestCount: guestCount ? Number(guestCount) : 0,
            orderType: orderType || "dine-in",
            deliveryAddress: deliveryAddress || "",
            deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
            requestedTime: requestedTime || "",
        });
        res.status(201).json(created);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to create order" });
    }
});
const listOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, user_id, status } = req.query;
        // Allow listing by business (staff/owner view) OR by user (a member's
        // own order history across businesses). At least one scope is required
        // so we never return the whole orders collection.
        if (!business_id && !user_id) {
            res.status(400).json({ error: "business_id or user_id is required." });
            return;
        }
        const items = yield orderService.listOrders({ business_id, user_id, status });
        res.status(200).json(items);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to fetch orders" });
    }
});
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id } = req.query;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const one = yield orderService.getOrderById(req.params.id, business_id);
        if (!one) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.status(200).json(one);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to fetch order" });
    }
});
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id } = req.body;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const updated = yield orderService.updateOrder(req.params.id, business_id, req.body);
        if (!updated) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to update order" });
    }
});
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id } = req.query;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const result = yield orderService.deleteOrder(req.params.id, business_id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to delete order" });
    }
});
const addItemsToOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, items } = req.body;
        if (!business_id || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: "business_id and items array are required." });
            return;
        }
        const updated = yield orderService.addItemsToOrder(req.params.id, business_id, items);
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to add items to order" });
    }
});
const updateOrderItemKitchenStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, status } = req.body;
        if (!business_id || !status) {
            res.status(400).json({ error: "business_id and status are required." });
            return;
        }
        const updated = yield orderService.updateOrderItemKitchenStatus(req.params.id, req.params.itemId, business_id, status);
        res.status(200).json(updated);
    }
    catch (err) {
        res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to update item kitchen status" });
    }
});
const recordPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updated = yield orderService.recordPayment(req.params.id, business_id, {
            method, amount, tenderedAmount, change, reference, paidBy, paidByName, note,
        });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to record payment" });
    }
});
const requestItemVoid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, reason, requestedBy, requestedByName } = req.body;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const updated = yield orderService.requestItemVoid(req.params.id, req.params.itemId, business_id, { reason, requestedBy, requestedByName });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to request void" });
    }
});
const decideItemVoid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, decision, decidedBy, decidedByName, decisionNote } = req.body;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const updated = yield orderService.decideItemVoid(req.params.id, req.params.voidId, business_id, { decision, decidedBy, decidedByName, decisionNote });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to decide void" });
    }
});
const transferTable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { business_id, toTable, transferredBy, transferredByName, reason } = req.body;
        if (!business_id) {
            res.status(400).json({ error: "business_id is required." });
            return;
        }
        const updated = yield orderService.transferTable(req.params.id, business_id, {
            toTable, transferredBy, transferredByName, reason,
        });
        res.status(200).json(updated);
    }
    catch (err) {
        res.status((err === null || err === void 0 ? void 0 : err.statusCode) || 500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || "Failed to transfer table" });
    }
});
exports.OrderControllers = {
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
