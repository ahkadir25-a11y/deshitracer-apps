import { FilterQuery, Types } from 'mongoose';
import crypto from 'crypto';
import config from '../../../config';
import AppError from '../../../errors/AppError';
import { RotaEmployee } from './employee.model';
import { IRotaEmployee } from './employee.interface';
import { RotaEmployeeValidation } from './employee.validation';
import { RotaRole } from '../role/role.model';
import { PERMISSION_KEYS } from '../role/role.interface';
import { RotaUtils } from '../rota.utils';
import type { SortOrder } from 'mongoose';
import sendEmail from '../../../utils/lib/sendEmail';
import { User } from '../../user/user/user.model';
import { Business } from '../../business/business.model';
import { JwtHelpers, TJwtPayload } from '../../../utils/jwt';

async function ensureRole(roleId: string, business: string) {
  const role = await RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
  if (!role) throw new AppError(400, 'Invalid role for this business');
  return role;
}

// 8-char uppercase alphanumeric code (no ambiguous chars like 0/O/1/I)
function generateInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const INVITE_TTL_DAYS = 7;

// One email = one role. A Business Owner (or admin) email must never receive
// a staff invite — owners noticed getting invited to their own email. Members
// ('user') may still be invited; accepting upgrades them to staff.
async function ensureEmailInvitable(email?: string | null) {
  if (!email) return;
  const existing = await User.findOne({ email: RotaUtils.normalizeEmail(email) });
  if (existing && !existing.isDeleted && (existing.role === 'business_owner' || existing.role === 'admin')) {
    throw new AppError(
      409,
      'This email already belongs to a Business Owner account, so it cannot be invited as staff. Please use a different email address for this employee.',
    );
  }
}

export const RotaEmployeeService = {
  async create(payload: any) {
    const dto = RotaEmployeeValidation.create(payload);

    await ensureRole(dto.role, dto.business);

    // Pre-generate invite code if requested, so we can store it atomically with create.
    let inviteCode: string | null = null;
    let inviteCodeExpiresAt: Date | null = null;
    if (dto.sendInvite && dto.email) {
      await ensureEmailInvitable(dto.email);
      inviteCode = generateInviteCode();
      inviteCodeExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
    }

    try {
      const doc = await RotaEmployee.create({
        business: dto.business,
        firstName: dto.firstName,
        lastName: dto.lastName ?? '',
        email: dto.email,
        phone: dto.phone,
        address: dto.address ?? {},
        role: dto.role,
        status: dto.status ?? 'ACTIVE',
        user: dto.user,
        notes: dto.notes ?? '',
        isDeleted: false,
        employeeId:         dto.employeeId         ?? null,
        hourlyWage:         dto.hourlyWage         ?? null,
        joiningDate:        dto.joiningDate        ?? null,
        emergencyContact:   dto.emergencyContact   ?? {},
        isOvertimeAllowed:  dto.isOvertimeAllowed  ?? false,
        maxWeeklyHours:     (dto as any).maxWeeklyHours     ?? null,
        holidayAllowance:   dto.holidayAllowance   ?? 28,
        photoUrl:           dto.photoUrl           ?? null,
        dateOfBirth:        (dto as any).dateOfBirth        ?? null,
        inviteCode,
        inviteCodeExpiresAt,
        inviteAcceptedAt: null,
      });

      if (inviteCode && dto.email) {
        // Fire after save so the record always exists even if SMTP hiccups.
        try {
          await sendEmail({
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
        } catch (mailErr) {
          console.error('[RotaEmployee] Failed to send invite email:', mailErr);
        }
      }

      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Employee email already exists for this business');
      throw e;
    }
  },

  // Public endpoint: staff submits email + code + password.
  // Creates a User account with role 'staff', links it to the employee record,
  // and returns an access token so the app can log them straight in.
  async acceptInvite(payload: any) {
    const email = RotaUtils.normalizeEmail(payload?.email);
    const code = String(payload?.code || '').trim().toUpperCase();
    const password = String(payload?.password || '');
    const submittedPhone = RotaUtils.optionalString(payload?.phone);

    if (!code) throw new AppError(400, 'Invite code is required');
    if (!password || password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters');
    }

    const employee = await RotaEmployee.findOne({
      email,
      inviteCode: code,
      isDeleted: false,
    });

    if (!employee) {
      throw new AppError(400, 'Invalid email or invite code');
    }
    if (employee.inviteAcceptedAt) {
      throw new AppError(400, 'This invite has already been used. Please sign in instead.');
    }
    if (!employee.inviteCodeExpiresAt || employee.inviteCodeExpiresAt.getTime() < Date.now()) {
      throw new AppError(400, 'This invite code has expired. Ask your employer to resend it.');
    }

    // A valid, unused, unexpired invite code is treated as proof of identity:
    // - the owner generated it intentionally
    // - it was delivered to this email's inbox
    // So if a User already exists with this email, we update their password to
    // what the staff just typed and link them. If no User exists, create one.
    let existingUser = await User.findOne({ email });

    // Tombstone cleanup: a soft-deleted User from an old admin delete should
    // not be silently resurrected on staff accept (that's the bug where a
    // deleted business owner came back as an owner). Treat the email as free
    // and remove the stale row so the unique-email index doesn't block the
    // fresh User.create below.
    if (existingUser?.isDeleted) {
      await User.findByIdAndDelete(existingUser._id);
      existingUser = null;
    }

    let userDoc: any;

    if (existingUser) {
      // Refuse to double-bind to a different staff record.
      const otherEmployee = await RotaEmployee.findOne({
        user: existingUser._id,
        isDeleted: false,
        _id: { $ne: employee._id },
      });
      if (otherEmployee) {
        throw new AppError(
          409,
          'This email is already linked to another staff record. Ask your employer to invite a different email.',
        );
      }

      // Update password via the pre('findOneAndUpdate') hook so it gets hashed.
      // Role policy:
      //   - 'user'           → upgrade to 'staff' (plain customer becoming staff)
      //   - 'business_owner' → keep (they own another business; just link them)
      //   - 'admin'          → keep (admins shouldn't be downgraded)
      //   - 'staff'          → keep
      // Also clear isDeleted / isBlocked: the owner is intentionally re-inviting
      // this person, so a previously soft-deleted account is being reactivated.
      const updates: Record<string, unknown> = {
        password,
        isDeleted: false,
        isBlocked: false,
      };
      if (existingUser.role === 'user') {
        updates.role = 'staff';
      }

      userDoc = await User.findByIdAndUpdate(
        existingUser._id,
        updates,
        { new: true, runValidators: false },
      );
    } else {
      const fullName = `${employee.firstName} ${employee.lastName || ''}`.trim();
      // Phone is required + isMobilePhone-validated on User. Prefer the phone
      // submitted in the accept form, fall back to whatever the owner saved on
      // the employee record. Use a deterministic UK test-range placeholder
      // (always passes isMobilePhone in 'any' locale) only as a last resort
      // so we never reject a legitimate accept just because the owner didn't
      // enter a phone.
      const phone =
        submittedPhone
        || (employee.phone && employee.phone.trim())
        || `+447700${String(Date.now()).slice(-6)}`;

      userDoc = await User.create({
        name: fullName || email,
        email,
        password,
        phone,
        role: 'staff',
        userStatus: 'verified',
      });
    }

    employee.user = userDoc._id as Types.ObjectId;
    employee.inviteCode = null;
    employee.inviteCodeExpiresAt = null;
    employee.inviteAcceptedAt = new Date();
    employee.status = 'ACTIVE';
    await employee.save();

    const jwtPayload: TJwtPayload = {
      id: userDoc._id.toString(),
      role: userDoc.role,
      email: userDoc.email,
    };
    const accessToken = JwtHelpers.createToken(
      jwtPayload,
      config.jwt.accessSecret as string,
      config.jwt.accessExpiresIn,
    );

    return { accessToken, user: userDoc, linkedExistingUser: !!existingUser };
  },

  // Resolve the effective permissions for the currently-signed-in user.
  // - Owners always get isSuperAdmin (full access).
  // - Staff get the permissions of the RotaRole their employee record points at.
  // - Anyone with no employee record gets an all-false permissions object.
  async getMyPermissions(userId: string, userRole: string) {
    const allFalse: any = {};
    for (const key of PERMISSION_KEYS) allFalse[key] = false;

    if (userRole === 'business_owner' || userRole === 'admin') {
      const owner: any = {};
      for (const key of PERMISSION_KEYS) owner[key] = true;
      // Include the owner's business so the client has a businessId to join the
      // realtime socket room with (owners have no employee record, so this is
      // the only place the client can reliably learn their business here).
      const ownedBusiness = await Business.findOne({ owner: userId, isDeleted: { $ne: true } })
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

    const employee = await RotaEmployee.findOne({ user: userId, isDeleted: false })
      .populate('business', 'businessName slug logo owner');
    if (!employee) {
      return { permissions: allFalse, source: 'none', employee: null, role: null, business: null };
    }

    // employee.role is stored as the role's _id (string). Look it up directly.
    const role = employee.role
      ? await RotaRole.findOne({ _id: employee.role as any, isDeleted: false })
      : null;

    // `employee.business` is populated above, so the response carries id + name
    // and the client doesn't need a second round-trip to render the dashboard.
    const business = (employee.business as any) || null;

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
  },

  // Owner can regenerate + resend a code (e.g. when the original expired).
  async resendInvite(id: string, business: string) {
    const employee = await RotaEmployee.findOne({ _id: id, business, isDeleted: false });
    if (!employee) throw new AppError(404, 'Employee not found');
    if (employee.inviteAcceptedAt) {
      throw new AppError(400, 'This employee has already accepted their invite');
    }
    if (!employee.email) throw new AppError(400, 'Employee has no email on file');

    await ensureEmailInvitable(employee.email);

    const inviteCode = generateInviteCode();
    const inviteCodeExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
    employee.inviteCode = inviteCode;
    employee.inviteCodeExpiresAt = inviteCodeExpiresAt;
    await employee.save();

    try {
      await sendEmail({
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
    } catch (mailErr) {
      console.error('[RotaEmployee] Failed to resend invite email:', mailErr);
    }

    return { ok: true };
  },

  async getAll(query: any) {
    const business = RotaEmployeeValidation.businessFromQuery(query);
    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 20, maxLimit: 200 });
    const { sortBy: sortByRaw, sortOrder: sortOrderRaw } = RotaUtils.sort(query, 'createdAt');
    const sortBy = String(sortByRaw);          // force string key
    const sortOrder = sortOrderRaw as SortOrder;
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };

    const filter: FilterQuery<IRotaEmployee> = { business, isDeleted: false };

    if (query?.status === 'ACTIVE' || query?.status === 'INACTIVE') filter.status = query.status;

    const role = RotaUtils.optionalObjectId(query?.role);
    if (role) filter.role = new Types.ObjectId(role);

    const searchTerm = RotaUtils.optionalString(query?.searchTerm);
    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      RotaEmployee.find(filter).populate('role').sort(sort).skip(skip).limit(limit),
      RotaEmployee.countDocuments(filter),
    ]);

    return { meta: { page, limit, total }, data };
  },

  async getById(id: string, business: string) {
    const doc = await RotaEmployee.findOne({ _id: id, business, isDeleted: false }).populate('role');
    if (!doc) throw new AppError(404, 'Employee not found');
    return doc;
  },

  async update(id: string, business: string, payload: any) {
    const dto = RotaEmployeeValidation.update(payload);

    if (dto.role) await ensureRole(dto.role, business);

    try {
      const doc = await RotaEmployee.findOneAndUpdate(
        { _id: id, business, isDeleted: false },
        dto,
        { new: true, runValidators: true }
      ).populate('role');

      if (!doc) throw new AppError(404, 'Employee not found');
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Employee email already exists for this business');
      throw e;
    }
  },

  // Soft delete
  async remove(id: string, business: string) {
    const doc = await RotaEmployee.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true, status: 'INACTIVE' },
      { new: true }
    );
    if (!doc) throw new AppError(404, 'Employee not found');

    // Revoke the staff member's login so a removed employee can no longer
    // access the app — UNLESS they still work at another business.
    if (doc.user) {
      const stillActive = await RotaEmployee.countDocuments({
        user: doc.user,
        isDeleted: false,
      });
      if (stillActive === 0) {
        await User.updateMany(
          { _id: doc.user, role: 'staff' },
          { $set: { isDeleted: true } },
        );
      }
    }

    return doc;
  },
};
