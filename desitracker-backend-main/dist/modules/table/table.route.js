"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableRoutes = void 0;
const express_1 = __importDefault(require("express"));
const table_controller_1 = require("./table.controller");
const auth_1 = __importDefault(require("../../middlewares/auth")); // Ensure this matches your auth middleware
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)('business_owner', 'staff', 'admin'), table_controller_1.TableControllers.createTable);
router.get('/business/:businessId', (0, auth_1.default)('business_owner', 'staff', 'admin'), table_controller_1.TableControllers.getBusinessTables);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), table_controller_1.TableControllers.deleteTable);
exports.TableRoutes = router;
