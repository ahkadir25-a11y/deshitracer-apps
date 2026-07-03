import express from 'express';
import { RotaShiftController } from './shift.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/auth/auth.constants';

const router = express.Router();

// All shift routes require an authenticated business user (staff log in as Users
// with role 'staff'). Auth was previously disabled, leaving shifts world-writable.
router.use(auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF));

router.post('/', RotaShiftController.create);
router.get('/', RotaShiftController.getAll);
router.get('/:id', RotaShiftController.getById);
router.patch('/:id', RotaShiftController.update);
router.delete('/:id', RotaShiftController.remove);

// Absence cover endpoints. Register before any wildcard would shadow them.
router.get('/:id/cover-options', RotaShiftController.availableForCover);
router.post('/:id/request-cover', RotaShiftController.requestCover);
router.post('/:id/assign-cover', RotaShiftController.assignCover);

export const RotaShiftRoutes = router;
