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
const cleaning_model_1 = __importDefault(require("./cleaning.model"));
class CleaningService {
    // Create a new cleaning task for the user/business
    createTask(userId_1, taskName_1, area_1) {
        return __awaiter(this, arguments, void 0, function* (userId, taskName, area, frequency = 'daily', intervalDays = null) {
            const task = new cleaning_model_1.default({ userId, taskName, area, frequency, intervalDays, logs: [] });
            return task.save();
        });
    }
    // Staff checks a task off → append a completion log
    addLog(taskId, completedBy, notes, photoUrl, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield cleaning_model_1.default.findById(taskId);
            if (!task)
                throw new Error('Cleaning task not found');
            const logDate = date ? new Date(date) : new Date();
            if (Number.isNaN(logDate.getTime()))
                throw new Error('Invalid date');
            task.logs.push({
                date: logDate,
                completedBy: completedBy || 'Staff',
                notes: notes || '',
                photoUrl: photoUrl || '',
                status: 'done',
            });
            return task.save();
        });
    }
    // Edit an existing log
    editLog(taskId, logId, notes, photoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield cleaning_model_1.default.findById(taskId);
            if (!task)
                throw new Error('Cleaning task not found');
            const log = task.logs.find((l) => {
                var _a, _b, _c;
                const id = (_c = (_b = (_a = l === null || l === void 0 ? void 0 : l._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : l === null || l === void 0 ? void 0 : l.id;
                return id === logId;
            });
            if (!log)
                throw new Error('Log not found');
            if (notes !== undefined)
                log.notes = notes;
            if (photoUrl !== undefined)
                log.photoUrl = photoUrl;
            log.status = 'edited';
            return task.save();
        });
    }
    // Get all cleaning tasks for a user/business
    getTasksByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return cleaning_model_1.default.find({ userId });
        });
    }
    // Get logs for a specific task (optionally filtered by date / range)
    getLogsByTask(taskId, date, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield cleaning_model_1.default.findById(taskId);
            if (!task)
                throw new Error('Cleaning task not found');
            let logs = task.logs;
            if (date) {
                const target = new Date(date);
                if (Number.isNaN(target.getTime()))
                    throw new Error('Invalid date');
                const start = new Date(target);
                start.setHours(0, 0, 0, 0);
                const end = new Date(target);
                end.setHours(23, 59, 59, 999);
                logs = logs.filter((l) => {
                    const d = new Date(l.date);
                    return d >= start && d <= end;
                });
            }
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate) : new Date('1970-01-01');
                const end = endDate ? new Date(endDate) : new Date('2999-12-31');
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                    throw new Error('Invalid startDate or endDate');
                }
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                logs = logs.filter((l) => {
                    const d = new Date(l.date);
                    return d >= start && d <= end;
                });
            }
            return logs;
        });
    }
}
exports.default = new CleaningService();
