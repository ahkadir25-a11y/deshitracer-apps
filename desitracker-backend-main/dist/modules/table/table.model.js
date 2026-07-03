"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const mongoose_1 = require("mongoose");
const TableSchema = new mongoose_1.Schema({
    business_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    tableNo: { type: String, required: true },
    capacity: { type: Number, default: 4 },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED', 'UNPAID'],
        default: 'AVAILABLE',
    },
    activeOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });
// Prevent duplicate table numbers in the same business
TableSchema.index({ business_id: 1, tableNo: 1 }, { unique: true });
exports.Table = (0, mongoose_1.model)('Table', TableSchema);
