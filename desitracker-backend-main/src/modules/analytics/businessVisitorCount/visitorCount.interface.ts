import mongoose from 'mongoose';

export type TVisitorCount = {
  business: mongoose.Types.ObjectId;
  member?: mongoose.Types.ObjectId;
  ipAddress?: string;
};
