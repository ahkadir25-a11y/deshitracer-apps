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
exports.RotaLeaveService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const leave_model_1 = require("./leave.model");
const employee_model_1 = require("../employee/employee.model");
const rota_utils_1 = require("../rota.utils");
const VALID_TYPES = ['HOLIDAY', 'SICK', 'UNPAID', 'OTHER'];
function findMyEmployee(userId, business) {
    return __awaiter(this, void 0, void 0, function* () {
        const emp = yield employee_model_1.RotaEmployee.findOne({
            user: userId, business, isDeleted: false, status: 'ACTIVE',
        });
        if (!emp)
            throw new AppError_1.default(403, 'No active employee record for this business.');
        return emp;
    });
}
function parseDate(value, field) {
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime()))
        throw new AppError_1.default(400, `${field} is invalid date`);
    return d;
}
exports.RotaLeaveService = {
    // STAFF — submit a leave request for themselves.
    createForStaff(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
            const startDate = parseDate(payload === null || payload === void 0 ? void 0 : payload.startDate, 'startDate');
            const endDate = parseDate(payload === null || payload === void 0 ? void 0 : payload.endDate, 'endDate');
            if (endDate < startDate)
                throw new AppError_1.default(400, 'endDate must be on or after startDate');
            const type = VALID_TYPES.includes(payload === null || payload === void 0 ? void 0 : payload.type) ? payload.type : 'HOLIDAY';
            const reason = (_a = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.reason)) !== null && _a !== void 0 ? _a : '';
            const employee = yield findMyEmployee(userId, business);
            const doc = yield leave_model_1.RotaLeave.create({
                business,
                employee: employee._id,
                type,
                startDate,
                endDate,
                reason,
                status: 'PENDING',
            });
            return doc.populate('employee');
        });
    },
    // STAFF — list own requests.
    listMine(userId, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield findMyEmployee(userId, business);
            const data = yield leave_model_1.RotaLeave.find({
                business, employee: employee._id, isDeleted: false,
            })
                .populate('employee')
                .sort({ startDate: -1 });
            return data;
        });
    },
    // STAFF — cancel one of their own PENDING requests.
    cancelMine(userId, id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield findMyEmployee(userId, business);
            const doc = yield leave_model_1.RotaLeave.findOne({ _id: id, business, employee: employee._id, isDeleted: false });
            if (!doc)
                throw new AppError_1.default(404, 'Leave request not found');
            if (doc.status !== 'PENDING')
                throw new AppError_1.default(409, 'Only pending requests can be cancelled');
            doc.status = 'CANCELLED';
            yield doc.save();
            return doc;
        });
    },
    // OWNER — list all for a business, optionally filter by status / employee.
    listForOwner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
            const filter = { business, isDeleted: false };
            const status = query === null || query === void 0 ? void 0 : query.status;
            if (status && ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
                filter.status = status;
            }
            const employee = rota_utils_1.RotaUtils.optionalObjectId(query === null || query === void 0 ? void 0 : query.employee);
            if (employee)
                filter.employee = new mongoose_1.Types.ObjectId(employee);
            const data = yield leave_model_1.RotaLeave.find(filter)
                .populate('employee')
                .sort({ status: 1, startDate: -1 });
            return data;
        });
    },
    // OWNER — approve or reject a request.
    decide(userId, id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const doc = yield leave_model_1.RotaLeave.findOne({ _id: id, business, isDeleted: false });
            if (!doc)
                throw new AppError_1.default(404, 'Leave request not found');
            if (doc.status !== 'PENDING')
                throw new AppError_1.default(409, 'Request has already been decided');
            const decision = payload === null || payload === void 0 ? void 0 : payload.status;
            if (decision !== 'APPROVED' && decision !== 'REJECTED') {
                throw new AppError_1.default(400, 'status must be APPROVED or REJECTED');
            }
            doc.status = decision;
            doc.decidedBy = userId;
            doc.decidedAt = new Date();
            doc.decisionNote = (_a = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.decisionNote)) !== null && _a !== void 0 ? _a : '';
            yield doc.save();
            return doc.populate('employee');
        });
    },
    // OWNER — soft delete.
    remove(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield leave_model_1.RotaLeave.findOneAndUpdate({ _id: id, business, isDeleted: false }, { isDeleted: true }, { new: true });
            if (!doc)
                throw new AppError_1.default(404, 'Leave request not found');
            return doc;
        });
    },
    // STAFF — annual leave balance. Counts days in APPROVED holiday requests
    // for the current calendar year against the employee's `holidayAllowance`.
    getMyBalance(userId, business) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const employee = yield findMyEmployee(userId, business);
            const yearStart = new Date();
            yearStart.setMonth(0, 1);
            yearStart.setHours(0, 0, 0, 0);
            const yearEnd = new Date(yearStart);
            yearEnd.setFullYear(yearEnd.getFullYear() + 1);
            const approved = yield leave_model_1.RotaLeave.find({
                business,
                employee: employee._id,
                isDeleted: false,
                type: 'HOLIDAY',
                status: 'APPROVED',
                startDate: { $gte: yearStart, $lt: yearEnd },
            });
            // Pending PENDING holiday requests are surfaced separately so staff can
            // see "you've asked for 3 more, awaiting approval".
            const pending = yield leave_model_1.RotaLeave.find({
                business,
                employee: employee._id,
                isDeleted: false,
                type: 'HOLIDAY',
                status: 'PENDING',
                startDate: { $gte: yearStart, $lt: yearEnd },
            });
            const sumDays = (list) => list.reduce((n, d) => {
                const start = new Date(d.startDate);
                const end = new Date(d.endDate);
                // Inclusive day count, e.g. Mon-Mon = 1, Mon-Tue = 2.
                const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
                return n + Math.max(0, days);
            }, 0);
            const allowance = Number((_a = employee.holidayAllowance) !== null && _a !== void 0 ? _a : 28);
            const used = sumDays(approved);
            const pendingDays = sumDays(pending);
            const remaining = Math.max(0, allowance - used);
            return {
                year: yearStart.getFullYear(),
                allowance,
                used,
                pending: pendingDays,
                remaining,
            };
        });
    },
    // OWNER — balances for all employees of the business (single round-trip).
    getOwnerBalances(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const business = rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
            const employees = yield employee_model_1.RotaEmployee.find({ business, isDeleted: false });
            const yearStart = new Date();
            yearStart.setMonth(0, 1);
            yearStart.setHours(0, 0, 0, 0);
            const yearEnd = new Date(yearStart);
            yearEnd.setFullYear(yearEnd.getFullYear() + 1);
            const approved = yield leave_model_1.RotaLeave.find({
                business, isDeleted: false, type: 'HOLIDAY', status: 'APPROVED',
                startDate: { $gte: yearStart, $lt: yearEnd },
            });
            const usedByEmployee = new Map();
            for (const d of approved) {
                const id = String(d.employee);
                const start = new Date(d.startDate);
                const end = new Date(d.endDate);
                const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
                usedByEmployee.set(id, (usedByEmployee.get(id) || 0) + Math.max(0, days));
            }
            return employees.map((e) => {
                var _a;
                const allowance = Number((_a = e.holidayAllowance) !== null && _a !== void 0 ? _a : 28);
                const used = usedByEmployee.get(String(e._id)) || 0;
                return {
                    employee: e,
                    allowance,
                    used,
                    remaining: Math.max(0, allowance - used),
                };
            });
        });
    },
};
