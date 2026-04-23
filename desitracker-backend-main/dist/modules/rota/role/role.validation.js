"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRoleValidation = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const rota_utils_1 = require("../rota.utils");
exports.RotaRoleValidation = {
    create(payload) {
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const name = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.name, 'name');
        if (name.length > 80)
            throw new AppError_1.default(400, 'name is too long');
        const description = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.description);
        const isActive = rota_utils_1.RotaUtils.parseBoolean(payload === null || payload === void 0 ? void 0 : payload.isActive);
        return { business, name, description, isActive };
    },
    update(payload) {
        var _a;
        const dto = {};
        if ((payload === null || payload === void 0 ? void 0 : payload.name) !== undefined)
            dto.name = rota_utils_1.RotaUtils.requireString(payload.name, 'name');
        if ((payload === null || payload === void 0 ? void 0 : payload.description) !== undefined)
            dto.description = (_a = rota_utils_1.RotaUtils.optionalString(payload.description)) !== null && _a !== void 0 ? _a : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.isActive) !== undefined)
            dto.isActive = rota_utils_1.RotaUtils.parseBoolean(payload.isActive);
        return dto;
    },
    businessFromQuery(query) {
        return rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
    },
};
