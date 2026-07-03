import { Router } from 'express';
import cleaningController from './cleaning.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = Router();

// Internal staff compliance tool — all routes require an authenticated business
// user. (Was fully open before.)
router.use(auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF));

// Cleaning task + completion-log routes (mirrors the Fridge module)
router.post('/create', cleaningController.createTask);
router.post('/add-log', cleaningController.addLog);
router.put('/edit-log', cleaningController.editLog);
router.get('/:userId', cleaningController.getTasks);
router.get('/logs/:taskId', cleaningController.getLogs);

export const CleaningRoutes = router;
