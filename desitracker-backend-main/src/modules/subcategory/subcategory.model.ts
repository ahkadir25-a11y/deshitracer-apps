import mongoose from 'mongoose';
import { TSubcategory } from './subcategory.interface';

const subcategorySchema = new mongoose.Schema<TSubcategory>(
  {
    name: {
      type: String,
      required: true,
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
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true },
);

export const Subcategory = mongoose.model<TSubcategory>(
  'Subcategory',
  subcategorySchema,
);
