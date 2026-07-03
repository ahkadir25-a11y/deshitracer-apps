export const config = {
  // ...your existing config
  memberJwtSecret: process.env.MEMBER_JWT_SECRET || process.env.JWT_SECRET,
  memberJwtExpiresIn: process.env.MEMBER_JWT_EXPIRES_IN || '7d',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'https://desitracker.com',
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryImageFolderName: process.env.CLOUDINARY_FOLDER || 'deshi-tracker',
};
