"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRoleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../user/auth/auth.constants");
const rota_guards_1 = require("../rota.guards");
const role_controller_1 = require("./role.controller");
const router = express_1.default.Router();
// All role management requires an authenticated business owner (or admin)
// who owns the business referenced in the request.
router.use((0, auth_1.default)(auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.ADMIN));
router.use(rota_guards_1.requireBusinessOwnership);
router.post('/', role_controller_1.RotaRoleController.create);
router.get('/', role_controller_1.RotaRoleController.getAll);
router.get('/:id', role_controller_1.RotaRoleController.getById);
router.patch('/:id', role_controller_1.RotaRoleController.update);
router.delete('/:id', role_controller_1.RotaRoleController.remove);
exports.RotaRoleRoutes = router;
