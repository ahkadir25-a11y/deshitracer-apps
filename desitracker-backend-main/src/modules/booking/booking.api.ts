import { Router, Request, Response, NextFunction } from 'express'; // Import Router and types from express
import rateLimit from 'express-rate-limit';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { requireBusinessAccess } from '../../utils/lib/businessAccess';
import { createBooking, getBookingsByBusiness, updateBooking, deleteBooking } from './booking.controller'; // Import controller functions

const router = Router();  // Initialize the router

// Helper to wrap async route handlers and pass errors to Express
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Staff = owner / staff / admin of the business.
const staff = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);

// Customers reserve a table as guests (no login) — keep create public, but
// throttle it so it can't be scripted into spam reservations.
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a moment and try again.' },
});

// Create a new booking (public — guest customer)
router.post('/create', createLimiter, asyncHandler(createBooking));

// Get bookings by business ID — exposes customer PII, so it's locked to the
// owner/staff of THAT business (or admin).
router.get('/business/:businessId', staff, requireBusinessAccess, asyncHandler(getBookingsByBusiness));

// Update / delete a booking — staff/owner only. The controller loads the
// booking and verifies the caller belongs to the booking's business.
router.put('/:id', staff, asyncHandler(updateBooking));
router.delete('/:id', staff, asyncHandler(deleteBooking));

// Export the router so that it can be used in other parts of the app
export default router;
