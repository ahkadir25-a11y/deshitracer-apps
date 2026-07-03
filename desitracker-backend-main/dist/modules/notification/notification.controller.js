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
exports.NotificationControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const notification_service_1 = require("./notification.service");
const http_status_1 = __importDefault(require("http-status"));
const getNotifications = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = req.params.businessId;
    const result = yield notification_service_1.NotificationServices.getNotifications(businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
    });
}));
const markAsRead = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield notification_service_1.NotificationServices.markAsRead(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Notification marked as read',
        data: result,
    });
}));
const markAllAsRead = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = req.params.businessId;
    const result = yield notification_service_1.NotificationServices.markAllAsRead(businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All notifications marked as read',
        data: result,
    });
}));
exports.NotificationControllers = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};
