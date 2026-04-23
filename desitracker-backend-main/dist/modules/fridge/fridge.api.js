"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FridgeRoutes = void 0;
const express_1 = require("express");
const fridge_controller_1 = __importDefault(require("./fridge.controller"));
const router = (0, express_1.Router)();
// Define the routes for the fridge operations
router.post('/create', fridge_controller_1.default.createFridge);
router.post('/add-record', fridge_controller_1.default.addTemperatureRecord);
router.put('/edit-record', fridge_controller_1.default.editTemperatureRecord); // For editing temperature records
router.get('/:userId', fridge_controller_1.default.getFridges);
router.get('/records/:fridgeId', fridge_controller_1.default.getTemperatureRecords); // Fetch temperature records for a fridge
exports.FridgeRoutes = router;
