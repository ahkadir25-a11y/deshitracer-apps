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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaRoleService = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const role_model_1 = require("./role.model");
const role_validation_1 = require("./role.validation");
const rota_utils_1 = require("../rota.utils");
exports.RotaRoleService = {
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const dto = role_validation_1.RotaRoleValidation.create(payload);
            try {
                const doc = yield role_model_1.RotaRole.create(Object.assign({ business: dto.business, name: dto.name, description: (_a = dto.description) !== null && _a !== void 0 ? _a : '', isActive: (_b = dto.isActive) !== null && _b !== void 0 ? _b : true, isDeleted: false }, (dto.permissions ? { permissions: dto.permissions } : {})));
                return doc;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                    throw new AppError_1.default(409, 'Role name already exists for this business');
                throw e;
            }
        });
    },
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = role_validation_1.RotaRoleValidation.businessFromQuery(query);
            const { page, limit, skip } = rota_utils_1.RotaUtils.pagination(query, { page: 1, limit: 20, maxLimit: 200 });
            const { sortBy, sortOrder } = rota_utils_1.RotaUtils.sort(query, 'createdAt');
            const filter = { business, isDeleted: false };
            const isActive = rota_utils_1.RotaUtils.parseBoolean(query === null || query === void 0 ? void 0 : query.isActive);
            if (isActive !== undefined)
                filter.isActive = isActive;
            const searchTerm = rota_utils_1.RotaUtils.optionalString(query === null || query === void 0 ? void 0 : query.searchTerm);
            if (searchTerm) {
                filter.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                ];
            }
            const sort = { [String(sortBy)]: sortOrder };
            const [data, total] = yield Promise.all([
                role_model_1.RotaRole.find(filter).sort(sort).skip(skip).limit(limit),
                role_model_1.RotaRole.countDocuments(filter),
            ]);
            return { meta: { page, limit, total }, data };
        });
    },
    getById(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield role_model_1.RotaRole.findOne({ _id: id, business, isDeleted: false });
            if (!doc)
                throw new AppError_1.default(404, 'Role not found');
            return doc;
        });
    },
    update(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const dto = role_validation_1.RotaRoleValidation.update(payload);
            // Build $set with permissions dot-notated. Without this a partial
            // { permissions: { canViewOrders: true } } would replace the whole sub-doc
            // and wipe the other flags.
            const { permissions } = dto, rest = __rest(dto, ["permissions"]);
            const setOps = Object.assign({}, rest);
            if (permissions) {
                for (const [k, v] of Object.entries(permissions)) {
                    setOps[`permissions.${k}`] = v;
                }
            }
            try {
                const doc = yield role_model_1.RotaRole.findOneAndUpdate({ _id: id, business, isDeleted: false }, { $set: setOps }, { new: true, runValidators: true });
                if (!doc)
                    throw new AppError_1.default(404, 'Role not found');
                return doc;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                    throw new AppError_1.default(409, 'Role name already exists for this business');
                throw e;
            }
        });
    },
    // Soft delete
    remove(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield role_model_1.RotaRole.findOneAndUpdate({ _id: id, business, isDeleted: false }, { isDeleted: true, isActive: false }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Role not found');
            return doc;
        });
    },
};
