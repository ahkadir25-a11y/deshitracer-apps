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
exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.listOrders = exports.createOrder = void 0;
const order_model_1 = require("./order.model");
const createOrder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = new order_model_1.Order(payload);
    yield doc.save();
    return doc;
});
exports.createOrder = createOrder;
const listOrders = (_a) => __awaiter(void 0, [_a], void 0, function* ({ business_id, user_id, status, }) {
    const q = { business_id };
    if (user_id)
        q.user_id = user_id;
    if (status)
        q.status = status;
    return order_model_1.Order.find(q).sort({ createdAt: -1 });
});
exports.listOrders = listOrders;
const getOrderById = (id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    return order_model_1.Order.findOne({ _id: id, business_id });
});
exports.getOrderById = getOrderById;
const updateOrder = (id, business_id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    return order_model_1.Order.findOneAndUpdate({ _id: id, business_id }, updates, { new: true });
});
exports.updateOrder = updateOrder;
const deleteOrder = (id, business_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield order_model_1.Order.findOneAndDelete({ _id: id, business_id });
    return { message: "Order deleted successfully" };
});
exports.deleteOrder = deleteOrder;
