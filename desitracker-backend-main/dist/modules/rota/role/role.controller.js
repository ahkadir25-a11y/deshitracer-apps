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
exports.RotaRoleController = void 0;
const rota_utils_1 = require("../rota.utils");
const role_service_1 = require("./role.service");
exports.RotaRoleController = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield role_service_1.RotaRoleService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getAll: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield role_service_1.RotaRoleService.getAll(req.query);
            res.status(200).json({
                success: true,
                message: 'Roles fetched successfully',
                meta: result.meta,
                data: result.data,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getById: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield role_service_1.RotaRoleService.getById(id, business);
            res.status(200).json({
                success: true,
                message: 'Role fetched successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    update: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield role_service_1.RotaRoleService.update(id, business, req.body);
            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    remove: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield role_service_1.RotaRoleService.remove(id, business);
            res.status(200).json({
                success: true,
                message: 'Role removed successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
};
