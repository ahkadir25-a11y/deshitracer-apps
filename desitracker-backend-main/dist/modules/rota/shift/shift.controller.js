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
exports.RotaShiftController = void 0;
const rota_utils_1 = require("../rota.utils");
const shift_service_1 = require("./shift.service");
const socket_1 = require("../../../utils/socket");
exports.RotaShiftController = {
    create: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield shift_service_1.RotaShiftService.create(req.body);
            (0, socket_1.emitToBusiness)((_a = req.body) === null || _a === void 0 ? void 0 : _a.business, 'rota_updated', { action: 'created' });
            res.status(201).json({
                success: true,
                message: 'Shift created successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    getAll: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield shift_service_1.RotaShiftService.getAll(req.query);
            res.status(200).json({
                success: true,
                message: 'Shifts fetched successfully',
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
            const result = yield shift_service_1.RotaShiftService.getById(id, business);
            res.status(200).json({
                success: true,
                message: 'Shift fetched successfully',
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
            const result = yield shift_service_1.RotaShiftService.update(id, business, req.body);
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'updated' });
            res.status(200).json({
                success: true,
                message: 'Shift updated successfully',
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
            const result = yield shift_service_1.RotaShiftService.remove(id, business);
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'removed' });
            res.status(200).json({
                success: true,
                message: 'Shift removed successfully',
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    }),
    // ── Absence cover ──────────────────────────────────────────────────────
    requestCover: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield shift_service_1.RotaShiftService.requestCover(id, business, req.body);
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'cover_requested' });
            res.status(200).json({ success: true, message: 'Cover requested', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    assignCover: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield shift_service_1.RotaShiftService.assignCover(id, business, req.body);
            (0, socket_1.emitToBusiness)(business, 'rota_updated', { action: 'cover_assigned' });
            res.status(200).json({ success: true, message: 'Cover assigned', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    availableForCover: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield shift_service_1.RotaShiftService.availableForCover(id, business);
            res.status(200).json({ success: true, message: 'Available staff resolved', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
};
