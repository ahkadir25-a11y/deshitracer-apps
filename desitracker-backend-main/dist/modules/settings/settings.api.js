"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoutes = void 0;
// settings/settings.api.ts
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller"); // Import the SettingsController
const router = (0, express_1.Router)();
// Define the routes and map them to controller methods
router.post('/', settings_controller_1.SettingsController.createSettings);
router.get('/', settings_controller_1.SettingsController.getSettings);
router.put('/', settings_controller_1.SettingsController.updateSettings);
exports.SettingsRoutes = router;
