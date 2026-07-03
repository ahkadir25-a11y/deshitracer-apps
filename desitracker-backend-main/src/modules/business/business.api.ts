import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { BusinessControllers } from './business.controller';

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
router.put(
  '/:slug',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER),
  BusinessControllers.updateBusiness,
);

// Delete a business by slug (Admin and owner)
router.delete(
  '/:slug',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER),
  BusinessControllers.deleteBusiness,
);

// Manager PIN — set (owner / admin only)
router.post(
  '/manager-pin/set',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER),
  BusinessControllers.setManagerPin,
);

// Manager PIN — verify (any authenticated staff can attempt)
router.post(
  '/manager-pin/verify',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  BusinessControllers.verifyManagerPin,
);

export const BusinessRoutes = router;
