import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';

export type ClockInDTO = {
  business: string;
  shift?: string | null;
  notes?: string;
};

export type ClockOutDTO = {
  business: string;
  notes?: string;
  breakMinutes?: number;
  // Optional reason if staff clocked out before scheduled shift end.
  undertimeReason?: string;
};

export type OwnerCreateTimesheetDTO = {
  business: string;
  employee: string;
  shift?: string | null;
  clockIn: Date;
  clockOut?: Date | null;
  breakMinutes?: number;
  notes?: string;
};

export type UpdateTimesheetDTO = {
  clockIn?: Date;
  clockOut?: Date | null;
  breakMinutes?: number;
  notes?: string;
  editReason?: string;
};

export type StartOvertimeDTO = {
  business: string;
};

export type StopOvertimeDTO = {
  business: string;
};

export type DecideOvertimeDTO = {
  decision: 'APPROVE' | 'REJECT';
  decisionNote?: string;
};

export type SubmitUndertimeDTO = {
  business: string;
  reason: string;
};

export type DecideUndertimeDTO = {
  decision: 'EXCUSE' | 'MUST_MAKEUP' | 'MADE_UP';
  decisionNote?: string;
};

export const RotaTimesheetValidation = {
  clockIn(payload: any): ClockInDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const shift =
      payload?.shift === undefined || payload?.shift === null
        ? null
        : (RotaUtils.optionalObjectId(payload.shift) ?? null);
    const notes = RotaUtils.optionalString(payload?.notes);
    return { business, shift, notes };
  },

  clockOut(payload: any): ClockOutDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const notes = RotaUtils.optionalString(payload?.notes);
    const undertimeReason = RotaUtils.optionalString(payload?.undertimeReason);

    let breakMinutes: number | undefined;
    if (payload?.breakMinutes !== undefined) {
      const bm = Number(payload.breakMinutes);
      if (Number.isNaN(bm) || bm < 0) throw new AppError(400, 'breakMinutes is invalid');
      breakMinutes = bm;
    }
    return { business, notes, breakMinutes, undertimeReason };
  },

  ownerCreate(payload: any): OwnerCreateTimesheetDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const employee = RotaUtils.requireObjectId(payload?.employee, 'employee');
    const shift =
      payload?.shift === undefined || payload?.shift === null
        ? null
        : (RotaUtils.optionalObjectId(payload.shift) ?? null);

    const clockIn = RotaUtils.parseDate(payload?.clockIn, 'clockIn');
    const clockOut =
      payload?.clockOut === undefined || payload?.clockOut === null
        ? null
        : RotaUtils.parseDate(payload.clockOut, 'clockOut');

    if (clockOut && clockOut <= clockIn) {
      throw new AppError(400, 'clockOut must be after clockIn');
    }

    let breakMinutes: number | undefined;
    if (payload?.breakMinutes !== undefined) {
      const bm = Number(payload.breakMinutes);
      if (Number.isNaN(bm) || bm < 0) throw new AppError(400, 'breakMinutes is invalid');
      breakMinutes = bm;
    }

    const notes = RotaUtils.optionalString(payload?.notes);

    return { business, employee, shift, clockIn, clockOut, breakMinutes, notes };
  },

  update(payload: any): UpdateTimesheetDTO {
    const dto: UpdateTimesheetDTO = {};

    if (payload?.clockIn !== undefined) dto.clockIn = RotaUtils.parseDate(payload.clockIn, 'clockIn');

    if (payload?.clockOut !== undefined) {
      dto.clockOut = payload.clockOut === null ? null : RotaUtils.parseDate(payload.clockOut, 'clockOut');
    }

    if (dto.clockIn && dto.clockOut && dto.clockOut <= dto.clockIn) {
      throw new AppError(400, 'clockOut must be after clockIn');
    }

    if (payload?.breakMinutes !== undefined) {
      const bm = Number(payload.breakMinutes);
      if (Number.isNaN(bm) || bm < 0) throw new AppError(400, 'breakMinutes is invalid');
      dto.breakMinutes = bm;
    }

    if (payload?.notes !== undefined) dto.notes = RotaUtils.optionalString(payload.notes) ?? '';
    if (payload?.editReason !== undefined) dto.editReason = RotaUtils.optionalString(payload.editReason) ?? '';

    return dto;
  },

  startOvertime(payload: any): StartOvertimeDTO {
    return { business: RotaUtils.requireObjectId(payload?.business, 'business') };
  },

  stopOvertime(payload: any): StopOvertimeDTO {
    return { business: RotaUtils.requireObjectId(payload?.business, 'business') };
  },

  decideOvertime(payload: any): DecideOvertimeDTO {
    const decisionRaw = String(payload?.decision || '').toUpperCase();
    if (decisionRaw !== 'APPROVE' && decisionRaw !== 'REJECT') {
      throw new AppError(400, 'decision must be APPROVE or REJECT');
    }
    return {
      decision: decisionRaw as 'APPROVE' | 'REJECT',
      decisionNote: RotaUtils.optionalString(payload?.decisionNote),
    };
  },

  submitUndertime(payload: any): SubmitUndertimeDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const reason = RotaUtils.requireString(payload?.reason, 'reason');
    if (reason.length < 3) throw new AppError(400, 'reason must be at least 3 characters');
    return { business, reason };
  },

  decideUndertime(payload: any): DecideUndertimeDTO {
    const decisionRaw = String(payload?.decision || '').toUpperCase();
    if (decisionRaw !== 'EXCUSE' && decisionRaw !== 'MUST_MAKEUP' && decisionRaw !== 'MADE_UP') {
      throw new AppError(400, 'decision must be EXCUSE, MUST_MAKEUP, or MADE_UP');
    }
    return {
      decision: decisionRaw as 'EXCUSE' | 'MUST_MAKEUP' | 'MADE_UP',
      decisionNote: RotaUtils.optionalString(payload?.decisionNote),
    };
  },
};
