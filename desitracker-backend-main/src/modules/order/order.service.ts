import { Order } from "./order.model";

export const createOrder = async (payload: any) => {
  const doc = new Order(payload);
  await doc.save();
  return doc;
};

export const listOrders = async ({
  business_id,
  user_id,
  status,
}: {
  business_id: string;
  user_id?: string;
  status?: string;
}) => {
  const q: any = { business_id };
  if (user_id) q.user_id = user_id;
  if (status) q.status = status;

  return Order.find(q).sort({ createdAt: -1 });
};

export const getOrderById = async (id: string, business_id: string) => {
  return Order.findOne({ _id: id, business_id });
};

export const updateOrder = async (id: string, business_id: string, updates: any) => {
  return Order.findOneAndUpdate(
    { _id: id, business_id },
    updates,
    { new: true }
  );
};

export const deleteOrder = async (id: string, business_id: string) => {
  await Order.findOneAndDelete({ _id: id, business_id });
  return { message: "Order deleted successfully" };
};