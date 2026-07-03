import express from 'express';
import { RotaEmployeeController } from './employee.controller';
import auth from '../../../middlewares/auth';
import { requireBusinessAccess } from '../../../utils/lib/businessAccess';

const router = express.Router();

// Public — staff who don't yet have an account use this to set their password.
// Must be registered BEFORE '/:id' patterns so it isn't swallowed by them.
router.post('/accept-invite', RotaEmployeeController.acceptInvite);

// Signed-in users (any role) can ask what permissions they have.
router.get('/me/permissions', auth('business_owner', 'admin', 'staff', 'user'), RotaEmployeeController.getMyPermissions);

// Staff saves their Expo push token after granting notification permission.
router.put('/me/push-token', auth('staff', 'business_owner', 'admin', 'user'), RotaEmployeeController.savePushToken);

// Employee management — restricted to business owners and admins.
router.post('/', auth('business_owner', 'admin'), RotaEmployeeController.create);
// Staff may LIST colleagues (needed to render the rota with names), but they
// get a trimmed projection (no email/phone/pay) — see controller.getAll.
// requireBusinessAccess pins every caller (incl. owners) to their own business.
router.get('/', auth('business_owner', 'admin', 'staff'), requireBusinessAccess, RotaEmployeeController.getAll);
router.get('/:id', auth('business_owner', 'admin'), RotaEmployeeController.getById);
router.patch('/:id', auth('business_owner', 'admin'), RotaEmployeeController.update);
router.delete('/:id', auth('business_owner', 'admin'), RotaEmployeeController.remove);
router.post('/:id/resend-invite', auth('business_owner', 'admin'), RotaEmployeeController.resendInvite);

export const RotaEmployeeRoutes = router;
