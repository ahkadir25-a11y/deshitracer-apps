"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const mongoose_1 = require("mongoose");
const announcementSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    pinned: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });
// Most queries: business + recent. Pinned items go first.
announcementSchema.index({ business: 1, pinned: -1, createdAt: -1 });
exports.Announcement = (0, mongoose_1.model)('Announcement', announcementSchema);
