import { Router } from 'express';
import fridgeController from './fridge.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import requirePermission from '../../middlewares/requirePermission';

const router = Router();

// Fridge temperature logs are an internal food-safety (HACCP) tool — every
// route requires an authenticated business user. (Was fully open before.)
router.use(auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF));

// Define the routes for the fridge operations
router.post('/create', requirePermission('canEditFridge'), fridgeController.createFridge);
router.post('/add-record', requirePermission('canEditFridge'), fridgeController.addTemperatureRecord);
router.put('/edit-record', requirePermission('canEditFridge'), fridgeController.editTemperatureRecord); // For editing temperature records
router.get('/:userId', requirePermission('canViewFridge'), fridgeController.getFridges);
router.get('/records/:fridgeId', requirePermission('canViewFridge'), fridgeController.getTemperatureRecords); // Fetch temperature records for a fridge

export const FridgeRoutes = router;
