"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEmployeeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("./employee.controller");
const router = express_1.default.Router();
// ✅ If you want employee-only auth:
// router.use(auth);
// router.use(memberAuth);
router.post('/', employee_controller_1.RotaEmployeeController.create);
router.get('/', employee_controller_1.RotaEmployeeController.getAll);
router.get('/:id', employee_controller_1.RotaEmployeeController.getById);
router.patch('/:id', employee_controller_1.RotaEmployeeController.update);
router.delete('/:id', employee_controller_1.RotaEmployeeController.remove);
exports.RotaEmployeeRoutes = router;
