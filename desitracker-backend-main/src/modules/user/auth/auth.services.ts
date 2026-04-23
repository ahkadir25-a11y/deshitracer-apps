import fs from 'fs';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import config from '../../../config';
import AppError from '../../../errors/AppError';
import { JwtHelpers, TJwtPayload } from '../../../utils/jwt';
import sendEmail from '../../../utils/lib/sendEmail';
import { User } from '../user/user.model';
import { TLoginPayloadData } from './auth.interface';

// Login User
const loginUser = async (payload: TLoginPayloadData) => {
  const { email, phoneNumber, password } = payload;

  // Check if user has provided either email or phone number
  if (!email && !phoneNumber) {
    throw new AppError(400, 'Email or phone number is required!');
  }

  // Check if password is provided
  if (!password) {
    throw new AppError(400, 'Password is required!');
  }

  // Find user by email or phone number
  const user = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase() }] : []),
      ...(phoneNumber ? [{ phone: phoneNumber }] : []),
    ],
  }).select('+password');

  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  // Verify password
  const isPasswordMatched = await User.comparePassword(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Incorrect Password!');
  }

  // Create JWT payload
  const jwtPayloadData: TJwtPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    ...(phoneNumber && { phoneNumber: user.phone }),
  };

  // Generate access token
  const accessToken = JwtHelpers.createToken(
    jwtPayloadData,
    config.jwt.accessSecret as string,
    config.jwt.accessExpiresIn,
  );

  return {
    accessToken,
  };
};



// Forgot Password
const forgotPassword = async ({ email }: { email: string }) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Create JWT reset token
  const jwtPayloadData: TJwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const resetToken = JwtHelpers.createToken(
    jwtPayloadData,
    config.jwt.accessSecret as string,
    '10m'
  );

  // Save user if needed (e.g., update reset fields, optional)
  await user.save({ validateBeforeSave: false });

  // Read HTML template
  const templatePath = path.join(process.cwd(), 'src/data/passwordResetTemplate.html');
  const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders
  const resetLink = `https://www.desitracker.co.uk/auth/reset-password/${resetToken}`;
  const emailContent = emailTemplate.replace(/{{reset_link}}/g, resetLink);

  console.log("user", user)
  // Send email using your sendEmail function
  sendEmail({
    email: user.email,
    subject: `${config.companyName} Password Recovery`,
    message: emailContent,
  });

  // Return reset link for reference (optional)
  return { reset_link: resetLink };
};


// Reset Password
const resetPassword = async (
  token: string,
  { newPassword }: { newPassword: string },
) => {
  // creating token hash
  const decodedUser: JwtPayload = JwtHelpers.verifyToken(
    token,
    config.jwt.accessSecret as string,
  );

  const user = await User.findById(decodedUser?.id);

  if (!user) {
    throw new AppError(
      400,
      'Reset Password Token is invalid or has been expired',
    );
  }

  user.password = newPassword;

  await user.save();

  const jwtPayloadData: TJwtPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = JwtHelpers.createToken(
    jwtPayloadData,
    config.jwt.accessSecret as string,
    config.jwt.accessExpiresIn,
  );

  return {
    user,
    accessToken,
  };
};

export const AuthServices = {
  loginUser,
  forgotPassword,
  resetPassword,
};
