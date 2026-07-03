"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const businessAccess_1 = require("../../utils/lib/businessAccess");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
// Staff = anyone who operates the POS/KDS for a business (owner, staff, admin).
const staff = (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF);
// Customers place orders as guests (no login), so /create stays public — but is
// throttled so it can't be scripted into mass fake-order spam, and prices are
// recomputed server-side in the service (see order.service.createOrder).
const createLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many orders. Please wait a moment and try again." },
});
// ── Public (guest customer) ──────────────────────────────────────────────────
router.post("/create", createLimiter, order_controller_1.OrderControllers.createOrder);
// ── Reads ────────────────────────────────────────────────────────────────────
// List is scoped inside authOrderRead: ?business_id needs staff membership,
// ?user_id must be the caller's own id (customer order history).
router.get("/", businessAccess_1.authOrderRead, order_controller_1.OrderControllers.listOrders);
router.get("/:id", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.getOrderById);
// ── Staff-only writes (must belong to the business being mutated) ─────────────
router.put("/:id", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.updateOrder);
router.post("/:id/add-items", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.addItemsToOrder);
router.put("/:id/item/:itemId/kitchen-status", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.updateOrderItemKitchenStatus);
// Payments
router.post("/:id/payment", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.recordPayment);
// Void requests (waiter requests, manager / kitchen decides)
router.post("/:id/items/:itemId/void-request", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.requestItemVoid);
// Void decision is gated in-app by the manager PIN; here we only enforce that
// the caller belongs to the business (staff/owner/admin).
router.post("/:id/voids/:voidId/decide", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.decideItemVoid);
// Table transfer
router.post("/:id/transfer-table", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.transferTable);
router.delete("/:id", staff, businessAccess_1.requireBusinessAccess, order_controller_1.OrderControllers.deleteOrder);
exports.OrderRoutes = router;
