import { Router } from 'express';
import fridgeController from './fridge.controller';

const router = Router();

// Define the routes for the fridge operations
router.post('/create', fridgeController.createFridge);
router.post('/add-record', fridgeController.addTemperatureRecord);
router.put('/edit-record', fridgeController.editTemperatureRecord); // For editing temperature records
router.get('/:userId', fridgeController.getFridges);
router.get('/records/:fridgeId', fridgeController.getTemperatureRecords); // Fetch temperature records for a fridge

export const FridgeRoutes = router;
