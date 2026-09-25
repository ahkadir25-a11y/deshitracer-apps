import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import requirePermission from '../../middlewares/requirePermission';
import { requireBusinessAccess } from '../../utils/lib/businessAccess';
import { DineInControllers } from './dinein.controller';

const router = Router();

// Customers (USER) used to be allowed on the two reads, and nothing checked the
// caller belonged to :businessId — so any logged-in account could pull any
// restaurant's unpaid orders, names and phone numbers included, off /floor.
// Every route that names a business now proves the caller works there.
// update/delete name only a table, so they check ownership in the controller.
const staff = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);

router.post(
  '/tables',
  staff,
  requirePermission('canAccessTables'),
  requireBusinessAccess,
  DineInControllers.createTable
);

router.get(
  '/tables/:businessId',
  staff,
  requirePermission('canAccessTables'),
  requireBusinessAccess,
  DineInControllers.getTablesByBusiness
);

router.put(
  '/tables/:tableId',
  staff,
  requirePermission('canAccessTables'),
  DineInControllers.updateTable
);

router.delete(
  '/tables/:tableId',
  staff,
  requirePermission('canAccessTables'),
  DineInControllers.deleteTable
);

router.get(
  '/floor/:businessId',
  staff,
  requirePermission('canAccessTables'),
  requireBusinessAccess,
  DineInControllers.getFloorStatus
);

export const DineInRoutes = router;
