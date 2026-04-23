import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProductOption extends Document {
  name: string;
  options: string[];
  userId: Types.ObjectId;
}

const productOptionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const ProductOption = mongoose.model<IProductOption>(
  "ProductOption",
  productOptionSchema
);

export default ProductOption;