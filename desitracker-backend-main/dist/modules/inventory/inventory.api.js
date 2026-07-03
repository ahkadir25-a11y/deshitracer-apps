"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const inventory_controller_1 = require("./inventory.controller");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.createIngredient);
router.get('/business/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.getIngredientsByBusiness);
router.post('/adjust', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.adjustStock);
router.get('/history/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.getStockHistory);
router.patch('/:ingredientId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.updateIngredient);
router.delete('/:ingredientId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), inventory_controller_1.InventoryControllers.deleteIngredient);
exports.InventoryRoutes = router;
