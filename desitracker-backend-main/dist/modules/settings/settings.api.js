"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
// settings/settings.api.ts
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller"); // Import the SettingsController
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const router = (0, express_1.Router)();
// GET stays public (the app reads global settings on launch). Writes to the
// global singleton are admin-only — previously anyone could overwrite app config.
router.post('/', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), settings_controller_1.SettingsController.createSettings);
router.get('/', settings_controller_1.SettingsController.getSettings);
router.put('/', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), settings_controller_1.SettingsController.updateSettings);
exports.SettingsRoutes = router;
