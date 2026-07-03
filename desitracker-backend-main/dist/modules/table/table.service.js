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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const table_model_1 = require("./table.model");
const socket_1 = require("../../utils/socket");
const createTable = (business_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield table_model_1.Table.findOne({ business_id, tableNo: payload.tableNo });
    if (isExists) {
        throw new AppError_1.default(400, 'Table number already exists for this business');
    }
    const result = yield table_model_1.Table.create(Object.assign(Object.assign({}, payload), { business_id }));
    // Broadcast table added
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('table_added', result);
    return result;
});
const getBusinessTables = (business_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield table_model_1.Table.find({ business_id }).sort({ tableNo: 1 }).populate('activeOrderId');
    return result;
});
const updateTableStatus = (business_id_1, tableId_1, status_1, ...args_1) => __awaiter(void 0, [business_id_1, tableId_1, status_1, ...args_1], void 0, function* (business_id, tableId, status, activeOrderId = null) {
    const result = yield table_model_1.Table.findOneAndUpdate({ _id: tableId, business_id }, { status, activeOrderId }, { new: true }).populate('activeOrderId');
    if (!result) {
        throw new AppError_1.default(404, 'Table not found');
    }
    // Broadcast table status update
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('table_updated', result);
    return result;
});
const deleteTable = (business_id, tableId) => __awaiter(void 0, void 0, void 0, function* () {
    const table = yield table_model_1.Table.findOne({ _id: tableId, business_id });
    if (!table) {
        throw new AppError_1.default(404, 'Table not found');
    }
    if (table.status !== 'AVAILABLE') {
        throw new AppError_1.default(400, 'Cannot delete an occupied table');
    }
    const result = yield table_model_1.Table.findByIdAndDelete(tableId);
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('table_deleted', { tableId });
    return result;
});
exports.TableServices = {
    createTable,
    getBusinessTables,
    updateTableStatus,
    deleteTable,
};
