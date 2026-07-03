"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const activity_controller_1 = require("./activity.controller");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.STAFF), activity_controller_1.ActivityControllers.logActivity);
router.get('/feed/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.STAFF), activity_controller_1.ActivityControllers.getActivityByBusiness);
router.get('/dashboard/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), activity_controller_1.ActivityControllers.getOwnerDashboardStats);
exports.ActivityRoutes = router;
