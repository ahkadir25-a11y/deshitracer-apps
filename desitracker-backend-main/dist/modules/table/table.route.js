"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableRoutes = void 0;
const express_1 = __importDefault(require("express"));
const table_controller_1 = require("./table.controller");
const auth_1 = __importDefault(require("../../middlewares/auth")); // Ensure this matches your auth middleware
const businessAccess_1 = require("../../utils/lib/businessAccess");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)('business_owner', 'staff', 'admin'), table_controller_1.TableControllers.createTable);
// auth() only proves the caller holds a staff/owner role SOMEWHERE. It says
// nothing about which business, and this route takes the id straight from the
// URL and returns the tables with activeOrderId populated — the whole live
// order, customer name, items and totals included. Without a membership check
// any signed-in staff member could read another restaurant's open tables by
// changing the id. requireBusinessAccess resolves owner-or-employee of THIS
// business; it reads params.businessId, which is what this route is named.
router.get('/business/:businessId', (0, auth_1.default)('business_owner', 'staff', 'admin'), businessAccess_1.requireBusinessAccess, table_controller_1.TableControllers.getBusinessTables);
router.patch('/:id', (0, auth_1.default)('business_owner', 'admin'), table_controller_1.TableControllers.updateTable);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), table_controller_1.TableControllers.deleteTable);
exports.TableRoutes = router;
