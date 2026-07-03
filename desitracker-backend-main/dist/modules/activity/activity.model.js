"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = require("mongoose");
const ActivityLogSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Business', index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'staff' },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    entityType: { type: String, enum: ['ORDER', 'TABLE', 'INVENTORY', 'PAYMENT', 'SETTINGS', 'STAFF', 'EOD'], required: true },
    entityId: { type: mongoose_1.Schema.Types.ObjectId },
}, { timestamps: true });
// Auto-expire logs after 30 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
exports.ActivityLog = (0, mongoose_1.model)('ActivityLog', ActivityLogSchema);
