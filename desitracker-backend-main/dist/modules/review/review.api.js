"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
// Create a new review
router.post('/create', review_controller_1.ReviewControllers.createReview);
// Get all reviews of a business
router.get('/all/:businessId', review_controller_1.ReviewControllers.getAllBusinessReviews);
// Get all reviews
router.get('/', review_controller_1.ReviewControllers.getAllReviews);
// Get a single review by ID
router.get('/:reviewId', review_controller_1.ReviewControllers.getSingleReview);
// Update review visibility
router.put('/:reviewId/visibility', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), // Only admins can update review visibility
review_controller_1.ReviewControllers.updateReviewVisibility);
router.put('/:reviewId', review_controller_1.ReviewControllers.updateReviewByReviewer);
exports.ReviewRoutes = router;
