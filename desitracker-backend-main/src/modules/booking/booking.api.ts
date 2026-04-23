import { Router, Request, Response, NextFunction } from 'express'; // Import Router and types from express
import { createBooking, getBookingsByBusiness } from './booking.controller'; // Import controller functions

const router = Router();  // Initialize the router

// Helper to wrap async route handlers and pass errors to Express
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Create a new booking
router.post('/create', asyncHandler(createBooking));

// Get bookings by business ID
router.get('/business/:businessId', asyncHandler(getBookingsByBusiness));

// Export the router so that it can be used in other parts of the app
export default router;
