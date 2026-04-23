import mongoose from 'mongoose';
import { TBanner } from './banner.interface';

const bannerSchema = new mongoose.Schema<TBanner>({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  // position: {
  //   type: Number,
  //   required: true,
  //   default: 0,
  // },
  redirectURL: {
    type: String,
  },
});

export const Banner = mongoose.model<TBanner>('Banner', bannerSchema);
