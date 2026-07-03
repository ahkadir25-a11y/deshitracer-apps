"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EODReport = void 0;
const mongoose_1 = require("mongoose");
const EODReportSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business' },
    manager: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: true, default: Date.now },
    totalSales: { type: Number, required: true, default: 0 },
    totalTablesServed: { type: Number, required: true, default: 0 },
    missingStockNotes: { type: String, default: '' },
    generalNotes: { type: String, default: '' },
    status: { type: String, enum: ['SUBMITTED', 'REVIEWED_BY_OWNER'], default: 'SUBMITTED' },
}, { timestamps: true });
exports.EODReport = (0, mongoose_1.model)('EODReport', EODReportSchema);
