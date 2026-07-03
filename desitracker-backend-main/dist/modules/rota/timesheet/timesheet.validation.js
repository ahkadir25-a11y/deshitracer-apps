"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaTimesheetValidation = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const rota_utils_1 = require("../rota.utils");
exports.RotaTimesheetValidation = {
    clockIn(payload) {
        var _a;
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const shift = (payload === null || payload === void 0 ? void 0 : payload.shift) === undefined || (payload === null || payload === void 0 ? void 0 : payload.shift) === null
            ? null
            : ((_a = rota_utils_1.RotaUtils.optionalObjectId(payload.shift)) !== null && _a !== void 0 ? _a : null);
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        return { business, shift, notes };
    },
    clockOut(payload) {
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        const undertimeReason = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.undertimeReason);
        let breakMinutes;
        if ((payload === null || payload === void 0 ? void 0 : payload.breakMinutes) !== undefined) {
            const bm = Number(payload.breakMinutes);
            if (Number.isNaN(bm) || bm < 0)
                throw new AppError_1.default(400, 'breakMinutes is invalid');
            breakMinutes = bm;
        }
        return { business, notes, breakMinutes, undertimeReason };
    },
    ownerCreate(payload) {
        var _a;
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const employee = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.employee, 'employee');
        const shift = (payload === null || payload === void 0 ? void 0 : payload.shift) === undefined || (payload === null || payload === void 0 ? void 0 : payload.shift) === null
            ? null
            : ((_a = rota_utils_1.RotaUtils.optionalObjectId(payload.shift)) !== null && _a !== void 0 ? _a : null);
        const clockIn = rota_utils_1.RotaUtils.parseDate(payload === null || payload === void 0 ? void 0 : payload.clockIn, 'clockIn');
        const clockOut = (payload === null || payload === void 0 ? void 0 : payload.clockOut) === undefined || (payload === null || payload === void 0 ? void 0 : payload.clockOut) === null
            ? null
            : rota_utils_1.RotaUtils.parseDate(payload.clockOut, 'clockOut');
        if (clockOut && clockOut <= clockIn) {
            throw new AppError_1.default(400, 'clockOut must be after clockIn');
        }
        let breakMinutes;
        if ((payload === null || payload === void 0 ? void 0 : payload.breakMinutes) !== undefined) {
            const bm = Number(payload.breakMinutes);
            if (Number.isNaN(bm) || bm < 0)
                throw new AppError_1.default(400, 'breakMinutes is invalid');
            breakMinutes = bm;
        }
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        return { business, employee, shift, clockIn, clockOut, breakMinutes, notes };
    },
    update(payload) {
        var _a, _b;
        const dto = {};
        if ((payload === null || payload === void 0 ? void 0 : payload.clockIn) !== undefined)
            dto.clockIn = rota_utils_1.RotaUtils.parseDate(payload.clockIn, 'clockIn');
        if ((payload === null || payload === void 0 ? void 0 : payload.clockOut) !== undefined) {
            dto.clockOut = payload.clockOut === null ? null : rota_utils_1.RotaUtils.parseDate(payload.clockOut, 'clockOut');
        }
        if (dto.clockIn && dto.clockOut && dto.clockOut <= dto.clockIn) {
            throw new AppError_1.default(400, 'clockOut must be after clockIn');
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.breakMinutes) !== undefined) {
            const bm = Number(payload.breakMinutes);
            if (Number.isNaN(bm) || bm < 0)
                throw new AppError_1.default(400, 'breakMinutes is invalid');
            dto.breakMinutes = bm;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.notes) !== undefined)
            dto.notes = (_a = rota_utils_1.RotaUtils.optionalString(payload.notes)) !== null && _a !== void 0 ? _a : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.editReason) !== undefined)
            dto.editReason = (_b = rota_utils_1.RotaUtils.optionalString(payload.editReason)) !== null && _b !== void 0 ? _b : '';
        return dto;
    },
    startOvertime(payload) {
        return { business: rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business') };
    },
    stopOvertime(payload) {
        return { business: rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business') };
    },
    decideOvertime(payload) {
        const decisionRaw = String((payload === null || payload === void 0 ? void 0 : payload.decision) || '').toUpperCase();
        if (decisionRaw !== 'APPROVE' && decisionRaw !== 'REJECT') {
            throw new AppError_1.default(400, 'decision must be APPROVE or REJECT');
        }
        return {
            decision: decisionRaw,
            decisionNote: rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.decisionNote),
        };
    },
    submitUndertime(payload) {
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const reason = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.reason, 'reason');
        if (reason.length < 3)
            throw new AppError_1.default(400, 'reason must be at least 3 characters');
        return { business, reason };
    },
    decideUndertime(payload) {
        const decisionRaw = String((payload === null || payload === void 0 ? void 0 : payload.decision) || '').toUpperCase();
        if (decisionRaw !== 'EXCUSE' && decisionRaw !== 'MUST_MAKEUP' && decisionRaw !== 'MADE_UP') {
            throw new AppError_1.default(400, 'decision must be EXCUSE, MUST_MAKEUP, or MADE_UP');
        }
        return {
            decision: decisionRaw,
            decisionNote: rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.decisionNote),
        };
    },
};
