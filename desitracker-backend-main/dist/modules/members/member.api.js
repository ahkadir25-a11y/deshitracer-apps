"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberRoutes = void 0;
const express_1 = require("express");
const member_controller_1 = require("./member.controller");
const memberAuth_1 = require("../../middlewares/memberAuth");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const sendImageToCloudinery_1 = require("../../utils/lib/sendImageToCloudinery");
exports.MemberRoutes = (0, express_1.Router)();
// Public
exports.MemberRoutes.post('/register', member_controller_1.registerController);
exports.MemberRoutes.post('/login', member_controller_1.loginController);
exports.MemberRoutes.get('/verify/:slug', member_controller_1.verifyBySlugController);
exports.MemberRoutes.get('/lookup/:serial', member_controller_1.lookupBySerialController);
// Authenticated (member-only)
exports.MemberRoutes.get('/me', memberAuth_1.requireMemberAuth, member_controller_1.meController);
exports.MemberRoutes.patch('/me', memberAuth_1.requireMemberAuth, member_controller_1.updateMeController);
exports.MemberRoutes.put('/me/push-token', memberAuth_1.requireMemberAuth, member_controller_1.savePushTokenController);
exports.MemberRoutes.get('/me/scan-history', memberAuth_1.requireMemberAuth, member_controller_1.getScanHistoryController);
exports.MemberRoutes.post('/upload-profile-image', memberAuth_1.requireMemberAuth, sendImageToCloudinery_1.upload.single('image'), member_controller_1.uploadProfileImageController);
exports.MemberRoutes.patch('/me/status', memberAuth_1.requireMemberAuth, member_controller_1.setStatusController);
exports.MemberRoutes.delete('/me', memberAuth_1.requireMemberAuth, member_controller_1.deleteMeController);
// Returns member PII (name + phone), so it is locked to authenticated business
// users — same as /search. The only caller (OwnerMembersScreen) is a logged-in
// owner whose Bearer token is attached automatically by the RTK baseApi.
exports.MemberRoutes.get('/search-by-serial', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), member_controller_1.searchBySerialController);
// 🔹 paginated list + search. Returns member PII (name + phone), so it is
// locked to authenticated business users. All callers — AdminMembersScreen
// (RTK), WaiterTakeOrderScreen and MemberLeadsScreen (axios) — already send a
// 'Bearer <userToken>', which is exactly what auth() expects.
exports.MemberRoutes.get('/search', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), member_controller_1.pagedSearchMembersController);
// 🔹 set active by serial — admin only (destructive write). Called solely by the
// admin app via RTK Query (bare token), so the general auth() middleware applies.
exports.MemberRoutes.patch('/status-by-serial', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), member_controller_1.setStatusBySerialController);
exports.MemberRoutes.get("/restaurants", member_controller_1.getRestaurantOffersController);
// Member creates + views own deactivation requests
exports.MemberRoutes.post('/me/deactivation-requests', memberAuth_1.requireMemberAuth, member_controller_1.createDeactivationRequestController);
exports.MemberRoutes.get('/me/deactivation-requests', memberAuth_1.requireMemberAuth, member_controller_1.myDeactivationRequestsController);
// Admin/backoffice list + accept — admin-only (these expose member PII and
// approve account deactivations; previously the x-api-key was never enforced).
exports.MemberRoutes.get('/deactivation-requests', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), member_controller_1.listDeactivationRequestsController);
exports.MemberRoutes.patch('/deactivation-requests/:id/accept', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), member_controller_1.acceptDeactivationRequestController);
// Leads (member-only)
// Leads are an owner tool (the owner is an authenticated User). Require auth so
// these aren't world-open — previously anyone could read/modify any owner's
// leads and trigger promotional sends by passing an arbitrary ownerId.
const requireBizUser = (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF);
exports.MemberRoutes.post('/me/leads', requireBizUser, member_controller_1.addLeadController);
exports.MemberRoutes.get('/me/leads', requireBizUser, member_controller_1.listMyLeadsController);
exports.MemberRoutes.delete('/me/leads/:memberId', requireBizUser, member_controller_1.removeLeadController);
exports.MemberRoutes.post("/me/leads/send-promotion", requireBizUser, member_controller_1.sendPromotionToLeadsController);
exports.default = exports.MemberRoutes;
