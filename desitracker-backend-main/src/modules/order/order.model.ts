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
    // Item-level KDS tracking
    // Flow: NOT_SENT → SENT_TO_KITCHEN → PREPARING → READY → DONE → SERVED.
    // DONE = kitchen finished (food on the pass); SERVED = waiter delivered it
    // to the table. The two-stage handoff is intentional so the waiter still
    // confirms delivery before the table becomes "unpaid".
    kitchenStatus: {
      type: String,
      enum: ["NOT_SENT", "SENT_TO_KITCHEN", "PREPARING", "READY", "DONE", "SERVED", "VOIDED"],
      default: "NOT_SENT",
    },
    sentToKitchenAt: { type: Date },
    round: { type: Number, default: 1 },
  },
  { _id: true } // Need _id to target specific items for updates
);

// Payment record — one row per tender. Splits create multiple records.
const PaymentSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["CASH", "CARD", "MOBILE", "BANK", "OTHER"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    tenderedAmount: { type: Number }, // for cash, what customer handed over
    change: { type: Number, default: 0 },
    reference: { type: String, default: "" }, // last-4, txn id, bKash trxId, etc.
    paidBy: { type: Types.ObjectId, ref: "User" },
    paidByName: { type: String, default: "" },
    paidAt: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: true }
);

// Void request — waiter requests, kitchen / manager decides.
const VoidRequestSchema = new Schema(
  {
    itemId: { type: Types.ObjectId, required: true },
    itemName: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    reason: { type: String, required: true },
    requestedBy: { type: Types.ObjectId, ref: "User" },
    requestedByName: { type: String, default: "" },
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    decidedBy: { type: Types.ObjectId, ref: "User" },
    decidedByName: { type: String, default: "" },
    decidedAt: { type: Date },
    decisionNote: { type: String, default: "" },
  },
  { _id: true }
);

// Table transfer log — audit trail of moves between tables.
const TableTransferSchema = new Schema(
  {
    fromTable: { type: String, required: true },
    toTable: { type: String, required: true },
    transferredBy: { type: Types.ObjectId, ref: "User" },
    transferredByName: { type: String, default: "" },
    reason: { type: String, default: "" },
    transferredAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const OrderSchema = new Schema(
  {
    business_id: { type: Types.ObjectId, ref: "Business", required: true, index: true },
    // Indexed: customer "Order History" filters by user_id; without this it's a
    // full collection scan that grows with every order placed platform-wide.
    user_id: { type: Types.ObjectId, ref: "User", required: false, index: true },
    // The actual staff member who took the order (user_id is the owner the
    // products are keyed under). Used for per-waiter history + reports.
    staffUserId: { type: Types.ObjectId, ref: "User", required: false, index: true },
    staffName: { type: String },
    businessName: { type: String },

    tableNo: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Customer info (all optional per dine-in spec section 6)
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    guestCount: { type: Number, default: 0 },

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

    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      default: "dine-in",
    },

    // Delivery & Pickup fields
    deliveryAddress: { type: String, default: "" },
    deliveryFee: { type: Number, default: 0 },
    requestedTime: { type: String, default: "" },  // e.g. "ASAP", "6:30 PM"

    kitchenStatus: {
      type: String,
      enum: ["NOT_SENT", "SENT_TO_KITCHEN", "COOKING", "READY", "SERVED"],
      default: "NOT_SENT",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
    },

    // Payment-related rollups
    payments: { type: [PaymentSchema], default: [] },
    amountPaid: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }, // snapshot of what was owed
    paidInFullAt: { type: Date },

    // Void / cancel-request tracking
    voidRequests: { type: [VoidRequestSchema], default: [] },

    // Table transfer history
    tableTransfers: { type: [TableTransferSchema], default: [] },

    sentToKitchenAt: { type: Date },
  },
  { timestamps: true }
);

// Hot path: business order lists filtered by status, newest first.
OrderSchema.index({ business_id: 1, status: 1, createdAt: -1 });
// Customer order history, newest first.
OrderSchema.index({ user_id: 1, createdAt: -1 });

export const Order = model("Order", OrderSchema);