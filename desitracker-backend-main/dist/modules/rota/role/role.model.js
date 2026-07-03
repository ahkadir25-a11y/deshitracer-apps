"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRole = void 0;
const mongoose_1 = require("mongoose");
const PermissionsSchema = new mongoose_1.Schema({
    // Orders & service
    canTakeOrders: { type: Boolean, default: false },
    canViewOrders: { type: Boolean, default: false },
    canDeleteOrders: { type: Boolean, default: false },
    canMarkPaid: { type: Boolean, default: false },
    canAccessKitchen: { type: Boolean, default: false },
    canAccessTables: { type: Boolean, default: false },
    // Products & inventory
    canManageProducts: { type: Boolean, default: false },
    canViewInventory: { type: Boolean, default: false },
    canEditInventory: { type: Boolean, default: false },
    // Restaurant operations
    canManageBookings: { type: Boolean, default: false },
    canManageOffers: { type: Boolean, default: false },
    canViewFridge: { type: Boolean, default: false },
    canEditFridge: { type: Boolean, default: false },
    canManageCleaning: { type: Boolean, default: false },
    // Staff & members
    canManageRota: { type: Boolean, default: false },
    canViewMembers: { type: Boolean, default: false },
    // Insights
    canViewAnalytics: { type: Boolean, default: false },
    canViewActivity: { type: Boolean, default: false },
    // Admin
    canEditBusinessInfo: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
}, { _id: false });
const rotaRoleSchema = new mongoose_1.Schema({
    business: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    permissions: { type: PermissionsSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
rotaRoleSchema.index({ business: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
exports.RotaRole = (0, mongoose_1.model)('RotaRole', rotaRoleSchema);
