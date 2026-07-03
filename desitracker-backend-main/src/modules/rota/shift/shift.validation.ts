import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';

export type CreateShiftDTO = {
  business: string;
  employee?: string | null;
  role: string;
  startAt: Date;
  endAt: Date;
  breakMinutes?: number;
  location?: string;
  notes?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  ownerMandatedOvertime?: boolean;
};

export type UpdateShiftDTO = Partial<Omit<CreateShiftDTO, 'business'>>;

export const RotaShiftValidation = {
  create(payload: any): CreateShiftDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const role = RotaUtils.requireObjectId(payload?.role, 'role');

    const employee = payload?.employee === null ? null : RotaUtils.optionalObjectId(payload?.employee);

    const startAt = RotaUtils.parseDate(payload?.startAt, 'startAt');
    const endAt = RotaUtils.parseDate(payload?.endAt, 'endAt');

    if (endAt <= startAt) throw new AppError(400, 'endAt must be after startAt');

    const breakMinutes = payload?.breakMinutes !== undefined ? Number(payload.breakMinutes) : 0;
    if (Number.isNaN(breakMinutes) || breakMinutes < 0) throw new AppError(400, 'breakMinutes is invalid');

    const durationMinutes = Math.floor((endAt.getTime() - startAt.getTime()) / 60000);
    if (breakMinutes > durationMinutes) throw new AppError(400, 'breakMinutes cannot exceed shift duration');

    const location = RotaUtils.optionalString(payload?.location);
    const notes = RotaUtils.optionalString(payload?.notes);

    const status =
      payload?.status === 'PUBLISHED' || payload?.status === 'CANCELLED' ? payload.status : 'DRAFT';

    return { business, employee, role, startAt, endAt, breakMinutes, location, notes, status };
  },

  update(payload: any): UpdateShiftDTO {
    const dto: UpdateShiftDTO = {};

    if (payload?.employee !== undefined) {
      dto.employee = payload.employee === null ? null : (RotaUtils.optionalObjectId(payload.employee) ?? null);
    }

    if (payload?.role !== undefined) dto.role = RotaUtils.requireObjectId(payload.role, 'role');

    if (payload?.startAt !== undefined) dto.startAt = RotaUtils.parseDate(payload.startAt, 'startAt');
    if (payload?.endAt !== undefined) dto.endAt = RotaUtils.parseDate(payload.endAt, 'endAt');

    if (payload?.breakMinutes !== undefined) {
      const bm = Number(payload.breakMinutes);
      if (Number.isNaN(bm) || bm < 0) throw new AppError(400, 'breakMinutes is invalid');
      dto.breakMinutes = bm;
    }

    if (payload?.location !== undefined) dto.location = RotaUtils.optionalString(payload.location) ?? '';
    if (payload?.notes !== undefined) dto.notes = RotaUtils.optionalString(payload.notes) ?? '';

    if (payload?.status !== undefined) {
      if (payload.status !== 'DRAFT' && payload.status !== 'PUBLISHED' && payload.status !== 'CANCELLED') {
        throw new AppError(400, 'status must be DRAFT, PUBLISHED or CANCELLED');
      }
      dto.status = payload.status;
    }

    if (payload?.ownerMandatedOvertime !== undefined) {
      dto.ownerMandatedOvertime = RotaUtils.parseBoolean(payload.ownerMandatedOvertime);
    }

    return dto;
  },

  businessFromQuery(query: any) {
    return RotaUtils.requireObjectId(query?.business, 'business');
  },
};
