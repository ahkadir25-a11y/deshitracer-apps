"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DineInRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const dinein_controller_1 = require("./dinein.controller");
const router = (0, express_1.Router)();
router.post('/tables', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), dinein_controller_1.DineInControllers.createTable);
router.get('/tables/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.STAFF), dinein_controller_1.DineInControllers.getTablesByBusiness);
router.put('/tables/:tableId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), dinein_controller_1.DineInControllers.updateTable);
router.delete('/tables/:tableId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF), dinein_controller_1.DineInControllers.deleteTable);
router.get('/floor/:businessId', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.STAFF), dinein_controller_1.DineInControllers.getFloorStatus);
exports.DineInRoutes = router;
