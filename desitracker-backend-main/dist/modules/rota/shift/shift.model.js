"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaShift = void 0;
const mongoose_1 = require("mongoose");
const rotaShiftSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employee: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RotaEmployee', default: null, index: true },
    role: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RotaRole', required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    breakMinutes: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'], default: 'DRAFT', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
// Fast range queries (weekly/daily rota views)
rotaShiftSchema.index({ business: 1, startAt: 1, endAt: 1 });
rotaShiftSchema.index({ employee: 1, startAt: 1, endAt: 1 });
exports.RotaShift = (0, mongoose_1.model)('RotaShift', rotaShiftSchema);
