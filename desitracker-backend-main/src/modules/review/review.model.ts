import mongoose, { Schema } from 'mongoose';
import { TReview } from './review.interface'; // Assuming you have a separate file for types

// Review Schema Definition
const ReviewSchema: Schema = new Schema<TReview>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: false,
    // },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '' },
    show: { type: Boolean, required: true, default: true }, // To control visibility of review
  },
  { timestamps: true },
);
const Review = mongoose.model<TReview>('Review', ReviewSchema);

export default Review;
