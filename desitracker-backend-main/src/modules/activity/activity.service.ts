import { ActivityLog } from './activity.model';
import { TActivityLog } from './activity.interface';
import { Order } from '../order/order.model';
import { Ingredient } from '../inventory/inventory.model';
import { emitToBusiness } from '../../utils/socket';

const logActivity = async (payload: Partial<TActivityLog>) => {
  const result = await ActivityLog.create(payload);
  // Real-time: push the new entry to anyone watching this business's activity feed.
  emitToBusiness((payload as any).business, 'activity_logged', result);
  return result;
};

const getActivityByBusiness = async (businessId: string, limit: number = 50) => {
  const result = await ActivityLog.find({ business: businessId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return result;
};

const getOwnerDashboardStats = async (businessId: string) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Today's orders
  const todayOrders = await Order.find({
    business_id: businessId,
    createdAt: { $gte: todayStart },
    status: { $ne: 'cancelled' },
  }).lean();

  const totalSalesToday = todayOrders.reduce((sum, o) => {
    const payable = (o as any).membershipDiscount?.payable;
    return sum + (payable || (o as any).subtotal || 0);
  }, 0);

  const totalOrdersToday = todayOrders.length;
  const paidOrders = todayOrders.filter((o: any) => o.paymentStatus === 'PAID').length;
  const unpaidOrders = todayOrders.filter((o: any) => o.paymentStatus === 'UNPAID').length;

  // Active tables (orders that are not completed/cancelled and unpaid)
  const activeTables = await Order.countDocuments({
    business_id: businessId,
    status: { $ne: 'cancelled' },
    paymentStatus: 'UNPAID',
    tableNo: { $ne: '' },
  });

  // Kitchen status counts
  const kitchenCooking = todayOrders.filter((o: any) => o.kitchenStatus === 'COOKING').length;
  const kitchenReady = todayOrders.filter((o: any) => o.kitchenStatus === 'READY').length;
  const kitchenPending = todayOrders.filter((o: any) => ['NOT_SENT', 'SENT_TO_KITCHEN'].includes(o.kitchenStatus)).length;

  // Low stock ingredients
  const lowStockItems = await Ingredient.find({
    business: businessId,
    $expr: { $lte: ['$currentQuantity', '$minThreshold'] },
  }).lean();

  // Recent activity (last 10)
  const recentActivity = await ActivityLog.find({ business: businessId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    totalSalesToday,
    totalOrdersToday,
    paidOrders,
    unpaidOrders,
    activeTables,
    kitchenCooking,
    kitchenReady,
    kitchenPending,
    lowStockItems,
    recentActivity,
  };
};

export const ActivityServices = {
  logActivity,
  getActivityByBusiness,
  getOwnerDashboardStats,
};
