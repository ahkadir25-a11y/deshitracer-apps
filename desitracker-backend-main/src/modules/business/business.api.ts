import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { BusinessControllers } from './business.controller';
import requirePermission from '../../middlewares/requirePermission';
import rateLimit from 'express-rate-limit';
import { requireBusinessAccess } from '../../utils/lib/businessAccess';

// A 4-digit PIN is only 10,000 guesses. Wrong tries are counted per person
// per business (correct ones are not), so a waiter who mistypes is fine but a
// script walking 0000-9999 is stopped after a handful.
const pinGuessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${(req as any).user?.id || 'anon'}:${String(req.body?.businessId || '')}`,
  message: { success: false, message: 'Too many wrong PIN attempts. Please wait 15 minutes and try again.' },
});

const router = Router();

// Create a category (Admin only)
router.post(
  '/register',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER, USER_ROLE.BUSINESS_OWNER),
  BusinessControllers.registerBusiness,
);

// Get all business (Public)
router.get('/', BusinessControllers.getAllBusiness);

// Get all business (Public)
router.get('/list', BusinessControllers.getAllBusinessListings);

// Get a single business by slug (Public)
router.get('/:slug', BusinessControllers.getSingleBusiness);

// Update a business by slug (Admin only, and Owner)
// Staff may edit the business profile only when their role says so. The route
// used to refuse them by role alone, so 'Edit Business Info' was a switch the
// owner could turn on that could never do anything.
router.put(
  '/:slug',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditBusinessInfo'),
  BusinessControllers.updateBusiness,
);

// Delete a business by slug (Admin and owner)
router.delete(
  '/:slug',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER),
  BusinessControllers.deleteBusiness,
);

// Manager PIN — set (owner / admin only)
// The service also checks the caller OWNS this business — being staff there
// (which requireBusinessAccess accepts) is not enough to change the key.
router.post(
  '/manager-pin/set',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER),
  requireBusinessAccess,
  BusinessControllers.setManagerPin,
);

// Manager PIN — verify. Only people who work at this business may try it
// (customers used to be allowed), and wrong guesses are rate limited.
router.post(
  '/manager-pin/verify',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requireBusinessAccess,
  pinGuessLimiter,
  BusinessControllers.verifyManagerPin,
);

export const BusinessRoutes = router;
