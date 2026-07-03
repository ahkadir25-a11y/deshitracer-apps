"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const router = express_1.default.Router();
router.get('/business/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), notification_controller_1.NotificationControllers.getNotifications);
router.patch('/business/:businessId/read-all', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), notification_controller_1.NotificationControllers.markAllAsRead);
router.patch('/:id/read', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), notification_controller_1.NotificationControllers.markAsRead);
exports.NotificationRoutes = router;
