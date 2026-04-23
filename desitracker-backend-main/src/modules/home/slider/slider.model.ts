import mongoose from 'mongoose';
import { TSlider } from './slider.interface';

const sliderSchema = new mongoose.Schema<TSlider>({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
    unique: true,
    default: 0,
  },
  redirectURL: {
    type: String,
  },
});
export const Slider = mongoose.model<TSlider>('Slider', sliderSchema);
