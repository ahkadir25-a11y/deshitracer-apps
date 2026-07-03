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
        if (clash) {
            const fmt = (d) => `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
            throw new AppError_1.default(409, `Conflict: this employee already has a shift ${fmt(new Date(clash.startAt))} – ${fmt(new Date(clash.endAt))}. Pick a different time or reassign.`);
        }
    });
}
// Check if this shift would push the employee over their personal weekly hour limit.
// Fetches the employee's maxWeeklyHours — if null/0, no limit is enforced.
function ensureNoOvertimeRisk(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const empDoc = yield employee_model_1.RotaEmployee.findById(args.employee).select('maxWeeklyHours').lean();
        const rawLimit = empDoc === null || empDoc === void 0 ? void 0 : empDoc.maxWeeklyHours;
        // null or 0 means "no weekly hour cap" — skip the check entirely.
        if (rawLimit === null || rawLimit === undefined || rawLimit === 0)
            return;
        const MAX_HOURS = rawLimit;
        // Find the Monday (start) and Sunday (end) of the week containing startAt
        const day = args.startAt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const diffToMon = (day === 0 ? -6 : 1 - day); // days back to Monday
        const weekStart = new Date(args.startAt);
        weekStart.setDate(weekStart.getDate() + diffToMon);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const filter = {
            business: args.business,
            employee: new mongoose_1.Types.ObjectId(args.employee),
            isDeleted: false,
            status: { $ne: 'CANCELLED' },
            startAt: { $gte: weekStart },
            endAt: { $lte: weekEnd },
        };
        if (args.excludeId)
            filter._id = { $ne: new mongoose_1.Types.ObjectId(args.excludeId) };
        const existingShifts = yield shift_model_1.RotaShift.find(filter).select('startAt endAt');
        // Sum existing scheduled minutes
        const existingMinutes = existingShifts.reduce((sum, s) => {
            return sum + (s.endAt.getTime() - s.startAt.getTime()) / 60000;
        }, 0);
        // Add the new shift duration
        const newShiftMinutes = (args.endAt.getTime() - args.startAt.getTime()) / 60000;
        const totalHours = (existingMinutes + newShiftMinutes) / 60;
        if (totalHours > MAX_HOURS) {
            throw new AppError_1.default(422, `Weekly hours exceeded: This shift would schedule this employee for ${totalHours.toFixed(1)} hours this week, exceeding their ${MAX_HOURS}h weekly limit. Remove an existing shift, reduce hours, or raise their weekly limit in the employee profile.`);
        }
    });
}
// ────────────────────────────────────────────────────────────────────────────────────
exports.RotaShiftService = {
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            const dto = shift_validation_1.RotaShiftValidation.create(payload);
            yield ensureRole(dto.role, dto.business);
            // If shift is assigned to employee, employee must exist & be ACTIVE & belong to business
            if (dto.employee) {
                yield ensureEmployee(dto.employee, dto.business);
                // Note: we intentionally do NOT enforce that the shift role matches the
                // employee's default role. Owners routinely cover shifts across roles
                // (e.g. a manager filling in as waiter). Enforcing the match here also
                // breaks edits whenever an employee's role is changed after scheduling.
            }
            yield ensureNoOverlap({ business: dto.business, employee: (_a = dto.employee) !== null && _a !== void 0 ? _a : null, startAt: dto.startAt, endAt: dto.endAt });
            // ─── NEW: Overtime protection check before saving ────────────────────────────────
            // Only runs if an employee is assigned to this shift
            if (dto.employee) {
                yield ensureNoOvertimeRisk({
                    business: dto.business,
                    employee: dto.employee,
                    startAt: dto.startAt,
                    endAt: dto.endAt,
                });
            }
            // ──────────────────────────────────────────────────────────────────────────
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
            // ─── NEW: 2-Month Recurring Shift Engine ───────────────────────────────────────
            // If repeatWeeklyFor is set (1-8 weeks), auto-generate identical shifts
            // for each subsequent week. Each copy also runs the overlap &
            // overtime checks so the auto-schedule is always conflict-free.
            const repeatWeeks = typeof (payload === null || payload === void 0 ? void 0 : payload.repeatWeeklyFor) === 'number'
                ? Math.min(Math.max(Math.floor(payload.repeatWeeklyFor), 0), 8) // clamp 0–8
                : 0;
            if (repeatWeeks > 0) {
                const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
                for (let week = 1; week <= repeatWeeks; week++) {
                    const repeatStart = new Date(dto.startAt.getTime() + week * MS_PER_WEEK);
                    const repeatEnd = new Date(dto.endAt.getTime() + week * MS_PER_WEEK);
                    // Run the same safety checks for every future week
                    yield ensureNoOverlap({
                        business: dto.business,
                        employee: (_g = dto.employee) !== null && _g !== void 0 ? _g : null,
                        startAt: repeatStart,
                        endAt: repeatEnd,
                    });
                    if (dto.employee) {
                        yield ensureNoOvertimeRisk({
                            business: dto.business,
                            employee: dto.employee,
                            startAt: repeatStart,
                            endAt: repeatEnd,
                        });
                    }
                    // Create the duplicated shift for this week
                    yield shift_model_1.RotaShift.create({
                        business: dto.business,
                        employee: (_h = dto.employee) !== null && _h !== void 0 ? _h : null,
                        role: dto.role,
                        startAt: repeatStart,
                        endAt: repeatEnd,
                        breakMinutes: (_j = dto.breakMinutes) !== null && _j !== void 0 ? _j : 0,
                        location: (_k = dto.location) !== null && _k !== void 0 ? _k : '',
                        notes: (_l = dto.notes) !== null && _l !== void 0 ? _l : '',
                        status: (_m = dto.status) !== null && _m !== void 0 ? _m : 'DRAFT',
                        isDeleted: false,
                    });
                }
            }
            // ──────────────────────────────────────────────────────────────────────────
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
                yield ensureEmployee(nextEmployee, business);
                // Role-match constraint intentionally removed — see create() for rationale.
            }
            yield ensureNoOverlap({
                business,
                employee: nextEmployee,
                startAt: nextStart,
                endAt: nextEnd,
                excludeId: id,
            });
            // ─── NEW: Overtime protection also applies when editing shifts ───────────────
            // Without this, the owner could extend a shift from 8h to 16h
            // and the overtime check would never fire.
            if (nextEmployee) {
                yield ensureNoOvertimeRisk({
                    business,
                    employee: nextEmployee,
                    startAt: nextStart,
                    endAt: nextEnd,
                    excludeId: id,
                });
            }
            // ─────────────────────────────────────────────────────────────────────────────
            const doc = yield shift_model_1.RotaShift.findOneAndUpdate({ _id: id, business, isDeleted: false }, Object.assign(Object.assign({}, dto), { startAt: nextStart, endAt: nextEnd, breakMinutes: nextBreak }), { new: true, runValidators: true })
                .populate('employee')
                .populate('role');
            if (!doc)
                throw new AppError_1.default(404, 'Shift not found');
            // ─── NEW: Notify staff if Owner mandated overtime was just toggled ON ──────
            if (dto.ownerMandatedOvertime === true &&
                existing.ownerMandatedOvertime !== true &&
                doc.employee) {
                try {
                    const { sendExpoPush } = yield Promise.resolve().then(() => __importStar(require('../../../utils/lib/push')));
                    const empDoc = yield employee_model_1.RotaEmployee.findById(doc.employee._id).select('expoPushToken').lean();
                    const pushToken = empDoc === null || empDoc === void 0 ? void 0 : empDoc.expoPushToken;
                    if (pushToken) {
                        yield sendExpoPush({
                            to: pushToken,
                            title: '⚠️ Mandatory Overtime Requested',
                            body: `Your manager has requested you to stay for overtime today. Your timesheet will automatically track your overtime hours after your shift ends.`,
                            sound: 'default',
                            data: { type: 'MANDATORY_OVERTIME', shiftId: String(doc._id) },
                        });
                    }
                }
                catch (err) {
                    console.error('[Overtime Push Notification Error]:', err);
                }
            }
            // ─────────────────────────────────────────────────────────────────────────────
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
    // ── ABSENCE COVER ────────────────────────────────────────────────────────
    // Owner flags a shift as needing cover (assigned staff called in sick etc.)
    requestCover(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const shift = yield shift_model_1.RotaShift.findOne({ _id: id, business, isDeleted: false });
            if (!shift)
                throw new AppError_1.default(404, 'Shift not found');
            if (!shift.employee)
                throw new AppError_1.default(400, 'Shift has no assigned employee');
            shift.coverStatus = 'NEEDS_COVER';
            shift.coverNote = ((payload === null || payload === void 0 ? void 0 : payload.coverNote) || '').toString().slice(0, 500);
            // Preserve the original assignee so the report still knows whose absence
            // triggered the cover. Only set if not already set (don't overwrite on a
            // second request).
            if (!shift.originalEmployee)
                shift.originalEmployee = shift.employee;
            yield shift.save();
            return shift.populate(['employee', 'role', 'originalEmployee']);
        });
    },
    // Owner picks a replacement and reassigns. Runs the same overlap + OT
    // checks as a normal edit so we don't accidentally double-book the cover.
    assignCover(id, business, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const newEmployeeId = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.employee, 'employee');
            const shift = yield shift_model_1.RotaShift.findOne({ _id: id, business, isDeleted: false });
            if (!shift)
                throw new AppError_1.default(404, 'Shift not found');
            const emp = yield ensureEmployee(newEmployeeId, business);
            if (String(emp.role) !== String(shift.role)) {
                throw new AppError_1.default(400, 'Cover employee must have the same role as the shift');
            }
            yield ensureNoOverlap({
                business,
                employee: newEmployeeId,
                startAt: shift.startAt,
                endAt: shift.endAt,
                excludeId: id,
            });
            yield ensureNoOvertimeRisk({
                business,
                employee: newEmployeeId,
                startAt: shift.startAt,
                endAt: shift.endAt,
                excludeId: id,
            });
            if (!shift.originalEmployee && shift.employee) {
                shift.originalEmployee = shift.employee;
            }
            shift.employee = newEmployeeId;
            shift.coverStatus = 'COVERED';
            yield shift.save();
            return shift.populate(['employee', 'role', 'originalEmployee']);
        });
    },
    // Returns employees eligible to cover the shift:
    //   • same business, ACTIVE, same role
    //   • no overlapping shift in the same time window
    //   • no APPROVED leave that overlaps the shift
    availableForCover(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const shift = yield shift_model_1.RotaShift.findOne({ _id: id, business, isDeleted: false });
            if (!shift)
                throw new AppError_1.default(404, 'Shift not found');
            // Lazy-import to avoid a circular dep with leave.model.
            const { RotaEmployee } = yield Promise.resolve().then(() => __importStar(require('../employee/employee.model')));
            const { RotaLeave } = yield Promise.resolve().then(() => __importStar(require('../leave/leave.model')));
            const sameRoleEmployees = yield RotaEmployee.find({
                business,
                role: shift.role,
                status: 'ACTIVE',
                isDeleted: false,
                _id: { $ne: shift.employee },
            });
            if (!sameRoleEmployees.length)
                return [];
            const employeeIds = sameRoleEmployees.map((e) => e._id);
            // Find overlapping shifts for those employees.
            const overlapping = yield shift_model_1.RotaShift.find({
                business,
                employee: { $in: employeeIds },
                isDeleted: false,
                status: { $ne: 'CANCELLED' },
                _id: { $ne: shift._id },
                startAt: { $lt: shift.endAt },
                endAt: { $gt: shift.startAt },
            }).select('employee');
            const busyIds = new Set(overlapping.map((o) => String(o.employee)));
            // Find approved leave that overlaps.
            const overlappingLeave = yield RotaLeave.find({
                business,
                employee: { $in: employeeIds },
                status: 'APPROVED',
                isDeleted: false,
                startDate: { $lte: shift.endAt },
                endDate: { $gte: shift.startAt },
            }).select('employee');
            const onLeaveIds = new Set(overlappingLeave.map((l) => String(l.employee)));
            return sameRoleEmployees.map((e) => (Object.assign(Object.assign({}, e.toObject()), { _conflict: busyIds.has(String(e._id))
                    ? 'Has overlapping shift'
                    : onLeaveIds.has(String(e._id))
                        ? 'On approved leave'
                        : null })));
        });
    },
};
