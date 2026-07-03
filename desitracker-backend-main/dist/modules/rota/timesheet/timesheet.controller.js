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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaTimesheetController = void 0;
const rota_utils_1 = require("../rota.utils");
const timesheet_service_1 = require("./timesheet.service");
const socket_1 = require("../../../utils/socket");
function requireUserId(req) {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        const e = new Error('Not authenticated');
        e.statusCode = 401;
        throw e;
    }
    return user.id;
}
exports.RotaTimesheetController = {
    // STAFF
    clockIn: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.clockIn(userId, req.body);
            // Push so managers/owners see "on shift / late" update live.
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'timesheet_updated', { action: 'clock_in' });
            res.status(201).json({ success: true, message: 'Clocked in', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    clockOut: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.clockOut(userId, req.body);
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'timesheet_updated', { action: 'clock_out' });
            res.status(200).json({ success: true, message: 'Clocked out', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    startBreak: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.startBreak(userId, req.body);
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'timesheet_updated', { action: 'break_start' });
            res.status(200).json({ success: true, message: 'Break started', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    endBreak: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.endBreak(userId, req.body);
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'timesheet_updated', { action: 'break_end' });
            res.status(200).json({ success: true, message: 'Break ended', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    startOvertime: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.startOvertime(userId, req.body);
            res.status(200).json({ success: true, message: 'Overtime started', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    stopOvertime: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.stopOvertime(userId, req.body);
            res.status(200).json({ success: true, message: 'Overtime submitted for approval', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    submitUndertimeReason: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield timesheet_service_1.RotaTimesheetService.submitUndertimeReason(userId, id, req.body);
            res.status(200).json({ success: true, message: 'Reason submitted', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getMyCurrent: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield timesheet_service_1.RotaTimesheetService.getMyCurrent(userId, business);
            res.status(200).json({ success: true, message: 'Current entry resolved', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getMyPaySummary: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.getMyPaySummary(userId, req.query);
            res.status(200).json({ success: true, message: 'Pay summary', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getMyPendingCounts: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield timesheet_service_1.RotaTimesheetService.getMyPendingCounts(userId, business);
            res.status(200).json({ success: true, message: 'Pending counts', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    // OWNER
    getPendingApprovals: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield timesheet_service_1.RotaTimesheetService.getPendingApprovals(req.query);
            res.status(200).json({ success: true, message: 'Pending approvals', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getStuckTimesheets: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield timesheet_service_1.RotaTimesheetService.getStuckTimesheets(req.query);
            res.status(200).json({ success: true, message: 'Stuck timesheets', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    decideOvertime: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield timesheet_service_1.RotaTimesheetService.decideOvertime(userId, id, business, req.body);
            res.status(200).json({ success: true, message: 'Overtime decided', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    decideUndertime: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield timesheet_service_1.RotaTimesheetService.decideUndertime(userId, id, business, req.body);
            res.status(200).json({ success: true, message: 'Undertime decided', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getAll: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield timesheet_service_1.RotaTimesheetService.getAll(req.query);
            res.status(200).json({
                success: true,
                message: 'Timesheets fetched',
                meta: result.meta,
                data: result.data,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getSummary: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield timesheet_service_1.RotaTimesheetService.getSummary(req.query);
            res.status(200).json({ success: true, message: 'Summary computed', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    ownerCreate: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield timesheet_service_1.RotaTimesheetService.ownerCreate(userId, req.body);
            res.status(201).json({ success: true, message: 'Timesheet entry created', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield timesheet_service_1.RotaTimesheetService.update(userId, id, business, req.body);
            res.status(200).json({ success: true, message: 'Timesheet entry updated', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    remove: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield timesheet_service_1.RotaTimesheetService.remove(id, business);
            res.status(200).json({ success: true, message: 'Timesheet entry removed', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
};
