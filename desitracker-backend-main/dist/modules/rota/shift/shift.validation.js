"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaShiftValidation = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const rota_utils_1 = require("../rota.utils");
exports.RotaShiftValidation = {
    create(payload) {
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const role = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.role, 'role');
        const employee = (payload === null || payload === void 0 ? void 0 : payload.employee) === null ? null : rota_utils_1.RotaUtils.optionalObjectId(payload === null || payload === void 0 ? void 0 : payload.employee);
        const startAt = rota_utils_1.RotaUtils.parseDate(payload === null || payload === void 0 ? void 0 : payload.startAt, 'startAt');
        const endAt = rota_utils_1.RotaUtils.parseDate(payload === null || payload === void 0 ? void 0 : payload.endAt, 'endAt');
        if (endAt <= startAt)
            throw new AppError_1.default(400, 'endAt must be after startAt');
        const breakMinutes = (payload === null || payload === void 0 ? void 0 : payload.breakMinutes) !== undefined ? Number(payload.breakMinutes) : 0;
        if (Number.isNaN(breakMinutes) || breakMinutes < 0)
            throw new AppError_1.default(400, 'breakMinutes is invalid');
        const durationMinutes = Math.floor((endAt.getTime() - startAt.getTime()) / 60000);
        if (breakMinutes > durationMinutes)
            throw new AppError_1.default(400, 'breakMinutes cannot exceed shift duration');
        const location = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.location);
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        const status = (payload === null || payload === void 0 ? void 0 : payload.status) === 'PUBLISHED' || (payload === null || payload === void 0 ? void 0 : payload.status) === 'CANCELLED' ? payload.status : 'DRAFT';
        return { business, employee, role, startAt, endAt, breakMinutes, location, notes, status };
    },
    update(payload) {
        var _a, _b, _c;
        const dto = {};
        if ((payload === null || payload === void 0 ? void 0 : payload.employee) !== undefined) {
            dto.employee = payload.employee === null ? null : ((_a = rota_utils_1.RotaUtils.optionalObjectId(payload.employee)) !== null && _a !== void 0 ? _a : null);
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.role) !== undefined)
            dto.role = rota_utils_1.RotaUtils.requireObjectId(payload.role, 'role');
        if ((payload === null || payload === void 0 ? void 0 : payload.startAt) !== undefined)
            dto.startAt = rota_utils_1.RotaUtils.parseDate(payload.startAt, 'startAt');
        if ((payload === null || payload === void 0 ? void 0 : payload.endAt) !== undefined)
            dto.endAt = rota_utils_1.RotaUtils.parseDate(payload.endAt, 'endAt');
        if ((payload === null || payload === void 0 ? void 0 : payload.breakMinutes) !== undefined) {
            const bm = Number(payload.breakMinutes);
            if (Number.isNaN(bm) || bm < 0)
                throw new AppError_1.default(400, 'breakMinutes is invalid');
            dto.breakMinutes = bm;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.location) !== undefined)
            dto.location = (_b = rota_utils_1.RotaUtils.optionalString(payload.location)) !== null && _b !== void 0 ? _b : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.notes) !== undefined)
            dto.notes = (_c = rota_utils_1.RotaUtils.optionalString(payload.notes)) !== null && _c !== void 0 ? _c : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.status) !== undefined) {
            if (payload.status !== 'DRAFT' && payload.status !== 'PUBLISHED' && payload.status !== 'CANCELLED') {
                throw new AppError_1.default(400, 'status must be DRAFT, PUBLISHED or CANCELLED');
            }
            dto.status = payload.status;
        }
        return dto;
    },
    businessFromQuery(query) {
        return rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
    },
};
