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
exports.RotaLeaveController = void 0;
const rota_utils_1 = require("../rota.utils");
const leave_service_1 = require("./leave.service");
function requireUserId(req) {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        const e = new Error('Not authenticated');
        e.statusCode = 401;
        throw e;
    }
    return user.id;
}
exports.RotaLeaveController = {
    createForStaff: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const result = yield leave_service_1.RotaLeaveService.createForStaff(userId, req.body);
            res.status(201).json({ success: true, message: 'Leave request submitted', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    listMine: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield leave_service_1.RotaLeaveService.listMine(userId, business);
            res.status(200).json({ success: true, message: 'My leaves', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    cancelMine: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield leave_service_1.RotaLeaveService.cancelMine(userId, id, business);
            res.status(200).json({ success: true, message: 'Leave cancelled', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    listForOwner: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield leave_service_1.RotaLeaveService.listForOwner(req.query);
            res.status(200).json({ success: true, message: 'Leaves fetched', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    decide: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield leave_service_1.RotaLeaveService.decide(userId, id, business, req.body);
            res.status(200).json({ success: true, message: 'Decision recorded', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    remove: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const id = rota_utils_1.RotaUtils.requireObjectId(req.params.id, 'id');
            const result = yield leave_service_1.RotaLeaveService.remove(id, business);
            res.status(200).json({ success: true, message: 'Leave removed', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getMyBalance: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = requireUserId(req);
            const business = rota_utils_1.RotaUtils.requireObjectId(req.query.business, 'business');
            const result = yield leave_service_1.RotaLeaveService.getMyBalance(userId, business);
            res.status(200).json({ success: true, message: 'Balance', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
    getOwnerBalances: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield leave_service_1.RotaLeaveService.getOwnerBalances(req.query);
            res.status(200).json({ success: true, message: 'Balances', data: result });
        }
        catch (err) {
            next(err);
        }
    }),
};
