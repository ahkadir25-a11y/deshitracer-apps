import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import requirePermission from '../../middlewares/requirePermission';
import { DineInControllers } from './dinein.controller';

const router = Router();

router.post(
  '/tables',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canAccessTables'),
  DineInControllers.createTable
);

router.get(
  '/tables/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  requirePermission('canAccessTables'),
  DineInControllers.getTablesByBusiness
);

router.put(
  '/tables/:tableId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canAccessTables'),
  DineInControllers.updateTable
);

router.delete(
  '/tables/:tableId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canAccessTables'),
  DineInControllers.deleteTable
);

router.get(
  '/floor/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.USER, USER_ROLE.STAFF),
  requirePermission('canAccessTables'),
  DineInControllers.getFloorStatus
);

export const DineInRoutes = router;
