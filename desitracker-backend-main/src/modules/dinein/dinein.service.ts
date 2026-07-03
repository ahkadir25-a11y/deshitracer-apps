import { JwtPayload } from 'jsonwebtoken';
import { DineInTable, DineInSession } from './dinein.model';
import { TDineInTable } from './dinein.interface';
import { Order } from '../order/order.model';

const createTable = async (payload: Partial<TDineInTable>) => {
  const result = await DineInTable.create(payload);
  return result;
};

const getTablesByBusiness = async (businessId: string) => {
  const result = await DineInTable.find({ business: businessId, isActive: true }).sort({ tableNumber: 1 });
  return result;
};

const updateTable = async (tableId: string, updates: Partial<TDineInTable>) => {
  const result = await DineInTable.findByIdAndUpdate(tableId, updates, { new: true });
  return result;
};

const deleteTable = async (tableId: string) => {
  await DineInTable.findByIdAndUpdate(tableId, { isActive: false });
  return { message: 'Table removed successfully' };
};

const getFloorStatus = async (businessId: string) => {
  // Get all active tables
  const tables = await DineInTable.find({ business: businessId, isActive: true }).sort({ tableNumber: 1 }).lean();

  // Get all active (non-completed, non-cancelled) orders for this business
  const activeOrders = await Order.find({
    business_id: businessId,
    status: { $nin: ['cancelled'] },
    paymentStatus: 'UNPAID',
    tableNo: { $ne: '' },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Build a map: tableNumber → latest order
  const orderMap: Record<string, any> = {};
  for (const order of activeOrders) {
    const tNum = (order as any).tableNo;
    if (tNum && !orderMap[tNum]) {
      orderMap[tNum] = order;
    }
  }

  // Merge tables with their order data
  const floor = tables.map((table) => {
    const order = orderMap[table.tableNumber] || null;
    let floorStatus = 'EMPTY';
    if (order) {
      if (order.kitchenStatus === 'NOT_SENT' || order.kitchenStatus === 'SENT_TO_KITCHEN') {
        floorStatus = 'ORDERED';
      } else if (order.kitchenStatus === 'COOKING') {
        floorStatus = 'COOKING';
      } else if (order.kitchenStatus === 'READY') {
        floorStatus = 'READY';
      } else if (order.kitchenStatus === 'SERVED') {
        floorStatus = order.paymentStatus === 'PAID' ? 'DONE' : 'UNPAID';
      }
    }
    return {
      ...table,
      floorStatus,
      activeOrder: order,
    };
  });

  return floor;
};

export const DineInServices = {
  createTable,
  getTablesByBusiness,
  updateTable,
  deleteTable,
  getFloorStatus,
};
