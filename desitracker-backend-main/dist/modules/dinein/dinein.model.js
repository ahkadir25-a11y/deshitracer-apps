"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DineInSession = exports.DineInTable = void 0;
const mongoose_1 = require("mongoose");
const DineInTableSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business' },
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true, default: 4 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.DineInTable = (0, mongoose_1.model)('DineInTable', DineInTableSchema);
const DineInSessionSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business' },
    table: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'DineInTable' },
    order: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Order' },
    status: { type: String, enum: ['EATING', 'PAYMENT_DUE', 'COMPLETED'], default: 'EATING' },
    kitchenStatus: { type: String, enum: ['NOT_SENT', 'SENT_TO_KITCHEN', 'COOKING', 'READY'], default: 'NOT_SENT' },
    openedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    closedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.DineInSession = (0, mongoose_1.model)('DineInSession', DineInSessionSchema);
