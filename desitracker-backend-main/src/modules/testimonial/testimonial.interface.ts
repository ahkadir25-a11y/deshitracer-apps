import mongoose from 'mongoose';

export type TTestimonial = {
  user: mongoose.Types.ObjectId;
  rating: number;
  feedback?: string;
  show: boolean;
};
