"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderItemOptionSchema = new mongoose_1.Schema({
    optionGroupId: { type: String, required: true },
    optionGroupName: { type: String, required: true },
    value: { type: String, required: true },
}, { _id: false });
const OrderItemSchema = new mongoose_1.Schema({
    lineId: { type: String, required: true },
    productId: { type: mongoose_1.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, required: true },
    product_category_id: { type: mongoose_1.Types.ObjectId, ref: "ProductCategory" },
    product_category_type: { type: String },
    selectedOptions: { type: [OrderItemOptionSchema], default: [] },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    business_id: { type: mongoose_1.Types.ObjectId, ref: "Business", required: true, index: true },
    user_id: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String },
    tableNo: { type: String, default: "" },
    notes: { type: String, default: "" },
    items: { type: [OrderItemSchema], required: true },
    totalQty: { type: Number, required: true, default: 0 },
    subtotal: { type: Number, required: true, default: 0 },
    membershipDiscount: {
        applied: { type: Boolean, default: false },
        percent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        payable: { type: Number, default: 0 },
        offer: { type: mongoose_1.Schema.Types.Mixed, default: null },
    },
    currency: { type: String, default: "USD" },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)("Order", OrderSchema);
