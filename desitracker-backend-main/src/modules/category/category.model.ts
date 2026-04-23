import mongoose from 'mongoose';
import { TCategory } from './category.interface';

const categorySchema = new mongoose.Schema<TCategory>(
  {
    name: {
      type: String,
      required: [true, 'Please enter category name'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.model<TCategory>('Category', categorySchema);
