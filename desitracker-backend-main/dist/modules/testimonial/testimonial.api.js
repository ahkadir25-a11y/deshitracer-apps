"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const testimonial_controller_1 = require("./testimonial.controller");
const router = (0, express_1.Router)();
// Create a new testimonial
router.post('/create', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN), testimonial_controller_1.TestimonialControllers.createTestimonial);
// Get all testimonials
router.get('/', testimonial_controller_1.TestimonialControllers.getAllTestimonials);
// Get a single testimonial by ID
router.get('/:testimonialId', testimonial_controller_1.TestimonialControllers.getSingleTestimonial);
// Update testimonial visibility
router.put('/:testimonialId/visibility', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), // Only admins can update testimonial visibility
testimonial_controller_1.TestimonialControllers.updateTestimonialVisibility);
router.put('/:testimonialId', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER), // Only admins can update testimonial visibility
testimonial_controller_1.TestimonialControllers.updateTestimonialByProvider);
exports.TestimonialRoutes = router;
