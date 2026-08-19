"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEmployeeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("./employee.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const businessAccess_1 = require("../../../utils/lib/businessAccess");
const router = express_1.default.Router();
// Public — staff who don't yet have an account use this to set their password.
// Must be registered BEFORE '/:id' patterns so it isn't swallowed by them.
router.post('/accept-invite', employee_controller_1.RotaEmployeeController.acceptInvite);
// Signed-in users (any role) can ask what permissions they have.
router.get('/me/permissions', (0, auth_1.default)('business_owner', 'admin', 'staff', 'user'), employee_controller_1.RotaEmployeeController.getMyPermissions);
// Staff saves their Expo push token after granting notification permission.
router.put('/me/push-token', (0, auth_1.default)('staff', 'business_owner', 'admin', 'user'), employee_controller_1.RotaEmployeeController.savePushToken);
router.patch('/me/photos', (0, auth_1.default)('staff', 'business_owner', 'admin', 'user'), employee_controller_1.RotaEmployeeController.updateMyPhotos);
// Employee management — restricted to business owners and admins.
router.post('/', (0, auth_1.default)('business_owner', 'admin'), employee_controller_1.RotaEmployeeController.create);
// Staff may LIST colleagues (needed to render the rota with names), but they
// get a trimmed projection (no email/phone/pay) — see controller.getAll.
// requireBusinessAccess pins every caller (incl. owners) to their own business.
router.get('/', (0, auth_1.default)('business_owner', 'admin', 'staff'), businessAccess_1.requireBusinessAccess, employee_controller_1.RotaEmployeeController.getAll);
router.get('/:id', (0, auth_1.default)('business_owner', 'admin'), employee_controller_1.RotaEmployeeController.getById);
router.patch('/:id', (0, auth_1.default)('business_owner', 'admin'), employee_controller_1.RotaEmployeeController.update);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), employee_controller_1.RotaEmployeeController.remove);
router.post('/:id/resend-invite', (0, auth_1.default)('business_owner', 'admin'), employee_controller_1.RotaEmployeeController.resendInvite);
exports.RotaEmployeeRoutes = router;
