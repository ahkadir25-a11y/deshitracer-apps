import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  db_url: process.env.DB_URL,
  saltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  smptHost: process.env.SMPT_HOST,
  smptPort: process.env.SMPT_PORT,
  nodemailerUser: process.env.NODEMAILER_USER,
  nodemailerPass: process.env.NODEMAILER_PASS,
  companyName: process.env.COMPANY_NAME,
  rootUiURL: process.env.ROOT_UI_URL,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KAY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryImageFolderName: process.env.IMAGE_FOLDER_NAME,
  adminEmail: process.env.ADMIN_EMAIL,
};
