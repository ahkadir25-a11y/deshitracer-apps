import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { DineInControllers } from './dinein.controller';

const router = Router();

router.post(
  '/tables',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  DineInControllers.createTable
);

router.get(
  '/tables/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  DineInControllers.getTablesByBusiness
);

router.put(
  '/tables/:tableId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  DineInControllers.updateTable
);

router.delete(
  '/tables/:tableId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  DineInControllers.deleteTable
);

router.get(
  '/floor/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  DineInControllers.getFloorStatus
);

export const DineInRoutes = router;
