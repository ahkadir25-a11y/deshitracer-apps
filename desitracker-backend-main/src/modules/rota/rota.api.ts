import express from 'express';
import { RotaRoleRoutes } from './role/role.api';
import { RotaEmployeeRoutes } from './employee/employee.api';
import { RotaShiftRoutes } from './shift/shift.api';
import { RotaTimesheetRoutes } from './timesheet/timesheet.api';
import { RotaLeaveRoutes } from './leave/leave.api';
import { AnnouncementRoutes } from './announcement/announcement.api';

const router = express.Router();



router.use('/roles', RotaRoleRoutes);
router.use('/employees', RotaEmployeeRoutes);
router.use('/shifts', RotaShiftRoutes);
router.use('/timesheets', RotaTimesheetRoutes);
router.use('/leaves', RotaLeaveRoutes);
router.use('/announcements', AnnouncementRoutes);

export const RotaRoutes = router;
