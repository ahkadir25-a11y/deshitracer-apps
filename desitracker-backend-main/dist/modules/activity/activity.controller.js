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
exports.ActivityControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const activity_service_1 = require("./activity.service");
const logActivity = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield activity_service_1.ActivityServices.logActivity(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Activity logged',
        data: result,
    });
}));
const getActivityByBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const result = yield activity_service_1.ActivityServices.getActivityByBusiness(req.params.businessId, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Activity feed retrieved',
        data: result,
    });
}));
const getOwnerDashboardStats = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield activity_service_1.ActivityServices.getOwnerDashboardStats(req.params.businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Dashboard stats retrieved',
        data: result,
    });
}));
exports.ActivityControllers = {
    logActivity,
    getActivityByBusiness,
    getOwnerDashboardStats,
};
