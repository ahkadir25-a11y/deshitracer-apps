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
const getUserDetails = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_services_1.UserServices.getUserDetails((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
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
    const userId = req.params.id;
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
exports.UserControllers = {
    registerUser,
    getUserDetails,
    updateUser,
    updatePassword,
    deleteUser,
    getUsers,
    getMe,
};
