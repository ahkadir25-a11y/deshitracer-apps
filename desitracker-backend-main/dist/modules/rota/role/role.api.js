"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRoleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const role_controller_1 = require("./role.controller");
const router = express_1.default.Router();
// ✅ If you want role-only auth:
// router.use(auth);
// router.use(memberAuth);
router.post('/', role_controller_1.RotaRoleController.create);
router.get('/', role_controller_1.RotaRoleController.getAll);
router.get('/:id', role_controller_1.RotaRoleController.getById);
router.patch('/:id', role_controller_1.RotaRoleController.update);
router.delete('/:id', role_controller_1.RotaRoleController.remove);
exports.RotaRoleRoutes = router;
