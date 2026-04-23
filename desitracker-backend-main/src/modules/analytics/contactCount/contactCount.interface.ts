import mongoose from 'mongoose';

export type TContactCount = {
  business: mongoose.Types.ObjectId;
  username?: string;
};
