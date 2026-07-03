import mongoose from 'mongoose';

export type TVisitorCount = {
  business: mongoose.Types.ObjectId;
  ipAddress?: string;
};
