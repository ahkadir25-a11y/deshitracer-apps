import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/auth/auth.constants';
import { requireBusinessOwnership } from '../rota.guards';
import { RotaRoleController } from './role.controller';

const router = express.Router();

// All role management requires an authenticated business owner (or admin)
// who owns the business referenced in the request.
router.use(auth(USER_ROLE.BUSINESS_OWNER, USER_ROLE.ADMIN));
router.use(requireBusinessOwnership);

router.post('/', RotaRoleController.create);
router.get('/', RotaRoleController.getAll);
router.get('/:id', RotaRoleController.getById);
router.patch('/:id', RotaRoleController.update);
router.delete('/:id', RotaRoleController.remove);

export const RotaRoleRoutes = router;
