"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.RotaEmployeeController = void 0;
const rota_utils_1 = require("../rota.utils");
const employee_service_1 = require("./employee.service");
const socket_1 = require("../../../utils/socket");
exports.RotaEmployeeController = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield employee_service_1.RotaEmployeeService.create(req.body);
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'rota_updated', { action: 'employee_created' });
            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getAll: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield employee_service_1.RotaEmployeeService.getAll(req.query);
            // Staff can list colleagues (needed to render the rota with names) but
            // must not see private HR fields — trim to a safe projection for them.
            const callerRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
            const data = callerRole === 'staff'
                ? result.data.map((e) => ({
                    _id: e._id,
                    firstName: e.firstName,
                    lastName: e.lastName,
                    photoUrl: e.photoUrl,
                    status: e.status,
                    role: e.role,
                    user: e.user,
                    business: e.business,
                }))
                : result.data;
            res.status(200).json({
                success: true,
                message: 'Employees fetched successfully',
                meta: result.meta,
                data,
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
            const result = yield employee_service_1.RotaEmployeeService.getById(id, business);
            res.status(200).json({
                success: true,
                message: 'Employee fetched successfully',
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
            const result = yield employee_service_1.RotaEmployeeService.update(id, business, req.body);
            // Role assignment / details changed — push so the affected staff
            // re-pull permissions live.
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'employee_updated' });
            res.status(200).json({
                success: true,
                message: 'Employee updated successfully',
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
            const result = yield employee_service_1.RotaEmployeeService.remove(id, business);
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'employee_removed' });
            res.status(200).json({
                success: true,
                message: 'Employee removed successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    acceptInvite: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield employee_service_1.RotaEmployeeService.acceptInvite(req.body);
            res.status(200).json({
                success: true,
                message: 'Invite accepted. You can now sign in.',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getMyPermissions: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id)) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }
            const result = yield employee_service_1.RotaEmployeeService.getMyPermissions(user.id, user.role);
            res.status(200).json({
                success: true,
                message: 'Permissions resolved',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    savePushToken: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!(user === null || user === void 0 ? void 0 : user.id)) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const { token } = req.body;
            if (!token || typeof token !== 'string') {
                res.status(400).json({ success: false, message: 'token is required' });
                return;
            }
            const emp = yield (yield Promise.resolve().then(() => __importStar(require('./employee.model')))).RotaEmployee.findOneAndUpdate({ user: user.id, business, isDeleted: false }, { expoPushToken: token }, { new: true });
            if (!emp) {
                res.status(404).json({ success: false, message: 'Employee record not found' });
                return;
            }
            res.status(200).json({ success: true, message: 'Push token saved' });
        }
        catch (err) {
            next(err);
        }
    }),
    resendInvite: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield employee_service_1.RotaEmployeeService.resendInvite(id, business);
            res.status(200).json({
                success: true,
                message: 'Invite resent',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
};
