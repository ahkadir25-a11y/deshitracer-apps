import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/auth/auth.constants";
import { authOrderRead, requireBusinessAccess } from "../../utils/lib/businessAccess";
import { OrderControllers } from "./order.controller";

const router = Router();

// Staff = anyone who operates the POS/KDS for a business (owner, staff, admin).
const staff = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);

// Customers place orders as guests (no login), so /create stays public — but is
// throttled so it can't be scripted into mass fake-order spam, and prices are
// recomputed server-side in the service (see order.service.createOrder).
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many orders. Please wait a moment and try again." },
});

// ── Public (guest customer) ──────────────────────────────────────────────────
router.post("/create", createLimiter, OrderControllers.createOrder);

// ── Reads ────────────────────────────────────────────────────────────────────
// List is scoped inside authOrderRead: ?business_id needs staff membership,
// ?user_id must be the caller's own id (customer order history).
router.get("/", authOrderRead, OrderControllers.listOrders);
router.get("/:id", staff, requireBusinessAccess, OrderControllers.getOrderById);

// ── Staff-only writes (must belong to the business being mutated) ─────────────
router.put("/:id", staff, requireBusinessAccess, OrderControllers.updateOrder);
router.post("/:id/add-items", staff, requireBusinessAccess, OrderControllers.addItemsToOrder);
router.put("/:id/item/:itemId/kitchen-status", staff, requireBusinessAccess, OrderControllers.updateOrderItemKitchenStatus);

// Payments
router.post("/:id/payment", staff, requireBusinessAccess, OrderControllers.recordPayment);

// Void requests (waiter requests, manager / kitchen decides)
router.post("/:id/items/:itemId/void-request", staff, requireBusinessAccess, OrderControllers.requestItemVoid);
// Void decision is gated in-app by the manager PIN; here we only enforce that
// the caller belongs to the business (staff/owner/admin).
router.post("/:id/voids/:voidId/decide", staff, requireBusinessAccess, OrderControllers.decideItemVoid);

// Table transfer
router.post("/:id/transfer-table", staff, requireBusinessAccess, OrderControllers.transferTable);

router.delete("/:id", staff, requireBusinessAccess, OrderControllers.deleteOrder);

export const OrderRoutes = router;
