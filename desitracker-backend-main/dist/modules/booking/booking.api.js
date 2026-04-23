"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Import Router and types from express
const booking_controller_1 = require("./booking.controller"); // Import controller functions
const router = (0, express_1.Router)(); // Initialize the router
// Helper to wrap async route handlers and pass errors to Express
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Create a new booking
router.post('/create', asyncHandler(booking_controller_1.createBooking));
// Get bookings by business ID
router.get('/business/:businessId', asyncHandler(booking_controller_1.getBookingsByBusiness));
// Export the router so that it can be used in other parts of the app
exports.default = router;
