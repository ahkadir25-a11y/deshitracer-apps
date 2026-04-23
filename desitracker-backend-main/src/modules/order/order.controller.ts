import { Request, Response } from "express";
import * as orderService from "./order.service";

const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      business_id,
      user_id,
      businessName,
      tableNo,
      notes,
      items,
      totals,
      membershipDiscount,
      currency,
      status,
    } = req.body;

    if (!business_id || !user_id) {
      res.status(400).json({ error: "business_id and user_id are required." });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "items are required." });
      return;
    }

    const created = await orderService.createOrder({
      business_id,
      user_id,
      businessName,
      tableNo,
      notes,
      items,
      totalQty: Number(totals?.totalQty || 0),
      subtotal: Number(totals?.subtotal || 0),
      membershipDiscount: membershipDiscount || {
        applied: false,
        percent: 0,
        discountAmount: 0,
        payable: Number(totals?.subtotal || 0),
        offer: null,
      },
      currency,
      status: status || "pending",
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create order" });
  }
};

const listOrders = async (req: Request, res: Response) => {
  try {
    const { business_id, user_id, status } = req.query as {
      business_id?: string;
      user_id?: string;
      status?: string;
    };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const items = await orderService.listOrders({ business_id, user_id, status });
    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch orders" });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const { business_id } = req.query as { business_id?: string };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const one = await orderService.getOrderById(req.params.id, business_id);
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

    const updated = await orderService.updateOrder(req.params.id, business_id, req.body);
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
    const { business_id } = req.query as { business_id?: string };

    if (!business_id) {
      res.status(400).json({ error: "business_id is required." });
      return;
    }

    const result = await orderService.deleteOrder(req.params.id, business_id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to delete order" });
  }
};

export const OrderControllers = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};