"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaTimesheetRoutes = void 0;
const express_1 = __importDefault(require("express"));
const timesheet_controller_1 = require("./timesheet.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
// ── STAFF endpoints ─────────────────────────────────────────────────────────
router.post('/clock-in', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.clockIn);
router.post('/clock-out', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.clockOut);
router.post('/break/start', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.startBreak);
router.post('/break/end', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.endBreak);
router.post('/overtime/start', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.startOvertime);
router.post('/overtime/stop', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.stopOvertime);
router.post('/:id/undertime/submit', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.submitUndertimeReason);
router.get('/me/current', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getMyCurrent);
router.get('/me/pay-summary', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getMyPaySummary);
router.get('/me/pending-counts', (0, auth_1.default)('staff', 'business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getMyPendingCounts);
// ── OWNER endpoints ─────────────────────────────────────────────────────────
// Literal paths first so they aren't shadowed by dynamic ':id'.
router.get('/pending-approvals', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getPendingApprovals);
router.get('/stuck', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getStuckTimesheets);
router.get('/summary', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getSummary);
router.patch('/:id/overtime/decide', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.decideOvertime);
router.patch('/:id/undertime/decide', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.decideUndertime);
router.get('/', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.getAll);
router.post('/', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.ownerCreate);
router.patch('/:id', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.update);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), timesheet_controller_1.RotaTimesheetController.remove);
exports.RotaTimesheetRoutes = router;
