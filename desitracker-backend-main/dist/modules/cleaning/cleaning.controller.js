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
const cleaning_service_1 = __importDefault(require("./cleaning.service"));
const businessAccess_1 = require("../../utils/lib/businessAccess");
const getErrorMessage = (err) => {
    if (err instanceof Error)
        return err.message;
    if (typeof err === 'string')
        return err;
    return 'An unexpected error occurred';
};
class CleaningController {
    // Create a cleaning task
    createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, taskName, area, frequency, intervalDays } = req.body;
                const task = yield cleaning_service_1.default.createTask(userId, taskName, area, frequency, intervalDays != null ? Number(intervalDays) : null);
                res.status(201).json(task);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Add a completion log (check-off)
    addLog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId, completedBy, notes, photoUrl, date } = req.body;
                const updated = yield cleaning_service_1.default.addLog(taskId, completedBy, notes, photoUrl, date);
                res.status(200).json(updated);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Edit a log
    editLog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId, logId, notes, photoUrl } = req.body;
                const updated = yield cleaning_service_1.default.editLog(taskId, logId, notes, photoUrl);
                res.status(200).json(updated);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Get all tasks for a user/business
    getTasks(req, res) {
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
                const tasks = yield cleaning_service_1.default.getTasksByUser(userId);
                if (!tasks || (Array.isArray(tasks) && tasks.length === 0)) {
                    res.status(404).json({ message: 'No cleaning tasks found for this user' });
                    return;
                }
                res.status(200).json(tasks);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
    // Get logs for a task
    getLogs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId } = req.params;
                const { date, startDate, endDate } = req.query;
                const logs = yield cleaning_service_1.default.getLogsByTask(taskId, date, startDate, endDate);
                res.status(200).json(logs);
            }
            catch (error) {
                res.status(400).json({ message: getErrorMessage(error) });
            }
        });
    }
}
exports.default = new CleaningController();
