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
exports.AuthControllers = void 0;
const config_1 = __importDefault(require("../../../config"));
const handleAsyncRequest_1 = __importDefault(require("../../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const setCookie_1 = require("../../../utils/setCookie");
const auth_services_1 = require("./auth.services");
// Login User
const loginUser = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.loginUser(req.body);
    (0, setCookie_1.setCookie)(result === null || result === void 0 ? void 0 : result.accessToken, res);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Login is successfully!',
        data: result,
    });
}));
// Logout User
const logoutUser = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('accessToken', null, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Logout is successfully!',
        data: null,
    });
}));
// Forgot Password
const forgotPassword = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.forgotPassword(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Password reset link is sent to your email!',
        data: result,
    });
}));
// Reset Password
const resetPassword = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield auth_services_1.AuthServices.resetPassword((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.token, req === null || req === void 0 ? void 0 : req.body);
    (0, setCookie_1.setCookie)(result === null || result === void 0 ? void 0 : result.accessToken, res);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Password is changed successfully!!',
        data: { accessToken: result === null || result === void 0 ? void 0 : result.accessToken },
    });
}));
exports.AuthControllers = {
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
};
