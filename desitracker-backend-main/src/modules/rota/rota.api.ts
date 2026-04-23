import express from 'express';
import { RotaRoleRoutes } from './role/role.api';
import { RotaEmployeeRoutes } from './employee/employee.api';
import { RotaShiftRoutes } from './shift/shift.api';

const router = express.Router();



router.use('/roles', RotaRoleRoutes);
router.use('/employees', RotaEmployeeRoutes);
router.use('/shifts', RotaShiftRoutes);

export const RotaRoutes = router;
