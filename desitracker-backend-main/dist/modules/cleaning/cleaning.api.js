"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleaningRoutes = void 0;
const express_1 = require("express");
const cleaning_controller_1 = __importDefault(require("./cleaning.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const router = (0, express_1.Router)();
// Internal staff compliance tool — all routes require an authenticated business
// user. (Was fully open before.)
router.use((0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF));
// Cleaning task + completion-log routes (mirrors the Fridge module)
router.post('/create', cleaning_controller_1.default.createTask);
router.post('/add-log', cleaning_controller_1.default.addLog);
router.put('/edit-log', cleaning_controller_1.default.editLog);
router.get('/:userId', cleaning_controller_1.default.getTasks);
router.get('/logs/:taskId', cleaning_controller_1.default.getLogs);
exports.CleaningRoutes = router;
