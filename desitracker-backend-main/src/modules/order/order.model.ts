import { Schema, model, Types } from "mongoose";

const OrderItemOptionSchema = new Schema(
  {
    optionGroupId: { type: String, required: true },
    optionGroupName: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    lineId: { type: String, required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, required: true },
    product_category_id: { type: Types.ObjectId, ref: "ProductCategory" },
    product_category_type: { type: String },
    selectedOptions: { type: [OrderItemOptionSchema], default: [] },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    business_id: { type: Types.ObjectId, ref: "Business", required: true, index: true },
    user_id: { type: Types.ObjectId, ref: "User", required: true },
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
      offer: { type: Schema.Types.Mixed, default: null },
    },

    currency: { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = model("Order", OrderSchema);