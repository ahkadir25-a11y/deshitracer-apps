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
// settings/settings.service.ts
const settings_model_1 = __importDefault(require("./settings.model"));
class SettingsService {
    // Create a new settings entry (only allowed if no settings exist)
    createSettings(settingsData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingSettings = yield settings_model_1.default.findOne(); // Check if settings already exist
                if (existingSettings) {
                    throw new Error('Settings already exist. You can only update them.');
                }
                const settings = new settings_model_1.default(settingsData);
                yield settings.save();
                return settings;
            }
            catch (error) {
                console.error('Error creating settings:', error);
                throw new Error('Failed to create settings');
            }
        });
    }
    // Get the settings (if they exist, return them; if not, return null)
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield settings_model_1.default.findOne(); // Returns the first settings document
                return settings; // Will be null if no settings found
            }
            catch (error) {
                console.error('Error fetching settings:', error);
                throw new Error('Failed to retrieve settings');
            }
        });
    }
    // Update the existing settings (only one settings entry is allowed)
    updateSettings(settingsData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if any settings exist
                const existingSettings = yield settings_model_1.default.findOne();
                // If no settings exist, create a new one
                if (!existingSettings) {
                    const newSettings = new settings_model_1.default(settingsData);
                    yield newSettings.save();
                    return newSettings; // Return newly created settings
                }
                // If settings exist, update the settings
                const updatedSettings = yield settings_model_1.default.findOneAndUpdate({}, settingsData, { new: true });
                if (!updatedSettings) {
                    throw new Error('Failed to update settings');
                }
                return updatedSettings;
            }
            catch (error) {
                console.error('Error updating settings:', error);
                throw new Error('Failed to update settings');
            }
        });
    }
}
exports.default = new SettingsService();
