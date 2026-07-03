"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import Router and types from express
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const businessAccess_1 = require("../../utils/lib/businessAccess");
const booking_controller_1 = require("./booking.controller"); // Import controller functions
const router = (0, express_1.Router)(); // Initialize the router
// Helper to wrap async route handlers and pass errors to Express
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Staff = owner / staff / admin of the business.
const staff = (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF);
// Customers reserve a table as guests (no login) — keep create public, but
// throttle it so it can't be scripted into spam reservations.
const createLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please wait a moment and try again.' },
});
// Create a new booking (public — guest customer)
router.post('/create', createLimiter, asyncHandler(booking_controller_1.createBooking));
// Get bookings by business ID — exposes customer PII, so it's locked to the
// owner/staff of THAT business (or admin).
router.get('/business/:businessId', staff, businessAccess_1.requireBusinessAccess, asyncHandler(booking_controller_1.getBookingsByBusiness));
// Update / delete a booking — staff/owner only. The controller loads the
// booking and verifies the caller belongs to the booking's business.
router.put('/:id', staff, asyncHandler(booking_controller_1.updateBooking));
router.delete('/:id', staff, asyncHandler(booking_controller_1.deleteBooking));
// Export the router so that it can be used in other parts of the app
exports.default = router;
