"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEmployeeValidation = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const rota_utils_1 = require("../rota.utils");
exports.RotaEmployeeValidation = {
    create(payload) {
        var _a, _b, _c;
        const business = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.business, 'business');
        const firstName = rota_utils_1.RotaUtils.requireString(payload === null || payload === void 0 ? void 0 : payload.firstName, 'firstName');
        const lastName = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.lastName);
        const email = rota_utils_1.RotaUtils.normalizeEmail(payload === null || payload === void 0 ? void 0 : payload.email);
        const phone = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.phone);
        const role = rota_utils_1.RotaUtils.requireObjectId(payload === null || payload === void 0 ? void 0 : payload.role, 'role');
        const status = (payload === null || payload === void 0 ? void 0 : payload.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const user = rota_utils_1.RotaUtils.optionalObjectId(payload === null || payload === void 0 ? void 0 : payload.user);
        const notes = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.notes);
        // ─── NEW: Parse advanced HR profile fields ────────────────────────────────────
        const employeeId = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.employeeId);
        const hourlyWage = (payload === null || payload === void 0 ? void 0 : payload.hourlyWage) !== undefined ? Number(payload.hourlyWage) : undefined;
        const joiningDate = (payload === null || payload === void 0 ? void 0 : payload.joiningDate) ? new Date(payload.joiningDate) : undefined;
        const emergencyContact = (_a = payload === null || payload === void 0 ? void 0 : payload.emergencyContact) !== null && _a !== void 0 ? _a : undefined;
        const holidayAllowance = (payload === null || payload === void 0 ? void 0 : payload.holidayAllowance) !== undefined ? Number(payload.holidayAllowance) : undefined;
        if (holidayAllowance !== undefined && (Number.isNaN(holidayAllowance) || holidayAllowance < 0)) {
            throw new AppError_1.default(400, 'holidayAllowance must be a non-negative number');
        }
        const photoUrl = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.photoUrl);
        const dateOfBirth = (payload === null || payload === void 0 ? void 0 : payload.dateOfBirth) ? new Date(payload.dateOfBirth) : undefined;
        if (dateOfBirth !== undefined && Number.isNaN(dateOfBirth.getTime())) {
            throw new AppError_1.default(400, 'dateOfBirth is invalid');
        }
        // If true, the service layer will send a welcome email to this employee
        const sendInvite = rota_utils_1.RotaUtils.parseBoolean(payload === null || payload === void 0 ? void 0 : payload.sendInvite);
        const isOvertimeAllowed = (_b = rota_utils_1.RotaUtils.parseBoolean(payload === null || payload === void 0 ? void 0 : payload.isOvertimeAllowed)) !== null && _b !== void 0 ? _b : false;
        let maxWeeklyHours = undefined;
        if ((payload === null || payload === void 0 ? void 0 : payload.maxWeeklyHours) !== undefined) {
            if (payload.maxWeeklyHours === null || payload.maxWeeklyHours === '') {
                maxWeeklyHours = null;
            }
            else {
                const mwh = Number(payload.maxWeeklyHours);
                if (Number.isNaN(mwh) || mwh < 0)
                    throw new AppError_1.default(400, 'maxWeeklyHours must be a non-negative number or null');
                maxWeeklyHours = mwh;
            }
        }
        // ────────────────────────────────────────────────────────────────────────
        const address = (_c = payload === null || payload === void 0 ? void 0 : payload.address) !== null && _c !== void 0 ? _c : {};
        if (firstName.length > 80)
            throw new AppError_1.default(400, 'firstName is too long');
        if (lastName && lastName.length > 80)
            throw new AppError_1.default(400, 'lastName is too long');
        return {
            business, firstName, lastName, email, phone, address, role, status, user, notes,
            // ─── NEW fields passed through to the service layer ───
            employeeId, hourlyWage, joiningDate, emergencyContact, holidayAllowance,
            photoUrl, dateOfBirth, sendInvite, isOvertimeAllowed, maxWeeklyHours,
        };
    },
    update(payload) {
        var _a, _b, _c, _d, _e, _f;
        const dto = {};
        if ((payload === null || payload === void 0 ? void 0 : payload.firstName) !== undefined)
            dto.firstName = rota_utils_1.RotaUtils.requireString(payload.firstName, 'firstName');
        if ((payload === null || payload === void 0 ? void 0 : payload.lastName) !== undefined)
            dto.lastName = (_a = rota_utils_1.RotaUtils.optionalString(payload.lastName)) !== null && _a !== void 0 ? _a : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.email) !== undefined)
            dto.email = rota_utils_1.RotaUtils.normalizeEmail(payload.email);
        if ((payload === null || payload === void 0 ? void 0 : payload.phone) !== undefined)
            dto.phone = (_b = rota_utils_1.RotaUtils.optionalString(payload.phone)) !== null && _b !== void 0 ? _b : '';
        if ((payload === null || payload === void 0 ? void 0 : payload.address) !== undefined)
            dto.address = (_c = payload.address) !== null && _c !== void 0 ? _c : {};
        if ((payload === null || payload === void 0 ? void 0 : payload.role) !== undefined)
            dto.role = rota_utils_1.RotaUtils.requireObjectId(payload.role, 'role');
        if ((payload === null || payload === void 0 ? void 0 : payload.status) !== undefined) {
            if (payload.status !== 'ACTIVE' && payload.status !== 'INACTIVE') {
                throw new AppError_1.default(400, 'status must be ACTIVE or INACTIVE');
            }
            dto.status = payload.status;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.user) !== undefined)
            dto.user = rota_utils_1.RotaUtils.optionalObjectId(payload.user);
        if ((payload === null || payload === void 0 ? void 0 : payload.notes) !== undefined)
            dto.notes = (_d = rota_utils_1.RotaUtils.optionalString(payload.notes)) !== null && _d !== void 0 ? _d : '';
        // ─── NEW: Parse advanced HR profile fields during update ─────────────────────
        if ((payload === null || payload === void 0 ? void 0 : payload.employeeId) !== undefined)
            dto.employeeId = rota_utils_1.RotaUtils.optionalString(payload.employeeId);
        if ((payload === null || payload === void 0 ? void 0 : payload.hourlyWage) !== undefined)
            dto.hourlyWage = payload.hourlyWage !== null ? Number(payload.hourlyWage) : undefined;
        if ((payload === null || payload === void 0 ? void 0 : payload.joiningDate) !== undefined)
            dto.joiningDate = payload.joiningDate ? new Date(payload.joiningDate) : undefined;
        if ((payload === null || payload === void 0 ? void 0 : payload.emergencyContact) !== undefined)
            dto.emergencyContact = (_e = payload.emergencyContact) !== null && _e !== void 0 ? _e : {};
        if ((payload === null || payload === void 0 ? void 0 : payload.holidayAllowance) !== undefined) {
            const ha = Number(payload.holidayAllowance);
            if (Number.isNaN(ha) || ha < 0)
                throw new AppError_1.default(400, 'holidayAllowance must be a non-negative number');
            dto.holidayAllowance = ha;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.photoUrl) !== undefined) {
            dto.photoUrl = (_f = rota_utils_1.RotaUtils.optionalString(payload.photoUrl)) !== null && _f !== void 0 ? _f : null;
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.dateOfBirth) !== undefined) {
            if (payload.dateOfBirth === null || payload.dateOfBirth === '') {
                dto.dateOfBirth = null;
            }
            else {
                const dob = new Date(payload.dateOfBirth);
                if (Number.isNaN(dob.getTime()))
                    throw new AppError_1.default(400, 'dateOfBirth is invalid');
                dto.dateOfBirth = dob;
            }
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.isOvertimeAllowed) !== undefined) {
            dto.isOvertimeAllowed = rota_utils_1.RotaUtils.parseBoolean(payload.isOvertimeAllowed);
        }
        if ((payload === null || payload === void 0 ? void 0 : payload.maxWeeklyHours) !== undefined) {
            if (payload.maxWeeklyHours === null || payload.maxWeeklyHours === '') {
                dto.maxWeeklyHours = null;
            }
            else {
                const mwh = Number(payload.maxWeeklyHours);
                if (Number.isNaN(mwh) || mwh < 0)
                    throw new AppError_1.default(400, 'maxWeeklyHours must be a non-negative number or null');
                dto.maxWeeklyHours = mwh;
            }
        }
        // ─────────────────────────────────────────────────────────────────────────────
        return dto;
    },
    businessFromQuery(query) {
        return rota_utils_1.RotaUtils.requireObjectId(query === null || query === void 0 ? void 0 : query.business, 'business');
    },
};
