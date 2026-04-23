import mongoose from 'mongoose';

export type TSlider = {
  public_id: string;
  url: string;
  position: number;
  redirectURL?: string;
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
