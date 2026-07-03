"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const sendImageToCloudinery_1 = require("../../../utils/lib/sendImageToCloudinery");
const auth_constants_1 = require("../auth/auth.constants");
const user_controllers_1 = require("./user.controllers");
const router = (0, express_1.Router)();
router.post('/register', sendImageToCloudinery_1.upload.single('file'), (req, res, next) => {
    var _a;
    console.log('bor ouch');
    req.body = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data);
    next();
}, user_controllers_1.UserControllers.registerUser);
router.get('/me', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.getMe);
// Admin-only: full user listing exposes emails/phones (PII) — must never be public.
router.get('/', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), user_controllers_1.UserControllers.getUsers);
// Any signed-in user may fetch a user by id (website business form needs it),
// but anonymous access is blocked — the payload contains email/phone (PII).
router.get('/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.getUserDetails);
router.put('/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.updateUser);
// Self-service account deletion — must be declared BEFORE '/:id' so that
// 'me' is not captured as a user id. Owners & members can delete their own
// account; staff are blocked in the service (employer-managed).
router.delete('/me', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.deleteMe);
router.delete('/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), user_controllers_1.UserControllers.deleteUser);
// Owner/staff saves their Expo push token.
router.put('/me/push-token', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.savePushToken);
// Secure self-service password change — requires the CURRENT password
// (oldPassword) so a stolen unlocked device can't silently change it. This is
// the App Store / Play Store compliant flow, separate from forgot-password.
router.put('/me/change-password', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), user_controllers_1.UserControllers.updatePassword);
exports.UserRoutes = router;
