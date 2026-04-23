import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';

// Configure disk storage (you can switch to memoryStorage if needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to temporarily store files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow any image format
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};


// Configure Cloudinary
cloudinary.config({
cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const sendImageToCloudinary2 = async (
  name: string,
  path: string,
  folder: string
): Promise<{ secure_url: string }> => {
  const result = await cloudinary.uploader.upload(path, {
    public_id: name,
    folder,
    resource_type: 'image', // Allow Cloudinary to handle any image type
    format: undefined, // Let Cloudinary infer the format
  });
  return { secure_url: result.secure_url };
};


export const upload2 = multer({ storage, fileFilter });
