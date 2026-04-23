import AppError from '../../../errors/AppError';
import cloudinary, {
  sendImageToCloudinary,
} from '../../../utils/lib/sendImageToCloudinery';
import { TSlider } from './slider.interface';
import { Slider } from './slider.model';

const createSlider = async (payload: TSlider, sliderImage: any) => {
  const sliderData = { ...payload };
  let publicId: string = '';
  if (sliderImage) {
    const imageName = `${sliderImage?.filename}-${new Date().toISOString()}`;
    const path = sliderImage?.path;
    const response = await sendImageToCloudinary(imageName, path, 'web_slider');
    publicId = response.public_id as string;

    sliderData.url = response.secure_url as string;
    sliderData.public_id = response.public_id as string;
  }
  try {
    return await Slider.create(sliderData);
  } catch (err: any) {
    await cloudinary.uploader.destroy(publicId);

    throw new AppError(400, `Failed to create slider: ${err?.message}`);
  }
};

const getAllSliders = async () => {
  return await Slider.find();
};

const getSingleSlider = async (id: string) => {
  const result = await Slider.findById(id);
  return result;
};

const deleteSlider = async (id: string) => {
  const slider = await Slider.findById(id);

  if (!slider) {
    throw new AppError(404, 'Slider is not found.');
  }

  await cloudinary.uploader.destroy(slider?.public_id);

  return await Slider.findByIdAndDelete(id);
};

export const SliderServices = {
  createSlider,
  getAllSliders,
  getSingleSlider,
  deleteSlider,
};
