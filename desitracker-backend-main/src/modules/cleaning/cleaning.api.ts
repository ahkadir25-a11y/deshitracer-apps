import { Router } from 'express';
import cleaningController from './cleaning.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import requirePermission from '../../middlewares/requirePermission';

const router = Router();

// Internal staff compliance tool — all routes require an authenticated business
// user. (Was fully open before.)
router.use(auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF));

// Cleaning task + completion-log routes (mirrors the Fridge module)
router.post('/create', requirePermission('canManageCleaning'), cleaningController.createTask);
router.post('/add-log', requirePermission('canManageCleaning'), cleaningController.addLog);
router.put('/edit-log', requirePermission('canManageCleaning'), cleaningController.editLog);
router.get('/:userId', requirePermission('canManageCleaning'), cleaningController.getTasks);
router.get('/logs/:taskId', requirePermission('canManageCleaning'), cleaningController.getLogs);

export const CleaningRoutes = router;
