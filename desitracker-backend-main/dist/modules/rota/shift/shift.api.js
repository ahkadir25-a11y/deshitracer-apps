"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaShiftRoutes = void 0;
const express_1 = __importDefault(require("express"));
const shift_controller_1 = require("./shift.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../user/auth/auth.constants");
const router = express_1.default.Router();
// All shift routes require an authenticated business user (staff log in as Users
// with role 'staff'). Auth was previously disabled, leaving shifts world-writable.
router.use((0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF));
router.post('/', shift_controller_1.RotaShiftController.create);
router.get('/', shift_controller_1.RotaShiftController.getAll);
router.get('/:id', shift_controller_1.RotaShiftController.getById);
router.patch('/:id', shift_controller_1.RotaShiftController.update);
router.delete('/:id', shift_controller_1.RotaShiftController.remove);
// Absence cover endpoints. Register before any wildcard would shadow them.
router.get('/:id/cover-options', shift_controller_1.RotaShiftController.availableForCover);
router.post('/:id/request-cover', shift_controller_1.RotaShiftController.requestCover);
router.post('/:id/assign-cover', shift_controller_1.RotaShiftController.assignCover);
exports.RotaShiftRoutes = router;
