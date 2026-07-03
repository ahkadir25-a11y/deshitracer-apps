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
exports.NotificationServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const notification_model_1 = require("./notification.model");
const http_status_1 = __importDefault(require("http-status"));
const createNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.create(payload);
    return result;
});
const getNotifications = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield notification_model_1.Notification.find({ business: businessId })
        .sort({ createdAt: -1 })
        .limit(50);
    return notifications;
});
const markAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    if (!notification) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Notification not found');
    }
    return notification;
});
const markAllAsRead = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ business: businessId, isRead: false }, { isRead: true });
    return result;
});
exports.NotificationServices = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
};
