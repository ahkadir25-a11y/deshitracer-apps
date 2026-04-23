import express from 'express';
import { RotaShiftController } from './shift.controller';

const router = express.Router();

// ✅ If you want shift-only auth:
// router.use(auth);
// router.use(memberAuth);

router.post('/', RotaShiftController.create);
router.get('/', RotaShiftController.getAll);
router.get('/:id', RotaShiftController.getById);
router.patch('/:id', RotaShiftController.update);
router.delete('/:id', RotaShiftController.remove);

export const RotaShiftRoutes = router;
