import AppError from '../../../errors/AppError';
import cloudinary, {
  sendImageToCloudinary,
} from '../../../utils/lib/sendImageToCloudinery';
import { Banner } from './banner.model';

// Create a new banner
const createBanner = async (bannerImage: any) => {
  const bannerData: any = {};
  if (bannerImage) {
    const imageName = `${bannerImage?.filename}-${new Date().toISOString()}`;
    const path = bannerImage?.path;
    const response = await sendImageToCloudinary(imageName, path, 'web_banner');
    bannerData.url = response.secure_url as string;
    bannerData.public_id = response.public_id as string;
  }
  return await Banner.create(bannerData);
};

// Get all banners
const getAllBanners = async () => {
  return await Banner.find();
};

// Get a single banner by ID
const getSingleBanner = async (id: string) => {
  return await Banner.findById(id);
};

// Delete a banner
const deleteBanner = async (id: string) => {
  const image = await Banner.findById(id);

  if (!image) {
    throw new AppError(404, 'Banner is not found.');
  }

  await cloudinary.uploader.destroy(image?.public_id);

  return await Banner.findByIdAndDelete(image._id);
};

export const BannerServices = {
  createBanner,
  getAllBanners,
  getSingleBanner,
  deleteBanner,
};
