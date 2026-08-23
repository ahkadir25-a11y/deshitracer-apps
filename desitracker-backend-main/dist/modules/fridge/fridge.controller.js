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
const fridge_service_1 = __importDefault(require("./fridge.service"));
const businessAccess_1 = require("../../utils/lib/businessAccess");
const fridge_model_1 = __importDefault(require("./fridge.model"));
// Reads were guarded against cross-tenant access; writes were not. Temperature
// logs are HACCP records, so a fabricated entry in a rival's log is a
// compliance problem rather than merely wrong data.
const denyIfNotAllowed = (req, res, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const caller = req.user;
    const allowed = yield (0, businessAccess_1.canAccessUserScopedData)(caller === null || caller === void 0 ? void 0 : caller.id, caller === null || caller === void 0 ? void 0 : caller.role, targetUserId ? String(targetUserId) : undefined, caller === null || caller === void 0 ? void 0 : caller.email);
    if (!allowed) {
        res.status(403).json({ message: 'You are not authorized to change this data' });
        return true;
    }
    return false;
});
// Records are written against a fridge id, so the owner is read off the fridge.
const ownerOfFridge = (fridgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const fridge = yield fridge_model_1.default.findById(String(fridgeId || '')).select('userId').lean();
    return (fridge === null || fridge === void 0 ? void 0 : fridge.userId) ? String(fridge.userId) : undefined;
});
const getErrorMessage = (err) => {
    if (err instanceof Error)
        return err.message;
    if (typeof err === 'string')
        return err;
    return 'An unexpected error occurred';
};
class FridgeController {
    // Create a new fridge for a user
    createFridge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, fridgeName, fridgeLocation } = req.body;
                if (yield denyIfNotAllowed(req, res, userId))
                    return;
                const fridge = yield fridge_service_1.default.createFridge(userId, fridgeName, fridgeLocation);
                res.status(201).json(fridge);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Add a temperature record for a specific fridge
    addTemperatureRecord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fridgeId, minTemperature, maxTemperature, date } = req.body; // include date
                if (yield denyIfNotAllowed(req, res, yield ownerOfFridge(fridgeId)))
                    return;
                const updatedFridge = yield fridge_service_1.default.addTemperatureRecord(fridgeId, minTemperature, maxTemperature, date);
                res.status(200).json(updatedFridge);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Edit a temperature record
    editTemperatureRecord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fridgeId, recordId, minTemperature, maxTemperature } = req.body;
                if (yield denyIfNotAllowed(req, res, yield ownerOfFridge(fridgeId)))
                    return;
                const updatedFridge = yield fridge_service_1.default.editTemperatureRecord(fridgeId, recordId, minTemperature, maxTemperature);
                res.status(200).json(updatedFridge);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Get all fridges for a specific user
    getFridges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                // Prevent cross-tenant reads: caller must be the target user, an admin,
                // or staff of a business owned by that user.
                const caller = req.user;
                const allowed = yield (0, businessAccess_1.canAccessUserScopedData)(caller === null || caller === void 0 ? void 0 : caller.id, caller === null || caller === void 0 ? void 0 : caller.role, userId, caller === null || caller === void 0 ? void 0 : caller.email);
                if (!allowed) {
                    res.status(403).json({ message: 'You are not authorized to view this data' });
                    return;
                }
                const fridges = yield fridge_service_1.default.getFridgesByUser(userId);
                // if service returns [] or null/undefined, handle both
                if (!fridges || (Array.isArray(fridges) && fridges.length === 0)) {
                    res.status(404).json({ message: 'No fridges found for this user' });
                    return;
                }
                res.status(200).json(fridges);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Get temperature records for a specific fridge
    getTemperatureRecords(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fridgeId } = req.params;
                const { date, startDate, endDate } = req.query;
                const records = yield fridge_service_1.default.getTemperatureRecordsByFridge(fridgeId, date, startDate, endDate);
                res.status(200).json(records);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
}
exports.default = new FridgeController();
