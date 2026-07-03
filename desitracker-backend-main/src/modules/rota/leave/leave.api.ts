import express from 'express';
import { RotaLeaveController } from './leave.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

// STAFF
router.post(
  '/',
  auth('staff', 'business_owner', 'admin'),
  RotaLeaveController.createForStaff,
);
router.get(
  '/me',
  auth('staff', 'business_owner', 'admin'),
  RotaLeaveController.listMine,
);
router.patch(
  '/me/:id/cancel',
  auth('staff', 'business_owner', 'admin'),
  RotaLeaveController.cancelMine,
);
router.get(
  '/me/balance',
  auth('staff', 'business_owner', 'admin'),
  RotaLeaveController.getMyBalance,
);

// OWNER
router.get(
  '/balances',
  auth('business_owner', 'admin'),
  RotaLeaveController.getOwnerBalances,
);
router.get(
  '/',
  auth('business_owner', 'admin'),
  RotaLeaveController.listForOwner,
);
router.patch(
  '/:id/decide',
  auth('business_owner', 'admin'),
  RotaLeaveController.decide,
);
router.delete(
  '/:id',
  auth('business_owner', 'admin'),
  RotaLeaveController.remove,
);

export const RotaLeaveRoutes = router;
