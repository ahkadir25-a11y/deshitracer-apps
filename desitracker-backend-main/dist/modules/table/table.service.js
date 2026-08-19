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
const mongoose_1 = require("mongoose");
const business_model_1 = require("../business/business.model");
// The access token carries only { id, role, email } — it has NO business_id.
// So table routes must resolve the business from the TABLE itself and then
// verify the caller owns that business. Reading business_id off req.user made
// every lookup run with business_id: undefined, which is why delete/edit
// answered "Table not found".
const loadOwnedTable = (userId, role, tableId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(tableId)) {
        throw new AppError_1.default(400, 'Invalid table id');
    }
    const table = yield table_model_1.Table.findById(tableId);
    if (!table) {
        throw new AppError_1.default(404, 'Table not found');
    }
    if (role !== 'admin') {
        const business = yield business_model_1.Business.findById(table.business_id).select('owner');
        if (!business || String(business.owner) !== String(userId)) {
            throw new AppError_1.default(403, 'You do not own this business');
        }
    }
    return table;
});
const createTable = (business_id, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    if (!business_id || !mongoose_1.Types.ObjectId.isValid(String(business_id))) {
        throw new AppError_1.default(400, 'A valid business id is required');
    }
    // Only the owner of that business (or an admin) may add tables to it.
    if (actor && actor.role !== 'admin') {
        const business = yield business_model_1.Business.findById(business_id).select('owner');
        if (!business || String(business.owner) !== String(actor.id)) {
            throw new AppError_1.default(403, 'You do not own this business');
        }
    }
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
const deleteTable = (userId, role, tableId) => __awaiter(void 0, void 0, void 0, function* () {
    const table = yield loadOwnedTable(userId, role, tableId);
    if (table.status !== 'AVAILABLE') {
        throw new AppError_1.default(400, 'Cannot delete a table that is still in use');
    }
    if (table.activeOrderId) {
        throw new AppError_1.default(400, 'Cannot delete a table with an open order');
    }
    const business_id = String(table.business_id);
    const result = yield table_model_1.Table.findByIdAndDelete(tableId);
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('table_deleted', { tableId });
    return result;
});
// Rename a table / change its seat count. Status and activeOrderId are
// deliberately NOT editable here — those are driven by the order flow.
const updateTable = (userId, role, tableId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const table = yield loadOwnedTable(userId, role, tableId);
    const business_id = String(table.business_id);
    const update = {};
    if (payload.tableNo !== undefined) {
        const tableNo = String(payload.tableNo).trim();
        if (!tableNo) {
            throw new AppError_1.default(400, 'Table number is required');
        }
        if (tableNo !== table.tableNo) {
            const clash = yield table_model_1.Table.findOne({
                business_id: table.business_id,
                tableNo,
                _id: { $ne: table._id },
            });
            if (clash) {
                throw new AppError_1.default(400, 'Table number already exists for this business');
            }
        }
        update.tableNo = tableNo;
    }
    if (payload.capacity !== undefined) {
        const capacity = Number(payload.capacity);
        if (!Number.isFinite(capacity) || capacity < 1) {
            throw new AppError_1.default(400, 'Capacity must be at least 1');
        }
        update.capacity = capacity;
    }
    const result = yield table_model_1.Table.findByIdAndUpdate(tableId, update, {
        new: true,
    }).populate('activeOrderId');
    const io = (0, socket_1.getSocketIO)();
    io.to(`business_${business_id}`).emit('table_updated', result);
    return result;
});
exports.TableServices = {
    createTable,
    getBusinessTables,
    updateTableStatus,
    updateTable,
    deleteTable,
};
