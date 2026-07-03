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
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const employee_model_1 = require("./employee.model");
const employee_validation_1 = require("./employee.validation");
const role_model_1 = require("../role/role.model");
const role_interface_1 = require("../role/role.interface");
const rota_utils_1 = require("../rota.utils");
const sendEmail_1 = __importDefault(require("../../../utils/lib/sendEmail"));
const user_model_1 = require("../../user/user/user.model");
const business_model_1 = require("../../business/business.model");
const jwt_1 = require("../../../utils/jwt");
function ensureRole(roleId, business) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield role_model_1.RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
        if (!role)
            throw new AppError_1.default(400, 'Invalid role for this business');
        return role;
    });
}
// 8-char uppercase alphanumeric code (no ambiguous chars like 0/O/1/I)
function generateInviteCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto_1.default.randomBytes(8);
    let out = '';
    for (let i = 0; i < 8; i++)
        out += alphabet[bytes[i] % alphabet.length];
    return out;
}
const INVITE_TTL_DAYS = 7;
// One email = one role. A Business Owner (or admin) email must never receive
// a staff invite — owners noticed getting invited to their own email. Members
// ('user') may still be invited; accepting upgrades them to staff.
function ensureEmailInvitable(email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!email)
            return;
        const existing = yield user_model_1.User.findOne({ email: rota_utils_1.RotaUtils.normalizeEmail(email) });
        if (existing && !existing.isDeleted && (existing.role === 'business_owner' || existing.role === 'admin')) {
            throw new AppError_1.default(409, 'This email already belongs to a Business Owner account, so it cannot be invited as staff. Please use a different email address for this employee.');
        }
    });
}
exports.RotaEmployeeService = {
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const dto = employee_validation_1.RotaEmployeeValidation.create(payload);
            yield ensureRole(dto.role, dto.business);
            // Pre-generate invite code if requested, so we can store it atomically with create.
            let inviteCode = null;
            let inviteCodeExpiresAt = null;
            if (dto.sendInvite && dto.email) {
                yield ensureEmailInvitable(dto.email);
                inviteCode = generateInviteCode();
                inviteCodeExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
            }
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
                    employeeId: (_e = dto.employeeId) !== null && _e !== void 0 ? _e : null,
                    hourlyWage: (_f = dto.hourlyWage) !== null && _f !== void 0 ? _f : null,
                    joiningDate: (_g = dto.joiningDate) !== null && _g !== void 0 ? _g : null,
                    emergencyContact: (_h = dto.emergencyContact) !== null && _h !== void 0 ? _h : {},
                    isOvertimeAllowed: (_j = dto.isOvertimeAllowed) !== null && _j !== void 0 ? _j : false,
                    maxWeeklyHours: (_k = dto.maxWeeklyHours) !== null && _k !== void 0 ? _k : null,
                    holidayAllowance: (_l = dto.holidayAllowance) !== null && _l !== void 0 ? _l : 28,
                    photoUrl: (_m = dto.photoUrl) !== null && _m !== void 0 ? _m : null,
                    dateOfBirth: (_o = dto.dateOfBirth) !== null && _o !== void 0 ? _o : null,
                    inviteCode,
                    inviteCodeExpiresAt,
                    inviteAcceptedAt: null,
                });
                if (inviteCode && dto.email) {
                    // Fire after save so the record always exists even if SMTP hiccups.
                    try {
                        yield (0, sendEmail_1.default)({
                            email: dto.email,
                            subject: 'You have been invited to DesiTracker Staff Rota',
                            message: `
              <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="margin: 0 0 8px; font-size: 22px; color: #111827;">Welcome to DesiTracker!</h2>
                <p style="color: #374151; line-height: 1.6;">Hello <strong>${dto.firstName}</strong>,</p>
                <p style="color: #374151; line-height: 1.6;">
                  Your employer has invited you to access the DesiTracker Staff app so you can see
                  your shifts and rota schedule. To set up your account:
                </p>
                <ol style="color: #374151; line-height: 1.8;">
                  <li>Open the <strong>DesiTracker</strong> mobile app.</li>
                  <li>On the sign-in screen, tap <strong>"I have an invite code"</strong>.</li>
                  <li>Enter your email (<strong>${dto.email}</strong>) and the code below, then choose a password.</li>
                </ol>
                <div style="text-align: center; margin: 24px 0;">
                  <div style="display: inline-block; background-color: #eef2ff; color: #4338ca;
                              padding: 16px 28px; border-radius: 12px; font-size: 28px;
                              font-weight: 800; letter-spacing: 6px; font-family: monospace;">
                    ${inviteCode}
                  </div>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                  This code expires in ${INVITE_TTL_DAYS} days. If it expires, please ask your employer to resend it.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 36px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                  If you did not expect this email, you can safely ignore it.
                </p>
              </div>
            `,
                        });
                    }
                    catch (mailErr) {
                        console.error('[RotaEmployee] Failed to send invite email:', mailErr);
                    }
                }
                return doc;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 11000)
                    throw new AppError_1.default(409, 'Employee email already exists for this business');
                throw e;
            }
        });
    },
    // Public endpoint: staff submits email + code + password.
    // Creates a User account with role 'staff', links it to the employee record,
    // and returns an access token so the app can log them straight in.
    acceptInvite(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = rota_utils_1.RotaUtils.normalizeEmail(payload === null || payload === void 0 ? void 0 : payload.email);
            const code = String((payload === null || payload === void 0 ? void 0 : payload.code) || '').trim().toUpperCase();
            const password = String((payload === null || payload === void 0 ? void 0 : payload.password) || '');
            const submittedPhone = rota_utils_1.RotaUtils.optionalString(payload === null || payload === void 0 ? void 0 : payload.phone);
            if (!code)
                throw new AppError_1.default(400, 'Invite code is required');
            if (!password || password.length < 8) {
                throw new AppError_1.default(400, 'Password must be at least 8 characters');
            }
            const employee = yield employee_model_1.RotaEmployee.findOne({
                email,
                inviteCode: code,
                isDeleted: false,
            });
            if (!employee) {
                throw new AppError_1.default(400, 'Invalid email or invite code');
            }
            if (employee.inviteAcceptedAt) {
                throw new AppError_1.default(400, 'This invite has already been used. Please sign in instead.');
            }
            if (!employee.inviteCodeExpiresAt || employee.inviteCodeExpiresAt.getTime() < Date.now()) {
                throw new AppError_1.default(400, 'This invite code has expired. Ask your employer to resend it.');
            }
            // A valid, unused, unexpired invite code is treated as proof of identity:
            // - the owner generated it intentionally
            // - it was delivered to this email's inbox
            // So if a User already exists with this email, we update their password to
            // what the staff just typed and link them. If no User exists, create one.
            let existingUser = yield user_model_1.User.findOne({ email });
            // Tombstone cleanup: a soft-deleted User from an old admin delete should
            // not be silently resurrected on staff accept (that's the bug where a
            // deleted business owner came back as an owner). Treat the email as free
            // and remove the stale row so the unique-email index doesn't block the
            // fresh User.create below.
            if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.isDeleted) {
                yield user_model_1.User.findByIdAndDelete(existingUser._id);
                existingUser = null;
            }
            let userDoc;
            if (existingUser) {
                // Refuse to double-bind to a different staff record.
                const otherEmployee = yield employee_model_1.RotaEmployee.findOne({
                    user: existingUser._id,
                    isDeleted: false,
                    _id: { $ne: employee._id },
                });
                if (otherEmployee) {
                    throw new AppError_1.default(409, 'This email is already linked to another staff record. Ask your employer to invite a different email.');
                }
                // Update password via the pre('findOneAndUpdate') hook so it gets hashed.
                // Role policy:
                //   - 'user'           → upgrade to 'staff' (plain customer becoming staff)
                //   - 'business_owner' → keep (they own another business; just link them)
                //   - 'admin'          → keep (admins shouldn't be downgraded)
                //   - 'staff'          → keep
                // Also clear isDeleted / isBlocked: the owner is intentionally re-inviting
                // this person, so a previously soft-deleted account is being reactivated.
                const updates = {
                    password,
                    isDeleted: false,
                    isBlocked: false,
                };
                if (existingUser.role === 'user') {
                    updates.role = 'staff';
                }
                userDoc = yield user_model_1.User.findByIdAndUpdate(existingUser._id, updates, { new: true, runValidators: false });
            }
            else {
                const fullName = `${employee.firstName} ${employee.lastName || ''}`.trim();
                // Phone is required + isMobilePhone-validated on User. Prefer the phone
                // submitted in the accept form, fall back to whatever the owner saved on
                // the employee record. Use a deterministic UK test-range placeholder
                // (always passes isMobilePhone in 'any' locale) only as a last resort
                // so we never reject a legitimate accept just because the owner didn't
                // enter a phone.
                const phone = submittedPhone
                    || (employee.phone && employee.phone.trim())
                    || `+447700${String(Date.now()).slice(-6)}`;
                userDoc = yield user_model_1.User.create({
                    name: fullName || email,
                    email,
                    password,
                    phone,
                    role: 'staff',
                    userStatus: 'verified',
                });
            }
            employee.user = userDoc._id;
            employee.inviteCode = null;
            employee.inviteCodeExpiresAt = null;
            employee.inviteAcceptedAt = new Date();
            employee.status = 'ACTIVE';
            yield employee.save();
            const jwtPayload = {
                id: userDoc._id.toString(),
                role: userDoc.role,
                email: userDoc.email,
            };
            const accessToken = jwt_1.JwtHelpers.createToken(jwtPayload, config_1.default.jwt.accessSecret, config_1.default.jwt.accessExpiresIn);
            return { accessToken, user: userDoc, linkedExistingUser: !!existingUser };
        });
    },
    // Resolve the effective permissions for the currently-signed-in user.
    // - Owners always get isSuperAdmin (full access).
    // - Staff get the permissions of the RotaRole their employee record points at.
    // - Anyone with no employee record gets an all-false permissions object.
    getMyPermissions(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const allFalse = {};
            for (const key of role_interface_1.PERMISSION_KEYS)
                allFalse[key] = false;
            if (userRole === 'business_owner' || userRole === 'admin') {
                const owner = {};
                for (const key of role_interface_1.PERMISSION_KEYS)
                    owner[key] = true;
                // Include the owner's business so the client has a businessId to join the
                // realtime socket room with (owners have no employee record, so this is
                // the only place the client can reliably learn their business here).
                const ownedBusiness = yield business_model_1.Business.findOne({ owner: userId, isDeleted: { $ne: true } })
                    .select('businessName slug logo owner')
                    .lean();
                return {
                    permissions: owner,
                    source: 'owner',
                    employee: null,
                    role: null,
                    business: ownedBusiness || null,
                };
            }
            const employee = yield employee_model_1.RotaEmployee.findOne({ user: userId, isDeleted: false })
                .populate('business', 'businessName slug logo owner');
            if (!employee) {
                return { permissions: allFalse, source: 'none', employee: null, role: null, business: null };
            }
            // employee.role is stored as the role's _id (string). Look it up directly.
            const role = employee.role
                ? yield role_model_1.RotaRole.findOne({ _id: employee.role, isDeleted: false })
                : null;
            // `employee.business` is populated above, so the response carries id + name
            // and the client doesn't need a second round-trip to render the dashboard.
            const business = employee.business || null;
            if (!role) {
                return { permissions: allFalse, source: 'employee-no-role', employee, role: null, business };
            }
            return {
                permissions: role.permissions || allFalse,
                source: 'role',
                employee,
                role,
                business,
            };
        });
    },
    // Owner can regenerate + resend a code (e.g. when the original expired).
    resendInvite(id, business) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield employee_model_1.RotaEmployee.findOne({ _id: id, business, isDeleted: false });
            if (!employee)
                throw new AppError_1.default(404, 'Employee not found');
            if (employee.inviteAcceptedAt) {
                throw new AppError_1.default(400, 'This employee has already accepted their invite');
            }
            if (!employee.email)
                throw new AppError_1.default(400, 'Employee has no email on file');
            yield ensureEmailInvitable(employee.email);
            const inviteCode = generateInviteCode();
            const inviteCodeExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
            employee.inviteCode = inviteCode;
            employee.inviteCodeExpiresAt = inviteCodeExpiresAt;
            yield employee.save();
            try {
                yield (0, sendEmail_1.default)({
                    email: employee.email,
                    subject: 'Your DesiTracker invite code (resent)',
                    message: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="margin: 0 0 8px; font-size: 22px; color: #111827;">Your new invite code</h2>
            <p style="color: #374151; line-height: 1.6;">Hello <strong>${employee.firstName}</strong>,</p>
            <p style="color: #374151; line-height: 1.6;">
              Open the DesiTracker app, tap <strong>"I have an invite code"</strong> on the sign-in screen,
              and use the code below with your email (<strong>${employee.email}</strong>):
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; background-color: #eef2ff; color: #4338ca;
                          padding: 16px 28px; border-radius: 12px; font-size: 28px;
                          font-weight: 800; letter-spacing: 6px; font-family: monospace;">
                ${inviteCode}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 13px;">This code expires in ${INVITE_TTL_DAYS} days.</p>
          </div>
        `,
                });
            }
            catch (mailErr) {
                console.error('[RotaEmployee] Failed to resend invite email:', mailErr);
            }
            return { ok: true };
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
            // Revoke the staff member's login so a removed employee can no longer
            // access the app — UNLESS they still work at another business.
            if (doc.user) {
                const stillActive = yield employee_model_1.RotaEmployee.countDocuments({
                    user: doc.user,
                    isDeleted: false,
                });
                if (stillActive === 0) {
                    yield user_model_1.User.updateMany({ _id: doc.user, role: 'staff' }, { $set: { isDeleted: true } });
                }
            }
            return doc;
        });
    },
};
