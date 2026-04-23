import express from 'express';
import { RotaEmployeeController } from './employee.controller';

const router = express.Router();

// ✅ If you want employee-only auth:
// router.use(auth);
// router.use(memberAuth);

router.post('/', RotaEmployeeController.create);
router.get('/', RotaEmployeeController.getAll);
router.get('/:id', RotaEmployeeController.getById);
router.patch('/:id', RotaEmployeeController.update);
router.delete('/:id', RotaEmployeeController.remove);

export const RotaEmployeeRoutes = router;
