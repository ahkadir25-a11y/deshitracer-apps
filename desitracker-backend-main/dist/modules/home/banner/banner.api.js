"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const sendImageToCloudinery_1 = require("../../../utils/lib/sendImageToCloudinery");
const auth_constants_1 = require("../../user/auth/auth.constants");
const banner_controllers_1 = require("./banner.controllers");
const router = (0, express_1.Router)();
// Create a new banner
router.post('/create', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), sendImageToCloudinery_1.upload.single('file'), banner_controllers_1.BannerControllers.createBanner);
// Get all banners
router.get('/all', banner_controllers_1.BannerControllers.getAllBanners);
// Delete a banner
router.delete('/delete/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), banner_controllers_1.BannerControllers.deleteBanner);
// Get a single banner by ID
router.get('/:id', banner_controllers_1.BannerControllers.getSingleBanner);
exports.BannerRoutes = router;
