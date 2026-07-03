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
exports.DineInServices = void 0;
const dinein_model_1 = require("./dinein.model");
const order_model_1 = require("../order/order.model");
const createTable = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_model_1.DineInTable.create(payload);
    return result;
});
const getTablesByBusiness = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_model_1.DineInTable.find({ business: businessId, isActive: true }).sort({ tableNumber: 1 });
    return result;
});
const updateTable = (tableId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_model_1.DineInTable.findByIdAndUpdate(tableId, updates, { new: true });
    return result;
});
const deleteTable = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    yield dinein_model_1.DineInTable.findByIdAndUpdate(tableId, { isActive: false });
    return { message: 'Table removed successfully' };
});
const getFloorStatus = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all active tables
    const tables = yield dinein_model_1.DineInTable.find({ business: businessId, isActive: true }).sort({ tableNumber: 1 }).lean();
    // Get all active (non-completed, non-cancelled) orders for this business
    const activeOrders = yield order_model_1.Order.find({
        business_id: businessId,
        status: { $nin: ['cancelled'] },
        paymentStatus: 'UNPAID',
        tableNo: { $ne: '' },
    })
        .sort({ createdAt: -1 })
        .lean();
    // Build a map: tableNumber → latest order
    const orderMap = {};
    for (const order of activeOrders) {
        const tNum = order.tableNo;
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
            }
            else if (order.kitchenStatus === 'COOKING') {
                floorStatus = 'COOKING';
            }
            else if (order.kitchenStatus === 'READY') {
                floorStatus = 'READY';
            }
            else if (order.kitchenStatus === 'SERVED') {
                floorStatus = order.paymentStatus === 'PAID' ? 'DONE' : 'UNPAID';
            }
        }
        return Object.assign(Object.assign({}, table), { floorStatus, activeOrder: order });
    });
    return floor;
});
exports.DineInServices = {
    createTable,
    getTablesByBusiness,
    updateTable,
    deleteTable,
    getFloorStatus,
};
