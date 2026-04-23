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
    (0, sendEmail_1.default)({
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
exports.AuthServices = {
    loginUser,
    forgotPassword,
    resetPassword,
};
