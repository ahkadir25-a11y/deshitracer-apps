import express from 'express';
import { TableControllers } from './table.controller';
import auth from '../../middlewares/auth'; // Ensure this matches your auth middleware

const router = express.Router();

router.post(
  '/create',
  auth('business_owner', 'staff', 'admin'),
  TableControllers.createTable
);

router.get(
  '/business/:businessId',
  auth('business_owner', 'staff', 'admin'),
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
