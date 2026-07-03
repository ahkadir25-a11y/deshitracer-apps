import { Router } from 'express';
import fridgeController from './fridge.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = Router();

// Fridge temperature logs are an internal food-safety (HACCP) tool — every
// route requires an authenticated business user. (Was fully open before.)
router.use(auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF));

// Define the routes for the fridge operations
router.post('/create', fridgeController.createFridge);
router.post('/add-record', fridgeController.addTemperatureRecord);
router.put('/edit-record', fridgeController.editTemperatureRecord); // For editing temperature records
router.get('/:userId', fridgeController.getFridges);
router.get('/records/:fridgeId', fridgeController.getTemperatureRecords); // Fetch temperature records for a fridge

export const FridgeRoutes = router;
