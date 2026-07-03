"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const jwt_1 = require("../../../utils/jwt");
const sendEmail_1 = __importDefault(require("../../../utils/lib/sendEmail"));
const user_model_1 = require("../user/user.model");
// Login User
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber, password } = payload;
    // Check if user has provided either email or phone number
    if (!email && !phoneNumber) {
        throw new AppError_1.default(400, 'Email or phone number is required!');
    }
    // Check if password is provided
    if (!password) {
        throw new AppError_1.default(400, 'Password is required!');
    }
    // Find user by email or phone number
    const user = yield user_model_1.User.findOne({
        $or: [
            ...(email ? [{ email: email.toLowerCase() }] : []),
            ...(phoneNumber ? [{ phone: phoneNumber }] : []),
        ],
    }).select('+password');
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    // Verify password
    const isPasswordMatched = yield user_model_1.User.comparePassword(password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(401, 'Incorrect Password!');
    }
    // Create JWT payload
    const jwtPayloadData = Object.assign({ id: user._id.toString(), role: user.role, email: user.email }, (phoneNumber && { phoneNumber: user.phone }));
    // Generate access token
    const accessToken = jwt_1.JwtHelpers.createToken(jwtPayloadData, config_1.default.jwt.accessSecret, config_1.default.jwt.accessExpiresIn);
    return {
        accessToken,
    };
});
// Forgot Password
const forgotPassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    // Find user by email
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    // Create JWT reset token
    const jwtPayloadData = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    const resetToken = jwt_1.JwtHelpers.createToken(jwtPayloadData, config_1.default.jwt.accessSecret, '10m');
    // Save user if needed (e.g., update reset fields, optional)
    yield user.save({ validateBeforeSave: false });
    // Read HTML template
    const templatePath = path_1.default.join(process.cwd(), 'src/data/passwordResetTemplate.html');
    const emailTemplate = fs_1.default.readFileSync(templatePath, 'utf-8');
    // Replace placeholders
    const resetLink = `https://www.desitracker.co.uk/auth/reset-password/${resetToken}`;
    const emailContent = emailTemplate.replace(/{{reset_link}}/g, resetLink);
    console.log("user", user);
    // Send email using your sendEmail function
    yield (0, sendEmail_1.default)({
        email: user.email,
        subject: `${config_1.default.companyName} Password Recovery`,
        message: emailContent,
    });
    // Return reset link for reference (optional)
    return { reset_link: resetLink };
});
// Reset Password
const resetPassword = (token_1, _a) => __awaiter(void 0, [token_1, _a], void 0, function* (token, { newPassword }) {
    // creating token hash
    const decodedUser = jwt_1.JwtHelpers.verifyToken(token, config_1.default.jwt.accessSecret);
    const user = yield user_model_1.User.findById(decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.id);
    if (!user) {
        throw new AppError_1.default(400, 'Reset Password Token is invalid or has been expired');
    }
    user.password = newPassword;
    yield user.save();
    const jwtPayloadData = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
    };
    const accessToken = jwt_1.JwtHelpers.createToken(jwtPayloadData, config_1.default.jwt.accessSecret, config_1.default.jwt.accessExpiresIn);
    return {
        user,
        accessToken,
    };
});
// ── In-app code (OTP) password reset ───────────────────────────────────────
// Owner forgot their current password → email a 6-digit code → they type the
// code + a new password in the app. No web link involved.
const RESET_CODE_TTL_MIN = 10;
const requestResetCode = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    const user = yield user_model_1.User.findOne({ email: email === null || email === void 0 ? void 0 : email.toLowerCase() });
    // Don't reveal whether the email exists — always behave the same.
    if (!user) {
        return { sent: true };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    user.passwordResetCode = code;
    user.passwordResetCodeExpires = new Date(Date.now() + RESET_CODE_TTL_MIN * 60 * 1000);
    yield user.save({ validateBeforeSave: false });
    yield (0, sendEmail_1.default)({
        email: user.email,
        subject: `${config_1.default.companyName} password reset code`,
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
});
const resetPasswordWithCode = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, code, newPassword, }) {
    if (!email || !code || !newPassword) {
        throw new AppError_1.default(400, 'Email, code and new password are required');
    }
    if (String(newPassword).length < 8) {
        throw new AppError_1.default(400, 'Password should be at least 8 characters');
    }
    const user = yield user_model_1.User.findOne({ email: email.toLowerCase() }).select('+passwordResetCode +passwordResetCodeExpires');
    if (!user || !user.passwordResetCode || !user.passwordResetCodeExpires) {
        throw new AppError_1.default(400, 'No reset request found. Please request a new code.');
    }
    if (user.passwordResetCodeExpires.getTime() < Date.now()) {
        throw new AppError_1.default(400, 'This code has expired. Please request a new one.');
    }
    if (String(user.passwordResetCode) !== String(code).trim()) {
        throw new AppError_1.default(400, 'Incorrect code. Please check and try again.');
    }
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;
    yield user.save();
    const jwtPayloadData = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
    };
    const accessToken = jwt_1.JwtHelpers.createToken(jwtPayloadData, config_1.default.jwt.accessSecret, config_1.default.jwt.accessExpiresIn);
    return { accessToken };
});
exports.AuthServices = {
    loginUser,
    forgotPassword,
    resetPassword,
    requestResetCode,
    resetPasswordWithCode,
};
