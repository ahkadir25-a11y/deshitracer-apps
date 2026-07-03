import express from 'express';
import { RotaTimesheetController } from './timesheet.controller';
import auth from '../../../middlewares/auth';

const router = express.Router();

// ── STAFF endpoints ─────────────────────────────────────────────────────────
router.post(
  '/clock-in',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.clockIn,
);

router.post(
  '/clock-out',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.clockOut,
);

router.post(
  '/break/start',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.startBreak,
);

router.post(
  '/break/end',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.endBreak,
);

router.post(
  '/overtime/start',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.startOvertime,
);

router.post(
  '/overtime/stop',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.stopOvertime,
);

router.post(
  '/:id/undertime/submit',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.submitUndertimeReason,
);

router.get(
  '/me/current',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.getMyCurrent,
);

router.get(
  '/me/pay-summary',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.getMyPaySummary,
);

router.get(
  '/me/pending-counts',
  auth('staff', 'business_owner', 'admin'),
  RotaTimesheetController.getMyPendingCounts,
);

// ── OWNER endpoints ─────────────────────────────────────────────────────────
// Literal paths first so they aren't shadowed by dynamic ':id'.
router.get(
  '/pending-approvals',
  auth('business_owner', 'admin'),
  RotaTimesheetController.getPendingApprovals,
);

router.get(
  '/stuck',
  auth('business_owner', 'admin'),
  RotaTimesheetController.getStuckTimesheets,
);

router.get(
  '/summary',
  auth('business_owner', 'admin'),
  RotaTimesheetController.getSummary,
);

router.patch(
  '/:id/overtime/decide',
  auth('business_owner', 'admin'),
  RotaTimesheetController.decideOvertime,
);

router.patch(
  '/:id/undertime/decide',
  auth('business_owner', 'admin'),
  RotaTimesheetController.decideUndertime,
);

router.get(
  '/',
  auth('business_owner', 'admin'),
  RotaTimesheetController.getAll,
);

router.post(
  '/',
  auth('business_owner', 'admin'),
  RotaTimesheetController.ownerCreate,
);

router.patch(
  '/:id',
  auth('business_owner', 'admin'),
  RotaTimesheetController.update,
);

router.delete(
  '/:id',
  auth('business_owner', 'admin'),
  RotaTimesheetController.remove,
);

export const RotaTimesheetRoutes = router;
