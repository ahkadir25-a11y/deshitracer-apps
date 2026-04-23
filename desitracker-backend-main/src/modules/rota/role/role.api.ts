import express from 'express';
import { RotaRoleController } from './role.controller';

const router = express.Router();

// ✅ If you want role-only auth:
// router.use(auth);
// router.use(memberAuth);

router.post('/', RotaRoleController.create);
router.get('/', RotaRoleController.getAll);
router.get('/:id', RotaRoleController.getById);
router.patch('/:id', RotaRoleController.update);
router.delete('/:id', RotaRoleController.remove);

export const RotaRoleRoutes = router;
