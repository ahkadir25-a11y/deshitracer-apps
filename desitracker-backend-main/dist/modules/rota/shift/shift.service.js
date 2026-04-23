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
exports.RotaShiftService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const shift_model_1 = require("./shift.model");
const role_model_1 = require("../role/role.model");
const employee_model_1 = require("../employee/employee.model");
const shift_validation_1 = require("./shift.validation");
const rota_utils_1 = require("../rota.utils");
function ensureRole(roleId, business) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield role_model_1.RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
        if (!role)
            throw new AppError_1.default(400, 'Invalid role for this business');
        return role;
    });
}
function ensureEmployee(employeeId, business) {
    return __awaiter(this, void 0, void 0, function* () {
        const emp = yield employee_model_1.RotaEmployee.findOne({ _id: employeeId, business, isDeleted: false, status: 'ACTIVE' });
        if (!emp)
            throw new AppError_1.default(400, 'Invalid/Inactive employee for this business');
        return emp;
    });
}
// Prevent double-booking (overlapping shifts)
function ensureNoOverlap(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args.employee)
            return;
        const filter = {
            business: args.business,
            employee: new mongoose_1.Types.ObjectId(args.employee),
            isDeleted: false,
            status: { $ne: 'CANCELLED' },
            startAt: { $lt: args.endAt },
            endAt: { $gt: args.startAt },
        };
        if (args.excludeId)
            filter._id = { $ne: new mongoose_1.Types.ObjectId(args.excludeId) };
        const clash = yield shift_model_1.RotaShift.findOne(filter).select('_id startAt endAt');
        if (clash)
            throw new AppError_1.default(409, 'Employee already has a shift that overlaps this time range');
    });
}
exports.RotaShiftService = {
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const dto = shift_validation_1.RotaShiftValidation.create(payload);
            yield ensureRole(dto.role, dto.business);
            // If shift is assigned to employee, employee must exist & be ACTIVE & belong to business
            if (dto.employee) {
                const emp = yield ensureEmployee(dto.employee, dto.business);
                // Since your spec says: each employee has a role
                // enforce that shift role matches employee role (real-world safe default)
                if (String(emp.role) !== String(dto.role)) {
                    throw new AppError_1.default(400, 'Shift role must match employee role');
                }
            }
            yield ensureNoOverlap({ business: dto.business, employee: (_a = dto.employee) !== null && _a !== void 0 ? _a : null, startAt: dto.startAt, endAt: dto.endAt });
            const doc = yield shift_model_1.RotaShift.create({
                business: dto.business,
                employee: (_b = dto.employee) !== null && _b !== void 0 ? _b : null,
                role: dto.role,
                startAt: dto.startAt,
                endAt: dto.endAt,
                breakMinutes: (_c = dto.breakMinutes) !== null && _c !== void 0 ? _c : 0,
                location: (_d = dto.location) !== null && _d !== void 0 ? _d : '',
                notes: (_e = dto.notes) !== null && _e !== void 0 ? _e : '',
                status: (_f = dto.status) !== null && _f !== void 0 ? _f : 'DRAFT',
                isDeleted: false,
            });
            return doc;
        });
    },
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = shift_validation_1.RotaShiftValidation.businessFromQuery(query);
            const { page, limit, skip } = rota_utils_1.RotaUtils.pagination(query, { page: 1, limit: 50, maxLimit: 200 });
            const { sortBy: sortByRaw, sortOrder: sortOrderRaw } = rota_utils_1.RotaUtils.sort(query, 'startAt');
            const sort = {
                [String(sortByRaw)]: sortOrderRaw,
            };
            const filter = { business, isDeleted: false };
            if ((query === null || query === void 0 ? void 0 : query.status) === 'DRAFT' || (query === null || query === void 0 ? void 0 : query.status) === 'PUBLISHED' || (query === null || query === void 0 ? void 0 : query.status) === 'CANCELLED') {
                filter.status = query.status;
            }
            const employee = rota_utils_1.RotaUtils.optionalObjectId(query === null || query === void 0 ? void 0 : query.employee);
            if (employee)
                filter.employee = new mongoose_1.Types.ObjectId(employee);
            const role = rota_utils_1.RotaUtils.optionalObjectId(query === null || query === void 0 ? void 0 : query.role);
            if (role)
                filter.role = new mongoose_1.Types.ObjectId(role);
            // Window query (weekly/daily rota)
            const from = (query === null || query === void 0 ? void 0 : query.from) ? new Date(String(query.from)) : null;
            const to = (query === null || query === void 0 ? void 0 : query.to) ? new Date(String(query.to)) : null;
            if (from && Number.isNaN(from.getTime()))
                throw new AppError_1.default(400, 'from is invalid');
            if (to && Number.isNaN(to.getTime()))
                throw new AppError_1.default(400, 'to is invalid');
            // return shifts that intersect [from, to]
            if (from)
                filter.endAt = Object.assign(Object.assign({}, filter.endAt), { $gt: from });
            if (to)
                filter.startAt = Object.assign(Object.assign({}, filter.startAt), { $lt: to });
            const [data, total] = yield Promise.all([
                shift_model_1.RotaShift.find(filter)
                    .populate('employee')
                    .populate('role')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
                shift_model_1.RotaShift.countDocuments(filter),
            ]);
            return { meta: { page, limit, total }, data };
        });
    },
    getById(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield shift_model_1.RotaShift.findOne({ _id: id, business, isDeleted: false })
                .populate('employee')
                .populate('role');
            if (!doc)
                throw new AppError_1.default(404, 'Shift not found');
            return doc;
        });
    },
    update(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const existing = yield shift_model_1.RotaShift.findOne({ _id: id, business, isDeleted: false });
            if (!existing)
                throw new AppError_1.default(404, 'Shift not found');
            const dto = shift_validation_1.RotaShiftValidation.update(payload);
            const nextStart = (_a = dto.startAt) !== null && _a !== void 0 ? _a : existing.startAt;
            const nextEnd = (_b = dto.endAt) !== null && _b !== void 0 ? _b : existing.endAt;
            if (nextEnd <= nextStart)
                throw new AppError_1.default(400, 'endAt must be after startAt');
            const nextBreak = (_d = (_c = dto.breakMinutes) !== null && _c !== void 0 ? _c : existing.breakMinutes) !== null && _d !== void 0 ? _d : 0;
            const durationMinutes = Math.floor((nextEnd.getTime() - nextStart.getTime()) / 60000);
            if (nextBreak > durationMinutes)
                throw new AppError_1.default(400, 'breakMinutes cannot exceed shift duration');
            const nextRole = (_e = dto.role) !== null && _e !== void 0 ? _e : String(existing.role);
            yield ensureRole(String(nextRole), business);
            const nextEmployee = dto.employee === undefined
                ? (existing.employee ? String(existing.employee) : null)
                : (dto.employee ? String(dto.employee) : null);
            if (nextEmployee) {
                const emp = yield ensureEmployee(nextEmployee, business);
                if (String(emp.role) !== String(nextRole)) {
                    throw new AppError_1.default(400, 'Shift role must match employee role');
                }
            }
            yield ensureNoOverlap({
                business,
                employee: nextEmployee,
                startAt: nextStart,
                endAt: nextEnd,
                excludeId: id,
            });
            const doc = yield shift_model_1.RotaShift.findOneAndUpdate({ _id: id, business, isDeleted: false }, Object.assign(Object.assign({}, dto), { startAt: nextStart, endAt: nextEnd, breakMinutes: nextBreak }), { new: true, runValidators: true })
                .populate('employee')
                .populate('role');
            if (!doc)
                throw new AppError_1.default(404, 'Shift not found');
            return doc;
        });
    },
    // Soft delete: cancel + isDeleted
    remove(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield shift_model_1.RotaShift.findOneAndUpdate({ _id: id, business, isDeleted: false }, { isDeleted: true, status: 'CANCELLED' }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Shift not found');
            return doc;
        });
    },
};
