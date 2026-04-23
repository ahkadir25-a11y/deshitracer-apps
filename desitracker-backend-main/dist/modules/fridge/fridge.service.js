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
const fridge_model_1 = __importDefault(require("./fridge.model"));
class FridgeService {
    // Create a new fridge for the user
    createFridge(userId, fridgeName, fridgeLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const fridge = new fridge_model_1.default({ userId, fridgeName, fridgeLocation, temperatureRecords: [] });
            return fridge.save();
        });
    }
    // Add a temperature record for a specific fridge
    addTemperatureRecord(fridgeId, minTemperature, maxTemperature, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const fridge = yield fridge_model_1.default.findById(fridgeId);
            if (!fridge)
                throw new Error("Fridge not found");
            const recordDate = date ? new Date(date) : new Date();
            if (Number.isNaN(recordDate.getTime())) {
                throw new Error("Invalid date");
            }
            fridge.temperatureRecords.push({
                date: recordDate, // ✅ use user date
                minTemperature,
                maxTemperature,
                status: "created",
            });
            return fridge.save();
        });
    }
    // Edit an existing temperature record for a fridge
    editTemperatureRecord(fridgeId, recordId, minTemperature, maxTemperature) {
        return __awaiter(this, void 0, void 0, function* () {
            const fridge = yield fridge_model_1.default.findById(fridgeId);
            if (!fridge)
                throw new Error("Fridge not found");
            const record = fridge.temperatureRecords.find((r) => {
                var _a, _b, _c;
                const id = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : r === null || r === void 0 ? void 0 : r.id; // mongoose subdocs usually have _id + id getter
                return id === recordId;
            });
            if (!record)
                throw new Error("Record not found");
            record.minTemperature = minTemperature;
            record.maxTemperature = maxTemperature;
            record.status = "edited";
            return fridge.save();
        });
    }
    // Get all fridges for a specific user
    getFridgesByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return fridge_model_1.default.find({ userId });
        });
    }
    // Get temperature records for a specific fridge
    getTemperatureRecordsByFridge(fridgeId, date, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const fridge = yield fridge_model_1.default.findById(fridgeId);
            if (!fridge)
                throw new Error('Fridge not found');
            let records = fridge.temperatureRecords;
            // filter by exact single date
            if (date) {
                const targetDate = new Date(date);
                if (Number.isNaN(targetDate.getTime())) {
                    throw new Error('Invalid date');
                }
                const start = new Date(targetDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(targetDate);
                end.setHours(23, 59, 59, 999);
                records = records.filter((record) => {
                    const recordDate = new Date(record.date);
                    return recordDate >= start && recordDate <= end;
                });
            }
            // filter by date range
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate) : new Date('1970-01-01');
                const end = endDate ? new Date(endDate) : new Date('2999-12-31');
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                    throw new Error('Invalid startDate or endDate');
                }
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                records = records.filter((record) => {
                    const recordDate = new Date(record.date);
                    return recordDate >= start && recordDate <= end;
                });
            }
            return records;
        });
    }
}
exports.default = new FridgeService();
