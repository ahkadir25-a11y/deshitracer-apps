"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaUtils = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../errors/AppError"));
exports.RotaUtils = {
    requireString(value, field) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new AppError_1.default(400, `${field} is required`);
        }
        return value.trim();
    },
    optionalString(value) {
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== 'string')
            return undefined;
        const v = value.trim();
        return v ? v : undefined;
    },
    requireObjectId(id, field) {
        const str = this.requireString(id, field);
        if (!mongoose_1.Types.ObjectId.isValid(str))
            throw new AppError_1.default(400, `${field} is invalid`);
        return str;
    },
    optionalObjectId(id) {
        if (id === undefined || id === null || id === '')
            return undefined;
        if (typeof id !== 'string')
            return undefined;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return undefined;
        return id;
    },
    normalizeEmail(value) {
        const email = this.requireString(value, 'email').toLowerCase();
        // Simple email check (good enough for backend validation; DB still enforces uniqueness)
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!ok)
            throw new AppError_1.default(400, 'email is invalid');
        return email;
    },
    parseBoolean(value) {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return undefined;
    },
    pagination(query, defaults = { page: 1, limit: 20, maxLimit: 200 }) {
        var _a, _b;
        const page = Math.max(parseInt(String((_a = query === null || query === void 0 ? void 0 : query.page) !== null && _a !== void 0 ? _a : defaults.page), 10) || defaults.page, 1);
        const limitRaw = parseInt(String((_b = query === null || query === void 0 ? void 0 : query.limit) !== null && _b !== void 0 ? _b : defaults.limit), 10) || defaults.limit;
        const limit = Math.min(Math.max(limitRaw, 1), defaults.maxLimit);
        const skip = (page - 1) * limit;
        return { page, limit, skip };
    },
    sort(query, defaultSortBy) {
        const sortBy = typeof (query === null || query === void 0 ? void 0 : query.sortBy) === 'string' && query.sortBy.trim() ? query.sortBy.trim() : defaultSortBy;
        const sortOrder = (query === null || query === void 0 ? void 0 : query.sortOrder) === 'asc' ? 1 : -1;
        return { sortBy, sortOrder };
    },
    parseDate(value, field) {
        const s = this.requireString(value, field);
        const d = new Date(s);
        if (Number.isNaN(d.getTime()))
            throw new AppError_1.default(400, `${field} is invalid ISO date`);
        return d;
    },
};
