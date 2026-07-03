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
  await sendEmail({
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

// ── In-app code (OTP) password reset ───────────────────────────────────────
// Owner forgot their current password → email a 6-digit code → they type the
// code + a new password in the app. No web link involved.

const RESET_CODE_TTL_MIN = 10;

const requestResetCode = async ({ email }: { email: string }) => {
  const user = await User.findOne({ email: email?.toLowerCase() });
  // Don't reveal whether the email exists — always behave the same.
  if (!user) {
    return { sent: true };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  user.passwordResetCode = code;
  user.passwordResetCodeExpires = new Date(Date.now() + RESET_CODE_TTL_MIN * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: `${config.companyName} password reset code`,
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#0f172a; margin:0 0 12px;">Your password reset code</h2>
        <p style="color:#334155; font-size:14px;">Use this code in the app to set a new password:</p>
        <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#5B4FE8; text-align:center; margin:18px 0;">${code}</div>
        <p style="color:#64748b; font-size:12px;">This code expires in ${RESET_CODE_TTL_MIN} minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
};

const resetPasswordWithCode = async ({
  email,
  code,
  newPassword,
}: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  if (!email || !code || !newPassword) {
    throw new AppError(400, 'Email, code and new password are required');
  }
  if (String(newPassword).length < 8) {
    throw new AppError(400, 'Password should be at least 8 characters');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordResetCode +passwordResetCodeExpires',
  );
  if (!user || !user.passwordResetCode || !user.passwordResetCodeExpires) {
    throw new AppError(400, 'No reset request found. Please request a new code.');
  }
  if (user.passwordResetCodeExpires.getTime() < Date.now()) {
    throw new AppError(400, 'This code has expired. Please request a new one.');
  }
  if (String(user.passwordResetCode) !== String(code).trim()) {
    throw new AppError(400, 'Incorrect code. Please check and try again.');
  }

  user.password = newPassword;
  user.passwordResetCode = null;
  user.passwordResetCodeExpires = null;
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

  return { accessToken };
};

export const AuthServices = {
  loginUser,
  forgotPassword,
  resetPassword,
  requestResetCode,
  resetPasswordWithCode,
};
