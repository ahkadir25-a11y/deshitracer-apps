// settings/settings.api.ts
import { Router } from 'express';
import { SettingsController } from './settings.controller';  // Import the SettingsController
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = Router();

// GET stays public (the app reads global settings on launch). Writes to the
// global singleton are admin-only — previously anyone could overwrite app config.
router.post('/', auth(USER_ROLE.ADMIN), SettingsController.createSettings);
router.get('/', SettingsController.getSettings);
router.put('/', auth(USER_ROLE.ADMIN), SettingsController.updateSettings);

export const SettingsRoutes = router;
