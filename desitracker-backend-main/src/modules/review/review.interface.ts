import mongoose from 'mongoose';

export type TReview = {
  business: mongoose.Types.ObjectId;
  // user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  rating: number;
  feedback?: string;
  show: boolean;
};
