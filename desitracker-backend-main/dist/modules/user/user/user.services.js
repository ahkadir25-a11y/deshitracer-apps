"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const user_model_1 = require("./user.model");
const cascadeCleanup_1 = require("../../../utils/lib/cascadeCleanup");
// Register a User
const registerUser = (payload, image) => __awaiter(void 0, void 0, void 0, function* () {
    // ⚠️ Don't call removePhoneNumberIndex() here unless absolutely necessary
    const { profilePic } = payload, remaining = __rest(payload, ["profilePic"]);
    const userData = Object.assign({}, remaining);
    // Role policy for PUBLIC self-registration:
    //   - 'user' (member) and 'business_owner' may self-register.
    //   - 'staff' accounts are ONLY created via the employer's invite flow
    //     (rota/employees/accept-invite) — never here.
    //   - 'admin' can never be self-assigned from an unauthenticated endpoint.
    const requestedRole = String((payload === null || payload === void 0 ? void 0 : payload.role) || 'user');
    if (requestedRole === 'staff') {
        throw new AppError_1.default(403, 'Staff accounts are created by your employer. Ask your business owner for an invite instead of registering here.');
    }
    if (requestedRole !== 'user' && requestedRole !== 'business_owner') {
        throw new AppError_1.default(403, 'This account type cannot be self-registered.');
    }
    userData.role = requestedRole;
    if (payload.email) {
        userData.email = payload.email.toLowerCase();
    }
    // One email = one account (and one role). Explain which kind of account the
    // email is already tied to, instead of surfacing a raw duplicate-key error.
    // In particular: a STAFF email can never be reused to create an owner account.
    if (userData.email) {
        const existing = yield user_model_1.User.findOne({ email: userData.email });
        if (existing && !existing.isDeleted) {
            const roleLabel = existing.role === 'business_owner' ? 'Business Owner'
                : existing.role === 'staff' ? 'Staff'
                    : existing.role === 'admin' ? 'Admin'
                        : 'Member';
            if (existing.role === 'staff') {
                throw new AppError_1.default(409, 'This email belongs to a Staff account managed by an employer, so it cannot be used to create a new account. Please use a different email address.');
            }
            throw new AppError_1.default(409, `This email is already registered as a ${roleLabel} account. Please sign in instead, or use a different email address.`);
        }
    }
    if (image) {
        const imageName = `${userData === null || userData === void 0 ? void 0 : userData.email}-${new Date()}`;
        const path = image === null || image === void 0 ? void 0 : image.path;
        const { secure_url } = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(imageName, path, 'web_user');
        userData.profilePic = secure_url;
    }
    // NOTE: the stale unique `phone_1` index (if any) is dropped once at server
    // startup, not per-registration — see main() in server.ts.
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
        // Security: changing email requires the current password. Without this,
        // a stolen session lets an attacker swap the email and take over the
        // account via forgot-password.
        const existing = yield user_model_1.User.findById(userId).select('+password +email');
        if (!existing)
            throw new AppError_1.default(404, 'User is not found!');
        const wantsEmailChange = typeof payload.email === 'string' &&
            payload.email.toLowerCase() !== (existing.email || '').toLowerCase();
        if (wantsEmailChange) {
            const current = payload.currentPassword;
            if (!current) {
                throw new AppError_1.default(401, 'Current password is required to change your email.');
            }
            const bcrypt = yield Promise.resolve().then(() => __importStar(require('bcrypt')));
            const ok = yield bcrypt.compare(current, existing.password || '');
            if (!ok)
                throw new AppError_1.default(401, 'Current password is incorrect.');
        }
        // Strip the proof so we never persist it on the user doc.
        // Also strip `password` and `role` — password changes must go through the
        // dedicated change-password flow (which requires oldPassword), and role
        // must not be self-elevated via this endpoint.
        const _a = payload, { currentPassword, password, role } = _a, rest = __rest(_a, ["currentPassword", "password", "role"]);
        const userData = Object.assign(Object.assign({}, rest), { profilePic: payload === null || payload === void 0 ? void 0 : payload.profilePicUrl });
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
        console.error('Error updating user:', error);
        throw error;
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
// Delete User — hard delete: row is removed from the collection so the
// email becomes available again. Old soft-delete behavior left the row
// (with isDeleted:true) and the unique email index still blocked re-signups.
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Make sure the user exists before we touch anything related to them.
    const existing = yield user_model_1.User.findById(userId);
    if (!existing) {
        throw new AppError_1.default(404, 'User is not found!');
    }
    // Cascade-clean what this user leaves behind: any businesses they own (and
    // everything under those businesses) plus any staff records linked to them.
    // This prevents orphaned Business.owner / RotaEmployee.user references.
    yield (0, cascadeCleanup_1.cleanupUserRelations)(userId);
    const user = yield user_model_1.User.findByIdAndDelete(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User is not found!');
    }
    return user;
});
// Self-service account deletion — the logged-in user deletes their OWN account.
// Required by Apple App Store & Google Play for any self-created account.
//
// Staff are an exception: their account is created and managed by their
// employer (the business owner), so they CANNOT self-delete. The owner removes
// them from the team instead. Both stores explicitly allow this for
// organization-managed accounts.
const deleteOwnAccount = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role === 'staff') {
        throw new AppError_1.default(403, 'Your staff account is managed by your employer. Please contact your business owner to remove your account.');
    }
    return deleteUser(userId);
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
    deleteOwnAccount,
    getUsers,
};
