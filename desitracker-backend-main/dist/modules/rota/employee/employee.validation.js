"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEmployeeValidation = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const rota_utils_1 = require("../rota.utils");
exports.RotaEmployeeValidation = {
    create(payload) {
        var _a;
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const firstName = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.firstName, 'firstName');
        const lastName = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.lastName);
        const email = rota_utils_1.RotaUtils.normalizeEmail(payload === null || payload === void 0 ? void 0 : payload.email);
        const phone = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.phone);
        const role = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.role, 'role');
        const status = (payload === null || payload === void 0 ? void 0 : payload.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const user = rota_utils_1.RotaUtils.optionalObjectId(payload === null || payload === void 0 ? void 0 : payload.user);
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        const address = (_a = payload === null || payload === void 0 ? void 0 : payload.address) !== null && _a !== void 0 ? _a : {};
        if (firstName.length > 80)
            throw new AppError_1.default(400, 'firstName is too long');
        if (lastName && lastName.length > 80)
            throw new AppError_1.default(400, 'lastName is too long');
        return { business, firstName, lastName, email, phone, address, role, status, user, notes };
    },
    update(payload) {
        var _a, _b, _c, _d;
        const dto = {};
        if ((payload === null || payload === void 0 ? void 0 : payload.firstName) !== undefined)
            dto.firstName = rota_utils_1.RotaUtils.requireString(payload.firstName, 'firstName');
        if ((payload === null || payload === void 0 ? void 0 : payload.lastName) !== undefined)
            dto.lastName = (_a = rota_utils_1.RotaUtils.optionalString(payload.lastName)) !== null && _a !== void 0 ? _a : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.email) !== undefined)
            dto.email = rota_utils_1.RotaUtils.normalizeEmail(payload.email);
        if ((payload === null || payload === void 0 ? void 0 : payload.phone) !== undefined)
            dto.phone = (_b = rota_utils_1.RotaUtils.optionalString(payload.phone)) !== null && _b !== void 0 ? _b : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.address) !== undefined)
            dto.address = (_c = payload.address) !== null && _c !== void 0 ? _c : {};
        if ((payload === null || payload === void 0 ? void 0 : payload.role) !== undefined)
            dto.role = rota_utils_1.RotaUtils.requireObjectId(payload.role, 'role');
        if ((payload === null || payload === void 0 ? void 0 : payload.status) !== undefined) {
            if (payload.status !== 'ACTIVE' && payload.status !== 'INACTIVE') {
                throw new AppError_1.default(400, 'status must be ACTIVE or INACTIVE');
            }
            dto.status = payload.status;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.user) !== undefined)
            dto.user = rota_utils_1.RotaUtils.optionalObjectId(payload.user);
        if ((payload === null || payload === void 0 ? void 0 : payload.notes) !== undefined)
            dto.notes = (_d = rota_utils_1.RotaUtils.optionalString(payload.notes)) !== null && _d !== void 0 ? _d : '';
        return dto;
    },
    businessFromQuery(query) {
        return rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
    },
};
