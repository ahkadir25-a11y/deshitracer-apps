import mongoose, { Schema } from 'mongoose';
import { TTestimonial } from './testimonial.interface';

// Review Schema Definition
const TestimonialSchema: Schema = new Schema<TTestimonial>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '' },
    show: { type: Boolean, required: true, default: true }, // To control visibility of review
  },
  { timestamps: true },
);
const Testimonial = mongoose.model<TTestimonial>(
  'Testimonial',
  TestimonialSchema,
);

export default Testimonial;
