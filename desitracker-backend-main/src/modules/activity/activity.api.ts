import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { ActivityControllers } from './activity.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  ActivityControllers.logActivity
);

router.get(
  '/feed/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  ActivityControllers.getActivityByBusiness
);

router.get(
  '/dashboard/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  ActivityControllers.getOwnerDashboardStats
);

export const ActivityRoutes = router;
