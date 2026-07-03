"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaLeave = void 0;
const mongoose_1 = require("mongoose");
const rotaLeaveSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RotaEmployee', required: true, index: true },
    type: { type: String, enum: ['HOLIDAY', 'SICK', 'UNPAID', 'OTHER'], default: 'HOLIDAY' },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING', index: true },
    decidedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
rotaLeaveSchema.index({ business: 1, status: 1, startDate: 1 });
exports.RotaLeave = (0, mongoose_1.model)('RotaLeave', rotaLeaveSchema);
