// // models/productModel.ts
// import mongoose, { Document, Schema } from 'mongoose';

// interface IProduct extends Document {
//   name: string;
//   price: number;
//   description: string;
//   images: { url: string; description: string }[];
//   thumbnail: string;
//   user_id: mongoose.Schema.Types.ObjectId;
//   business_id: mongoose.Schema.Types.ObjectId;
//   currency: string;
//   product_category_id?: mongoose.Schema.Types.ObjectId;
//   discount_percent: number;         // NEW
//   final_price?: number;             // Virtual (computed)
// }

// const productSchema: Schema = new Schema(
//   {
//     name: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     description: { type: String, required: true },
//     images: [
//       {
//         url: { type: String, required: true },
//         description: { type: String, required: true },
//       },
//     ],
//     thumbnail: { type: String },
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
//     currency: { type: String, required: true, default: 'USD' },
//     product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },

//     // NEW: discount percentage (0–100)
//     discount_percent: { type: Number, min: 0, max: 100, default: 0 },
//   },
//   { timestamps: true }
// );

// // NEW: expose a computed final_price in API responses
// productSchema.virtual('final_price').get(function (this: any) {
//   const price = typeof this.price === 'number' ? this.price : 0;
//   const discount = typeof this.discount_percent === 'number' ? this.discount_percent : 0;
//   const discounted = price * (1 - discount / 100);
//   // round to 2 decimals
//   return Math.round(discounted * 100) / 100;
// });

// // Ensure virtuals show up in JSON/object outputs
// productSchema.set('toJSON', { virtuals: true });
// productSchema.set('toObject', { virtuals: true });

// const Product = mongoose.model<IProduct>('Product', productSchema);

// export default Product;
// export { IProduct };


// models/productModel.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  tags?: string[];
  images: { url: string; description: string }[];
  thumbnail: string;
  user_id: mongoose.Schema.Types.ObjectId;
  business_id: mongoose.Schema.Types.ObjectId;
  currency: string;
  product_options_ids?: mongoose.Schema.Types.ObjectId[];
  product_category_id?: mongoose.Schema.Types.ObjectId;
  discount_percent: number;
  discount_start?: Date | null;   // NEW
  discount_end?: Date | null;     // NEW
  final_price?: number;           // Virtual (computed)
  discount_active?: boolean;      // Virtual (computed)
  current_discount_percent?: number; // Virtual (computed)
}

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    images: [
      {
        url: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    thumbnail: { type: String },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    currency: { type: String, required: true, default: 'USD' },
    product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },

    discount_percent: { type: Number, min: 0, max: 100, default: 0 },
    product_options_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductOption' }],

    // NEW: optional discount window (store in UTC)
    discount_start: { type: Date, default: null },
    discount_end: { type: Date, default: null },
  },
  { timestamps: true }
);

// Helper to check if discount is active as of "now"
function isDiscountActive(doc: any, now = new Date()): boolean {
  const p = typeof doc.discount_percent === 'number' ? doc.discount_percent : 0;
  if (!p || p <= 0) return false;

  const start = doc.discount_start ? new Date(doc.discount_start) : null;
  const end = doc.discount_end ? new Date(doc.discount_end) : null;

  if (!start && !end) return true;               // unlimited
  if (start && now < start) return false;        // not started yet
  if (end && now > end) return false;            // already ended
  return true;
}

// Virtuals
productSchema.virtual('discount_active').get(function (this: any) {
  return isDiscountActive(this);
});

productSchema.virtual('current_discount_percent').get(function (this: any) {
  return isDiscountActive(this) ? (this.discount_percent ?? 0) : 0;
});

productSchema.virtual('final_price').get(function (this: any) {
  const base = typeof this.price === 'number' ? this.price : 0;
  const pct = isDiscountActive(this) ? (this.discount_percent || 0) : 0;
  const discounted = base * (1 - pct / 100);
  return Math.round(discounted * 100) / 100;
});

// Ensure virtuals show up
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Optional: add indexes to help window queries (e.g., find currently discounted)
productSchema.index({ discount_start: 1 });
productSchema.index({ discount_end: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
export { IProduct };



