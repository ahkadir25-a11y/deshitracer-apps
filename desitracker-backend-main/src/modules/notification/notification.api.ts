import express from 'express';
import { NotificationControllers } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = express.Router();

router.get(
  '/business/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  NotificationControllers.getNotifications
);

router.patch(
  '/business/:businessId/read-all',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  NotificationControllers.markAllAsRead
);

router.patch(
  '/:id/read',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  NotificationControllers.markAsRead
);

export const NotificationRoutes = router;
