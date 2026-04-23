import mongoose from 'mongoose';

export type TBanner = {
  public_id: string;
  url: string;

  redirectURL?: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
