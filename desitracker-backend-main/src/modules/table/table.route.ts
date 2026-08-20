import express from 'express';
import { TableControllers } from './table.controller';
import auth from '../../middlewares/auth'; // Ensure this matches your auth middleware
import { requireBusinessAccess } from '../../utils/lib/businessAccess';

const router = express.Router();

router.post(
  '/create',
  auth('business_owner', 'staff', 'admin'),
  TableControllers.createTable
);

// auth() only proves the caller holds a staff/owner role SOMEWHERE. It says
// nothing about which business, and this route takes the id straight from the
// URL and returns the tables with activeOrderId populated — the whole live
// order, customer name, items and totals included. Without a membership check
// any signed-in staff member could read another restaurant's open tables by
// changing the id. requireBusinessAccess resolves owner-or-employee of THIS
// business; it reads params.businessId, which is what this route is named.
router.get(
  '/business/:businessId',
  auth('business_owner', 'staff', 'admin'),
  requireBusinessAccess,
  TableControllers.getBusinessTables
);

router.patch(
  '/:id',
  auth('business_owner', 'admin'),
  TableControllers.updateTable
);

router.delete(
  '/:id',
  auth('business_owner', 'admin'),
  TableControllers.deleteTable
);

export const TableRoutes = router;
