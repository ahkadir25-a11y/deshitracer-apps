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
exports.RotaEmployeeService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const employee_model_1 = require("./employee.model");
const employee_validation_1 = require("./employee.validation");
const role_model_1 = require("../role/role.model");
const rota_utils_1 = require("../rota.utils");
function ensureRole(roleId, business) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield role_model_1.RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
        if (!role)
            throw new AppError_1.default(400, 'Invalid role for this business');
        return role;
    });
}
exports.RotaEmployeeService = {
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const dto = employee_validation_1.RotaEmployeeValidation.create(payload);
            yield ensureRole(dto.role, dto.business);
            try {
                const doc = yield employee_model_1.RotaEmployee.create({
                    business: dto.business,
                    firstName: dto.firstName,
                    lastName: (_a = dto.lastName) !== null && _a !== void 0 ? _a : '',
                    email: dto.email,
                    phone: dto.phone,
                    address: (_b = dto.address) !== null && _b !== void 0 ? _b : {},
                    role: dto.role,
                    status: (_c = dto.status) !== null && _c !== void 0 ? _c : 'ACTIVE',
                    user: dto.user,
                    notes: (_d = dto.notes) !== null && _d !== void 0 ? _d : '',
                    isDeleted: false,
                });
                return doc;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                    throw new AppError_1.default(409, 'Employee email already exists for this business');
                throw e;
            }
        });
    },
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = employee_validation_1.RotaEmployeeValidation.businessFromQuery(query);
            const { page, limit, skip } = rota_utils_1.RotaUtils.pagination(query, { page: 1, limit: 20, maxLimit: 200 });
            const { sortBy: sortByRaw, sortOrder: sortOrderRaw } = rota_utils_1.RotaUtils.sort(query, 'createdAt');
            const sortBy = String(sortByRaw); // force string key
            const sortOrder = sortOrderRaw;
            const sort = { [sortBy]: sortOrder };
            const filter = { business, isDeleted: false };
            if ((query === null || query === void 0 ? void 0 : query.status) === 'ACTIVE' || (query === null || query === void 0 ? void 0 : query.status) === 'INACTIVE')
                filter.status = query.status;
            const role = rota_utils_1.RotaUtils.optionalObjectId(query === null || query === void 0 ? void 0 : query.role);
            if (role)
                filter.role = new mongoose_1.Types.ObjectId(role);
            const searchTerm = rota_utils_1.RotaUtils.optionalString(query === null || query === void 0 ? void 0 : query.searchTerm);
            if (searchTerm) {
                filter.$or = [
                    { firstName: { $regex: searchTerm, $options: 'i' } },
                    { lastName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { phone: { $regex: searchTerm, $options: 'i' } },
                ];
            }
            const [data, total] = yield Promise.all([
                employee_model_1.RotaEmployee.find(filter).populate('role').sort(sort).skip(skip).limit(limit),
                employee_model_1.RotaEmployee.countDocuments(filter),
            ]);
            return { meta: { page, limit, total }, data };
        });
    },
    getById(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield employee_model_1.RotaEmployee.findOne({ _id: id, business, isDeleted: false }).populate('role');
            if (!doc)
                throw new AppError_1.default(404, 'Employee not found');
            return doc;
        });
    },
    update(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const dto = employee_validation_1.RotaEmployeeValidation.update(payload);
            if (dto.role)
                yield ensureRole(dto.role, business);
            try {
                const doc = yield employee_model_1.RotaEmployee.findOneAndUpdate({ _id: id, business, isDeleted: false }, dto, { new: true, runValidators: true }).populate('role');
                if (!doc)
                    throw new AppError_1.default(404, 'Employee not found');
                return doc;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                    throw new AppError_1.default(409, 'Employee email already exists for this business');
                throw e;
            }
        });
    },
    // Soft delete
    remove(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield employee_model_1.RotaEmployee.findOneAndUpdate({ _id: id, business, isDeleted: false }, { isDeleted: true, status: 'INACTIVE' }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Employee not found');
            return doc;
        });
    },
};
