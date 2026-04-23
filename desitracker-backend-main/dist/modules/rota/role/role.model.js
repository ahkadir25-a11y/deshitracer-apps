"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRole = void 0;
const mongoose_1 = require("mongoose");
const rotaRoleSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// Unique role name per business (ignores soft-deleted docs)
rotaRoleSchema.index({ business: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
exports.RotaRole = (0, mongoose_1.model)('RotaRole', rotaRoleSchema);
