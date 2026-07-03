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
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create order" });
  }
};

const listOrders = async (req: Request, res: Response) => {
  try {
    const { business_id, user_id, status } = (req.query as any) as {
      business_id?: string;
      user_id?: string;
      status?: string;
    };

    // Allow listing by business (staff/owner view) OR by user (a member's
    // own order history across businesses). At least one scope is required
    // so we never return the whole orders collection.
    if (!business_id && !user_id) {
      res.status(400).json({ error: "business_id or user_id is required." });
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