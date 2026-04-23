// settings/settings.api.ts
import { Router } from 'express';
import { SettingsController } from './settings.controller';  // Import the SettingsController

const router = Router();

// Define the routes and map them to controller methods
router.post('/', SettingsController.createSettings);
router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export const SettingsRoutes = router;
