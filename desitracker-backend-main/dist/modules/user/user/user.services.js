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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const jwt_1 = require("../../../utils/jwt");
const sendImageToCloudinery_1 = require("../../../utils/lib/sendImageToCloudinery");
const queryBuilder_1 = __importDefault(require("../../../utils/queryBuilder"));
const removeIndex_1 = __importDefault(require("./removeIndex"));
const user_model_1 = require("./user.model");
// Register a User
const registerUser = (payload, image) => __awaiter(void 0, void 0, void 0, function* () {
    // ⚠️ Don't call removePhoneNumberIndex() here unless absolutely necessary
    const { profilePic } = payload, remaining = __rest(payload, ["profilePic"]);
    const userData = Object.assign({}, remaining);
    if (payload === null || payload === void 0 ? void 0 : payload.role) {
        userData.role = payload.role;
        if (payload.role === 'admin') {
            userData.userStatus = 'verified';
        }
    }
    if (payload.email) {
        userData.email = payload.email.toLowerCase();
    }
    if (image) {
        const imageName = `${userData === null || userData === void 0 ? void 0 : userData.email}-${new Date()}`;
        const path = image === null || image === void 0 ? void 0 : image.path;
        const { secure_url } = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(imageName, path, 'web_user');
        userData.profilePic = secure_url;
    }
    yield (0, removeIndex_1.default)();
    const result = yield user_model_1.User.create(userData);
    const jwtPayloadData = {
        id: result._id.toString(),
        role: result.role,
        email: result.email,
    };
    const accessToken = jwt_1.JwtHelpers.createToken(jwtPayloadData, config_1.default.jwt.accessSecret, config_1.default.jwt.accessExpiresIn);
    return {
        user: result,
        accessToken,
    };
});
// Get User Detail
const getUserDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(userId);
    if (!result) {
        throw new AppError_1.default(404, 'User is not found!');
    }
    return result;
});
// Update User
const updateUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = Object.assign(Object.assign({}, payload), { profilePic: payload === null || payload === void 0 ? void 0 : payload.profilePicUrl });
        console.log(userData);
        const result = yield user_model_1.User.findByIdAndUpdate(userId, userData, {
            new: true,
            runValidators: true,
        });
        if (!result) {
            throw new AppError_1.default(404, 'User is not found!');
        }
        return result;
    }
    catch (error) {
        // Handle specific errors (optional)
        console.error('Error updating user:', error);
        throw error; // Re-throw error for upstream handling
    }
});
// Update User  Password
const updatePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+password');
    if (!user) {
        throw new AppError_1.default(403, 'Un authorized access');
    }
    const isPasswordMatched = yield user_model_1.User.comparePassword(payload.oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(400, 'Old password is incorrect');
    }
    if (payload.newPassword !== payload.confirmPassword) {
        throw new AppError_1.default(400, 'password does not match');
    }
    user.password = payload.newPassword;
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
// Delete User
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true, runValidators: true });
    if (!user) {
        throw new AppError_1.default(404, 'User is not found!');
    }
    return user;
});
// Get Users
const getUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = new queryBuilder_1.default(user_model_1.User.find({ isDeleted: false }), query)
        .search(['name', 'email'])
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    const result = yield userQuery.modelQuery;
    const meta = yield userQuery.countTotal();
    return {
        meta,
        result,
    };
});
exports.UserServices = {
    registerUser,
    getUserDetails,
    updateUser,
    updatePassword,
    deleteUser,
    getUsers,
};
