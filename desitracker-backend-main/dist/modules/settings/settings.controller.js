"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const settings_service_1 = __importDefault(require("./settings.service"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createSettings = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settingsData = req.body;
    const newSettings = yield settings_service_1.default.createSettings(settingsData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Settings created successfully!',
        data: newSettings,
    });
}));
const getSettings = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield settings_service_1.default.getSettings();
    // If settings don't exist, inform the frontend to show the "create settings" UI
    if (!settings) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: 404,
            message: 'No settings found, please create them.',
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Settings retrieved successfully!',
        data: settings,
    });
}));
const updateSettings = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settingsData = req.body;
    const updatedSettings = yield settings_service_1.default.updateSettings(settingsData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Settings updated successfully!',
        data: updatedSettings,
    });
}));
exports.SettingsController = {
    createSettings,
    getSettings,
    updateSettings,
};
