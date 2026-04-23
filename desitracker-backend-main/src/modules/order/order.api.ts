import { Router } from "express";
import { OrderControllers } from "./order.controller";

const router = Router();

router.post("/create", OrderControllers.createOrder);
router.get("/", OrderControllers.listOrders);
router.get("/:id", OrderControllers.getOrderById);
router.put("/:id", OrderControllers.updateOrder);
router.delete("/:id", OrderControllers.deleteOrder);

export const OrderRoutes = router;