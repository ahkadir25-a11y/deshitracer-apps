"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaLeaveRoutes = void 0;
const express_1 = __importDefault(require("express"));
const leave_controller_1 = require("./leave.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
// STAFF
router.post('/', (0, auth_1.default)('staff', 'business_owner', 'admin'), leave_controller_1.RotaLeaveController.createForStaff);
router.get('/me', (0, auth_1.default)('staff', 'business_owner', 'admin'), leave_controller_1.RotaLeaveController.listMine);
router.patch('/me/:id/cancel', (0, auth_1.default)('staff', 'business_owner', 'admin'), leave_controller_1.RotaLeaveController.cancelMine);
router.get('/me/balance', (0, auth_1.default)('staff', 'business_owner', 'admin'), leave_controller_1.RotaLeaveController.getMyBalance);
// OWNER
router.get('/balances', (0, auth_1.default)('business_owner', 'admin'), leave_controller_1.RotaLeaveController.getOwnerBalances);
router.get('/', (0, auth_1.default)('business_owner', 'admin'), leave_controller_1.RotaLeaveController.listForOwner);
router.patch('/:id/decide', (0, auth_1.default)('business_owner', 'admin'), leave_controller_1.RotaLeaveController.decide);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), leave_controller_1.RotaLeaveController.remove);
exports.RotaLeaveRoutes = router;
