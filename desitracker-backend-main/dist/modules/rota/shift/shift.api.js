"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaShiftRoutes = void 0;
const express_1 = __importDefault(require("express"));
const shift_controller_1 = require("./shift.controller");
const router = express_1.default.Router();
// ✅ If you want shift-only auth:
// router.use(auth);
// router.use(memberAuth);
router.post('/', shift_controller_1.RotaShiftController.create);
router.get('/', shift_controller_1.RotaShiftController.getAll);
router.get('/:id', shift_controller_1.RotaShiftController.getById);
router.patch('/:id', shift_controller_1.RotaShiftController.update);
router.delete('/:id', shift_controller_1.RotaShiftController.remove);
exports.RotaShiftRoutes = router;
