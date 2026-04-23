"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberRoutes = void 0;
const express_1 = require("express");
const member_controller_1 = require("./member.controller");
const memberAuth_1 = require("../../middlewares/memberAuth");
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
exports.MemberRoutes.post('/upload-profile-image', memberAuth_1.requireMemberAuth, sendImageToCloudinery_1.upload.single('image'), member_controller_1.uploadProfileImageController);
exports.MemberRoutes.patch('/me/status', memberAuth_1.requireMemberAuth, member_controller_1.setStatusController);
exports.MemberRoutes.delete('/me', memberAuth_1.requireMemberAuth, member_controller_1.deleteMeController);
exports.MemberRoutes.get('/search-by-serial', member_controller_1.searchBySerialController);
// 🔹 NEW: paginated list + search (admin/backoffice; uses x-api-key if set)
exports.MemberRoutes.get('/search', member_controller_1.pagedSearchMembersController);
// 🔹 NEW: set active by serial (admin/backoffice; uses x-api-key if set)
exports.MemberRoutes.patch('/status-by-serial', member_controller_1.setStatusBySerialController);
exports.MemberRoutes.get("/restaurants", member_controller_1.getRestaurantOffersController);
exports.default = exports.MemberRoutes;
