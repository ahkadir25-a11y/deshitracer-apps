"use strict";
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
exports.ActivityServices = void 0;
const activity_model_1 = require("./activity.model");
const order_model_1 = require("../order/order.model");
const inventory_model_1 = require("../inventory/inventory.model");
const socket_1 = require("../../utils/socket");
const logActivity = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield activity_model_1.ActivityLog.create(payload);
    // Real-time: push the new entry to anyone watching this business's activity feed.
    (0, socket_1.emitToBusiness)(payload.business, 'activity_logged', result);
    return result;
});
const getActivityByBusiness = (businessId_1, ...args_1) => __awaiter(void 0, [businessId_1, ...args_1], void 0, function* (businessId, limit = 50) {
    const result = yield activity_model_1.ActivityLog.find({ business: businessId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    return result;
});
const getOwnerDashboardStats = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    // Today's orders
    const todayOrders = yield order_model_1.Order.find({
        business_id: businessId,
        createdAt: { $gte: todayStart },
        status: { $ne: 'cancelled' },
    }).lean();
    const totalSalesToday = todayOrders.reduce((sum, o) => {
        var _a;
        const payable = (_a = o.membershipDiscount) === null || _a === void 0 ? void 0 : _a.payable;
        return sum + (payable || o.subtotal || 0);
    }, 0);
    const totalOrdersToday = todayOrders.length;
    const paidOrders = todayOrders.filter((o) => o.paymentStatus === 'PAID').length;
    const unpaidOrders = todayOrders.filter((o) => o.paymentStatus === 'UNPAID').length;
    // Active tables (orders that are not completed/cancelled and unpaid)
    const activeTables = yield order_model_1.Order.countDocuments({
        business_id: businessId,
        status: { $ne: 'cancelled' },
        paymentStatus: 'UNPAID',
        tableNo: { $ne: '' },
    });
    // Kitchen status counts
    const kitchenCooking = todayOrders.filter((o) => o.kitchenStatus === 'COOKING').length;
    const kitchenReady = todayOrders.filter((o) => o.kitchenStatus === 'READY').length;
    const kitchenPending = todayOrders.filter((o) => ['NOT_SENT', 'SENT_TO_KITCHEN'].includes(o.kitchenStatus)).length;
    // Low stock ingredients
    const lowStockItems = yield inventory_model_1.Ingredient.find({
        business: businessId,
        $expr: { $lte: ['$currentQuantity', '$minThreshold'] },
    }).lean();
    // Recent activity (last 10)
    const recentActivity = yield activity_model_1.ActivityLog.find({ business: businessId })
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
});
exports.ActivityServices = {
    logActivity,
    getActivityByBusiness,
    getOwnerDashboardStats,
};
