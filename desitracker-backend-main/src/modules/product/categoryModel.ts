// models/categoryModel.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProductCategory extends Document {
  name: string;
  description?: string;
  foodOrDrink?: string;
  products: mongoose.Types.ObjectId[];
  user_id: mongoose.Types.ObjectId;
  business_id: mongoose.Types.ObjectId;
}

const categorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    foodOrDrink: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    business_id: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  },
  { timestamps: true }
);

// IMPORTANT: reuse if already compiled
const ProductCategory: Model<IProductCategory> =
  (mongoose.models.ProductCategory as Model<IProductCategory>) ||
  mongoose.model<IProductCategory>('ProductCategory', categorySchema);

export default ProductCategory;
