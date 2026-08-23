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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const setCookie_1 = require("../../../utils/setCookie");
const user_services_1 = require("./user.services");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
// Register a User
const registerUser = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.UserServices.registerUser(req.body, req.file);
    (0, setCookie_1.setCookie)(result.accessToken, res);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User is registered successfully!',
        data: result,
    });
}));
// Get User Detail
// Any signed-in user could fetch any other user's full record here, which put
// the whole user base's emails and phone numbers one loop away from being
// harvested. The route is left reachable because callers legitimately need to
// resolve a name from an id; what changes is that contact details are stripped
// unless the caller is that user or an admin.
const PUBLIC_USER_FIELDS = ['_id', 'name', 'role', 'image', 'profileImage', 'createdAt'];
const stripPII = (doc) => {
    const src = typeof (doc === null || doc === void 0 ? void 0 : doc.toObject) === 'function' ? doc.toObject() : doc;
    if (!src)
        return src;
    const out = {};
    for (const key of PUBLIC_USER_FIELDS) {
        if (src[key] !== undefined)
            out[key] = src[key];
    }
    return out;
};
const getUserDetails = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const targetId = String((_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '');
    const full = yield user_services_1.UserServices.getUserDetails(targetId);
    const caller = req.user;
    const isSelf = (caller === null || caller === void 0 ? void 0 : caller.id) && String(caller.id) === targetId;
    const isAdmin = String(caller === null || caller === void 0 ? void 0 : caller.role) === 'admin';
    const result = isSelf || isAdmin ? full : stripPII(full);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User details is retrieved successfully!',
        data: result,
    });
}));
const getMe = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_services_1.UserServices.getUserDetails((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User details is retrieved successfully!',
        data: result,
    });
}));
// Update User
const updateUser = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.params.id;
    // Authorization: a user can only update their own record. Admins may
    // update anyone (still no password/role through this route — stripped
    // in the service).
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin' && String((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== String(userId)) {
        throw new AppError_1.default(403, 'You can only update your own account.');
    }
    // 💡 Safe parse if needed
    let payload = req.body;
    // Check if body has 'data' field (as in your POST route)
    if (payload === null || payload === void 0 ? void 0 : payload.data) {
        try {
            payload = JSON.parse(payload.data);
        }
        catch (error) {
            console.error('Invalid JSON in req.body.data:', error);
            throw new AppError_1.default(400, 'Invalid JSON in request');
        }
    }
    console.log('Update User Payload:', payload);
    const result = yield user_services_1.UserServices.updateUser(userId, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User data is updated successfully!',
        data: result,
    });
}));
// Update User  Password
const updatePassword = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.UserServices.updatePassword(req.user.id, req.body);
    (0, setCookie_1.setCookie)(result.accessToken, res);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Password is changed successfully!',
        data: result.user,
    });
}));
// Delete User
const deleteUser = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.UserServices.deleteUser(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'User is deleted successfully!',
        data: result,
    });
}));
// Delete own account (self-service). Owners/members can; staff cannot.
const deleteMe = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield user_services_1.UserServices.deleteOwnAccount((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Your account has been deleted successfully.',
        data: result,
    });
}));
// Get Users
const getUsers = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.UserServices.getUsers(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Users are retrieved successfully!',
        meta: result.meta,
        data: result.result,
    });
}));
const savePushToken = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.id))
        throw new AppError_1.default(401, 'Not authenticated');
    const { token } = req.body;
    if (!token || typeof token !== 'string')
        throw new AppError_1.default(400, 'token is required');
    const { User } = yield Promise.resolve().then(() => __importStar(require('./user.model')));
    yield User.findByIdAndUpdate(user.id, { expoPushToken: token });
    (0, sendResponse_1.default)(res, { success: true, statusCode: 200, message: 'Push token saved', data: null });
}));
exports.UserControllers = {
    registerUser,
    getUserDetails,
    updateUser,
    updatePassword,
    deleteUser,
    deleteMe,
    getUsers,
    getMe,
    savePushToken,
};
