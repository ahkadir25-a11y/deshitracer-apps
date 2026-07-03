import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';

export type CreateEmployeeDTO = {
  business: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: any;
  role: string;
  status?: 'ACTIVE' | 'INACTIVE';
  user?: string;
  notes?: string;

  // ─── NEW FIELDS: Advanced HR Profile ─────────────────────────────────────
  // Optional custom staff ID (e.g. "EMP-001") assigned by the owner
  employeeId?: string;

  // Hourly wage used for payroll cost estimation
  hourlyWage?: number;

  // Date the employee officially started work
  joiningDate?: Date;

  // Emergency contact object for HR/safety records
  emergencyContact?: { name?: string; phone?: string; relation?: string };

  // Annual paid-holiday allowance in days. Defaults to 28 in the model.
  holidayAllowance?: number;

  // Profile photo URL (uploaded via the existing upload API).
  photoUrl?: string | null;

  // Optional date of birth — used by the owner's birthday reminders.
  dateOfBirth?: Date | null;

  // If true, the backend will automatically email an invite to the employee
  sendInvite?: boolean;
  
  // Whether this employee is allowed to start overtime
  isOvertimeAllowed?: boolean;

  // Max hours per week. null = no limit.
  maxWeeklyHours?: number | null;
  // ────────────────────────────────────────────────────────────────────────
};

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;

export const RotaEmployeeValidation = {
  create(payload: any): CreateEmployeeDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const firstName = RotaUtils.requireString(payload?.firstName, 'firstName');
    const lastName = RotaUtils.optionalString(payload?.lastName);
    const email = RotaUtils.normalizeEmail(payload?.email);
    const phone = RotaUtils.optionalString(payload?.phone);

    const role = RotaUtils.requireObjectId(payload?.role, 'role');
    const status = payload?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const user = RotaUtils.optionalObjectId(payload?.user);
    const notes = RotaUtils.optionalString(payload?.notes);

    // ─── NEW: Parse advanced HR profile fields ────────────────────────────────────
    const employeeId = RotaUtils.optionalString(payload?.employeeId);
    const hourlyWage = payload?.hourlyWage !== undefined ? Number(payload.hourlyWage) : undefined;
    const joiningDate = payload?.joiningDate ? new Date(payload.joiningDate) : undefined;
    const emergencyContact = payload?.emergencyContact ?? undefined;
    const holidayAllowance = payload?.holidayAllowance !== undefined ? Number(payload.holidayAllowance) : undefined;
    if (holidayAllowance !== undefined && (Number.isNaN(holidayAllowance) || holidayAllowance < 0)) {
      throw new AppError(400, 'holidayAllowance must be a non-negative number');
    }
    const photoUrl = RotaUtils.optionalString(payload?.photoUrl);
    const dateOfBirth = payload?.dateOfBirth ? new Date(payload.dateOfBirth) : undefined;
    if (dateOfBirth !== undefined && Number.isNaN(dateOfBirth.getTime())) {
      throw new AppError(400, 'dateOfBirth is invalid');
    }

    // If true, the service layer will send a welcome email to this employee
    const sendInvite = RotaUtils.parseBoolean(payload?.sendInvite);

    const isOvertimeAllowed = RotaUtils.parseBoolean(payload?.isOvertimeAllowed) ?? false;

    let maxWeeklyHours: number | null | undefined = undefined;
    if (payload?.maxWeeklyHours !== undefined) {
      if (payload.maxWeeklyHours === null || payload.maxWeeklyHours === '') {
        maxWeeklyHours = null;
      } else {
        const mwh = Number(payload.maxWeeklyHours);
        if (Number.isNaN(mwh) || mwh < 0) throw new AppError(400, 'maxWeeklyHours must be a non-negative number or null');
        maxWeeklyHours = mwh;
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    const address = payload?.address ?? {};

    if (firstName.length > 80) throw new AppError(400, 'firstName is too long');
    if (lastName && lastName.length > 80) throw new AppError(400, 'lastName is too long');

    return {
      business, firstName, lastName, email, phone, address, role, status, user, notes,
      // ─── NEW fields passed through to the service layer ───
      employeeId, hourlyWage, joiningDate, emergencyContact, holidayAllowance,
      photoUrl, dateOfBirth, sendInvite, isOvertimeAllowed, maxWeeklyHours,
    } as any;
  },

  update(payload: any): UpdateEmployeeDTO {
    const dto: UpdateEmployeeDTO = {};

    if (payload?.firstName !== undefined) dto.firstName = RotaUtils.requireString(payload.firstName, 'firstName');
    if (payload?.lastName !== undefined) dto.lastName = RotaUtils.optionalString(payload.lastName) ?? '';
    if (payload?.email !== undefined) dto.email = RotaUtils.normalizeEmail(payload.email);
    if (payload?.phone !== undefined) dto.phone = RotaUtils.optionalString(payload.phone) ?? '';
    if (payload?.address !== undefined) dto.address = payload.address ?? {};

    if (payload?.role !== undefined) dto.role = RotaUtils.requireObjectId(payload.role, 'role');

    if (payload?.status !== undefined) {
      if (payload.status !== 'ACTIVE' && payload.status !== 'INACTIVE') {
        throw new AppError(400, 'status must be ACTIVE or INACTIVE');
      }
      dto.status = payload.status;
    }

    if (payload?.user !== undefined) dto.user = RotaUtils.optionalObjectId(payload.user);
    if (payload?.notes !== undefined) dto.notes = RotaUtils.optionalString(payload.notes) ?? '';

    // ─── NEW: Parse advanced HR profile fields during update ─────────────────────
    if (payload?.employeeId !== undefined) dto.employeeId = RotaUtils.optionalString(payload.employeeId);
    if (payload?.hourlyWage !== undefined) dto.hourlyWage = payload.hourlyWage !== null ? Number(payload.hourlyWage) : undefined;
    if (payload?.joiningDate !== undefined) dto.joiningDate = payload.joiningDate ? new Date(payload.joiningDate) : undefined;
    if (payload?.emergencyContact !== undefined) dto.emergencyContact = payload.emergencyContact ?? {};
    if (payload?.holidayAllowance !== undefined) {
      const ha = Number(payload.holidayAllowance);
      if (Number.isNaN(ha) || ha < 0) throw new AppError(400, 'holidayAllowance must be a non-negative number');
      dto.holidayAllowance = ha;
    }
    if (payload?.photoUrl !== undefined) {
      (dto as any).photoUrl = RotaUtils.optionalString(payload.photoUrl) ?? null;
    }
    if (payload?.dateOfBirth !== undefined) {
      if (payload.dateOfBirth === null || payload.dateOfBirth === '') {
        (dto as any).dateOfBirth = null;
      } else {
        const dob = new Date(payload.dateOfBirth);
        if (Number.isNaN(dob.getTime())) throw new AppError(400, 'dateOfBirth is invalid');
        (dto as any).dateOfBirth = dob;
      }
    }
    if (payload?.isOvertimeAllowed !== undefined) {
      dto.isOvertimeAllowed = RotaUtils.parseBoolean(payload.isOvertimeAllowed);
    }
    if (payload?.maxWeeklyHours !== undefined) {
      if (payload.maxWeeklyHours === null || payload.maxWeeklyHours === '') {
        (dto as any).maxWeeklyHours = null;
      } else {
        const mwh = Number(payload.maxWeeklyHours);
        if (Number.isNaN(mwh) || mwh < 0) throw new AppError(400, 'maxWeeklyHours must be a non-negative number or null');
        (dto as any).maxWeeklyHours = mwh;
      }
    }
    // ─────────────────────────────────────────────────────────────────────────────

    return dto;
  },

  businessFromQuery(query: any) {
    return RotaUtils.requireObjectId(query?.business, 'business');
  },
};
