import { FilterQuery, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { RotaTimesheet } from './timesheet.model';
import { IRotaTimesheet } from './timesheet.interface';
import { RotaEmployee } from '../employee/employee.model';
import { RotaShift } from '../shift/shift.model';
import { RotaTimesheetValidation } from './timesheet.validation';
import { RotaUtils } from '../rota.utils';

// Helpers ─────────────────────────────────────────────────────────────────────

async function findMyEmployee(userId: string, business: string) {
  const emp = await RotaEmployee.findOne({
    user: userId,
    business,
    isDeleted: false,
    status: 'ACTIVE',
  });
  if (!emp) {
    throw new AppError(
      403,
      'No active employee record for this business. Ask your employer to invite you or activate your account.',
    );
  }
  return emp;
}

// Find the shift this employee is supposed to be on RIGHT NOW.
// Clock-in is only allowed at or after the exact shift start time.
async function findCurrentOrUpcomingShift(employeeId: any, business: string) {
  const now = new Date();
  const graceStart = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12h back

  return RotaShift.findOne({
    employee: employeeId,
    business,
    isDeleted: false,
    startAt: { $lte: now },
    endAt:   { $gte: graceStart },
  }).sort({ startAt: 1 });
}

// Compute minutes worked, minutes of overtime, and minutes still open for an
// entry. Overtime here = APPROVED staff-initiated OT block (the new flow).
// Implicit OT (clock-out past shift end without explicit OT) is reported as
// `impliedOvertimeMinutes` so the owner can decide to fold it in.
// Sum minutes of all COMPLETED breaks (endAt set). Open break (still
// happening) is not counted — it is shown live in the UI but only locked in
// when the staff ends the break or clocks out.
function sumCompletedBreakMinutes(entry: any): number {
  const list = Array.isArray(entry?.breaks) ? entry.breaks : [];
  let total = 0;
  for (const b of list) {
    if (!b?.startAt || !b?.endAt) continue;
    const ms = new Date(b.endAt).getTime() - new Date(b.startAt).getTime();
    if (ms > 0) total += Math.floor(ms / 60000);
  }
  return total;
}

function entryStats(entry: any) {
  const rawStart = new Date(entry.clockIn).getTime();
  const rawEnd = entry.clockOut ? new Date(entry.clockOut).getTime() : Date.now();

  // Paid time is strictly the scheduled shift window — never the actual
  // clock in/out. Clamp the start UP to shift start (early clock-in is unpaid)
  // and the end DOWN to shift end (staying late is unpaid). e.g. a 9–5 shift
  // pays exactly 9–5 no matter when the staff actually tapped in or out.
  const shiftStart = (entry.shift as any)?.startAt
    ? new Date((entry.shift as any).startAt).getTime()
    : null;
  const shiftEnd = (entry.shift as any)?.endAt
    ? new Date((entry.shift as any).endAt).getTime()
    : null;
  const start = shiftStart ? Math.max(rawStart, shiftStart) : rawStart;
  const end = shiftEnd ? Math.min(rawEnd, shiftEnd) : rawEnd;

  // Total break = static field + sum of completed break log entries.
  const breakMin = Math.max(0, Number(entry.breakMinutes) || 0)
    + sumCompletedBreakMinutes(entry);

  const grossMinutes = Math.max(0, Math.floor((end - start) / 60000));
  const workedMinutes = Math.max(0, grossMinutes - breakMin);

  // Approved overtime block (staff-initiated, owner-approved).
  let overtimeMinutes = 0;
  if (entry.overtime && entry.overtime.status === 'APPROVED' && entry.overtime.endAt) {
    const otStart = new Date(entry.overtime.startAt).getTime();
    const otEnd   = new Date(entry.overtime.endAt).getTime();
    overtimeMinutes = Math.max(0, Math.floor((otEnd - otStart) / 60000));
  }

  // Excused undertime still counts as paid time.
  let excusedUndertimeMinutes = 0;
  if (entry.undertime && entry.undertime.status === 'EXCUSED') {
    excusedUndertimeMinutes = Math.max(0, Number(entry.undertime.minutes) || 0);
  }

  return {
    grossMinutes,
    workedMinutes,
    overtimeMinutes,
    impliedOvertimeMinutes: 0,
    excusedUndertimeMinutes,
    payableMinutes: workedMinutes + overtimeMinutes + excusedUndertimeMinutes,
    isOpen: !entry.clockOut,
  };
}

// Service ─────────────────────────────────────────────────────────────────────

export const RotaTimesheetService = {
  // STAFF — Clock in. Auto-attaches the current/upcoming shift if any.
  async clockIn(userId: string, payload: any) {
    const dto = RotaTimesheetValidation.clockIn(payload);
    const employee = await findMyEmployee(userId, dto.business);

    // Resolve the shift this clock-in is for. Prefer the explicit shift in
    // payload, fall back to whichever shift is happening (or about to happen)
    // for this employee right now.
    let shiftDoc: any = null;
    if (dto.shift) {
      shiftDoc = await RotaShift.findOne({
        _id: dto.shift,
        business: dto.business,
        employee: employee._id,
        isDeleted: false,
      });
      if (!shiftDoc) throw new AppError(400, 'Shift not found or not assigned to you');
    } else {
      shiftDoc = await findCurrentOrUpcomingShift(employee._id, dto.business);
    }

    // Block early clock-in — staff cannot clock in more than 15 mins before exact shift start.
    let effectiveClockIn = new Date();
    if (shiftDoc) {
      const now = Date.now();
      const startAt = new Date(shiftDoc.startAt).getTime();
      const allowedEarlyMs = 15 * 60 * 1000;

      if (now < startAt - allowedEarlyMs) {
        const minsAway = Math.ceil((startAt - now) / 60000);
        throw new AppError(
          400,
          `Too early to clock in. Your shift starts in ${minsAway} min.`,
        );
      }
      
      // If clocking in early (within the 15m window), clamp the counted time to the official shift start.
      if (now < startAt) {
        effectiveClockIn = new Date(startAt);
      }
    }

    const open = await RotaTimesheet.findOne({
      business: dto.business,
      employee: employee._id,
      clockOut: null,
      isDeleted: false,
    });
    if (open) {
      throw new AppError(409, 'You are already clocked in. Clock out before starting a new entry.');
    }

    const doc = await RotaTimesheet.create({
      business: dto.business,
      employee: employee._id,
      shift: shiftDoc?._id ?? null,
      clockIn: effectiveClockIn,
      clockOut: null,
      notes: dto.notes ?? '',
      source: 'STAFF',
    });

    return doc.populate(['employee', 'shift']);
  },

  // STAFF — Clock out the current open entry. Auto-detects undertime.
  async clockOut(userId: string, payload: any) {
    const dto = RotaTimesheetValidation.clockOut(payload);
    const employee = await findMyEmployee(userId, dto.business);

    const open = await RotaTimesheet.findOne({
      business: dto.business,
      employee: employee._id,
      clockOut: null,
      isDeleted: false,
    }).populate('shift');
    if (!open) throw new AppError(409, 'You are not currently clocked in.');

    const now = new Date();
    // Auto-close any break that the staff forgot to end. Otherwise the open
    // break would silently mean "still on break forever" and worked minutes
    // would never include the post-break period.
    if (Array.isArray(open.breaks) && open.breaks.length) {
      const last = open.breaks[open.breaks.length - 1];
      if (last && !last.endAt) last.endAt = now;
    }
    open.clockOut = now;
    if (dto.notes) open.notes = dto.notes;
    if (dto.breakMinutes !== undefined) open.breakMinutes = dto.breakMinutes;

    // Auto-detect undertime: clocked out before the scheduled shift end.
    const shiftEnd = (open.shift as any)?.endAt
      ? new Date((open.shift as any).endAt)
      : null;
    if (shiftEnd && now < shiftEnd) {
      const minutesShort = Math.ceil((shiftEnd.getTime() - now.getTime()) / 60000);
      if (minutesShort > 0) {
        open.undertime = {
          minutes: minutesShort,
          reason: dto.undertimeReason ?? '',
          status: dto.undertimeReason ? 'PENDING_EXCUSE' : 'MUST_MAKEUP',
          decidedBy: null,
          decidedAt: null,
          decisionNote: '',
        } as any;
      }
    }

    await open.save();
    return open.populate(['employee', 'shift']);
  },

  // STAFF — Start a break while clocked in. Pauses the worked timer.
  // Rejects if the staff is not clocked in or already on a break.
  async startBreak(userId: string, payload: any) {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const employee = await findMyEmployee(userId, business);

    const open = await RotaTimesheet.findOne({
      business,
      employee: employee._id,
      clockOut: null,
      isDeleted: false,
    });
    if (!open) throw new AppError(409, 'You are not currently clocked in.');

    const breaks: any[] = Array.isArray(open.breaks) ? open.breaks : [];
    const last = breaks[breaks.length - 1];
    if (last && !last.endAt) {
      throw new AppError(409, 'You are already on a break.');
    }

    breaks.push({
      startAt: new Date(),
      endAt: null,
      reason: typeof payload?.reason === 'string' ? payload.reason : '',
    });
    open.breaks = breaks as any;
    await open.save();
    return open.populate(['employee', 'shift']);
  },

  // STAFF — End the current break. No-op-friendly: errors if there is no
  // open break, so the UI knows to refresh state.
  async endBreak(userId: string, payload: any) {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const employee = await findMyEmployee(userId, business);

    const open = await RotaTimesheet.findOne({
      business,
      employee: employee._id,
      clockOut: null,
      isDeleted: false,
    });
    if (!open) throw new AppError(409, 'You are not currently clocked in.');

    const breaks: any[] = Array.isArray(open.breaks) ? open.breaks : [];
    const last = breaks[breaks.length - 1];
    if (!last || last.endAt) {
      throw new AppError(409, 'You are not currently on a break.');
    }
    last.endAt = new Date();
    open.breaks = breaks as any;
    await open.save();
    return open.populate(['employee', 'shift']);
  },

  // STAFF — Start overtime AFTER scheduled shift end. Requires the latest
  // clocked-out entry whose shift has ended; rejects if shift hasn't ended.
  async startOvertime(userId: string, payload: any) {
    const dto = RotaTimesheetValidation.startOvertime(payload);
    const employee = await findMyEmployee(userId, dto.business);

    if (!(employee as any).isOvertimeAllowed) {
      throw new AppError(403, 'You are not authorized to start overtime. Please contact your manager.');
    }

    // Find the most recent entry for this employee in the last 24h.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const entry = await RotaTimesheet.findOne({
      business: dto.business,
      employee: employee._id,
      isDeleted: false,
      clockIn: { $gte: since },
    })
      .sort({ clockIn: -1 })
      .populate('shift');

    if (!entry) throw new AppError(404, 'No recent shift to extend with overtime.');
    if (!entry.clockOut) throw new AppError(400, 'Clock out first, then start overtime.');

    const shiftEnd = (entry.shift as any)?.endAt
      ? new Date((entry.shift as any).endAt)
      : null;
    if (!shiftEnd) {
      throw new AppError(400, 'No scheduled shift end found — cannot start overtime.');
    }
    if (Date.now() < shiftEnd.getTime()) {
      const minsLeft = Math.ceil((shiftEnd.getTime() - Date.now()) / 60000);
      throw new AppError(
        400,
        `Overtime can only start after your shift ends. ${minsLeft} min remaining.`,
      );
    }

    if (entry.overtime && entry.overtime.status === 'RUNNING') {
      throw new AppError(409, 'Overtime is already running.');
    }
    if (entry.overtime && entry.overtime.status === 'PENDING') {
      throw new AppError(409, 'Overtime already submitted and awaiting approval.');
    }

    entry.overtime = {
      startAt: new Date(),
      endAt: null,
      status: 'RUNNING',
      decidedBy: null,
      decidedAt: null,
      decisionNote: '',
    } as any;
    await entry.save();
    return entry.populate(['employee', 'shift']);
  },

  // STAFF — Stop running overtime → moves to PENDING for owner approval.
  async stopOvertime(userId: string, payload: any) {
    const dto = RotaTimesheetValidation.stopOvertime(payload);
    const employee = await findMyEmployee(userId, dto.business);

    const entry = await RotaTimesheet.findOne({
      business: dto.business,
      employee: employee._id,
      isDeleted: false,
      'overtime.status': 'RUNNING',
    }).populate('shift');

    if (!entry) throw new AppError(404, 'No running overtime to stop.');

    entry.overtime!.endAt = new Date();
    entry.overtime!.status = 'PENDING';
    await entry.save();
    return entry.populate(['employee', 'shift']);
  },

  // STAFF — Submit a reason for an existing undertime (if they clocked out
  // without one and want to ask for excusal later).
  async submitUndertimeReason(userId: string, id: string, payload: any) {
    const dto = RotaTimesheetValidation.submitUndertime(payload);
    const employee = await findMyEmployee(userId, dto.business);

    const entry = await RotaTimesheet.findOne({
      _id: id,
      business: dto.business,
      employee: employee._id,
      isDeleted: false,
    });
    if (!entry) throw new AppError(404, 'Timesheet entry not found.');
    if (!entry.undertime) throw new AppError(400, 'No undertime on this entry.');
    if (entry.undertime.status !== 'MUST_MAKEUP' && entry.undertime.status !== 'PENDING_EXCUSE') {
      throw new AppError(400, 'Undertime is already resolved.');
    }

    entry.undertime.reason = dto.reason;
    entry.undertime.status = 'PENDING_EXCUSE';
    await entry.save();
    return entry.populate(['employee', 'shift']);
  },

  // OWNER — Decide on a PENDING overtime block.
  async decideOvertime(userId: string, id: string, business: string, payload: any) {
    const dto = RotaTimesheetValidation.decideOvertime(payload);
    const entry = await RotaTimesheet.findOne({
      _id: id,
      business,
      isDeleted: false,
    });
    if (!entry) throw new AppError(404, 'Timesheet entry not found.');
    if (!entry.overtime || entry.overtime.status !== 'PENDING') {
      throw new AppError(400, 'No pending overtime on this entry.');
    }

    entry.overtime.status = dto.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    entry.overtime.decidedBy = userId as any;
    entry.overtime.decidedAt = new Date();
    entry.overtime.decisionNote = dto.decisionNote ?? '';
    await entry.save();
    return entry.populate(['employee', 'shift']);
  },

  // OWNER — Decide on a PENDING_EXCUSE / MUST_MAKEUP undertime block.
  async decideUndertime(userId: string, id: string, business: string, payload: any) {
    const dto = RotaTimesheetValidation.decideUndertime(payload);
    const entry = await RotaTimesheet.findOne({
      _id: id,
      business,
      isDeleted: false,
    });
    if (!entry) throw new AppError(404, 'Timesheet entry not found.');
    if (!entry.undertime) throw new AppError(400, 'No undertime on this entry.');

    const nextStatus =
      dto.decision === 'EXCUSE' ? 'EXCUSED' :
      dto.decision === 'MADE_UP' ? 'MADE_UP' :
      'MUST_MAKEUP';

    entry.undertime.status = nextStatus;
    entry.undertime.decidedBy = userId as any;
    entry.undertime.decidedAt = new Date();
    entry.undertime.decisionNote = dto.decisionNote ?? '';
    await entry.save();
    return entry.populate(['employee', 'shift']);
  },

  // OWNER — All open ("stuck") timesheets older than the threshold. Likely
  // means staff forgot to clock out. Surfaces so owner can patch them.
  async getStuckTimesheets(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const hoursOld = Math.max(1, Number(query?.hoursOld) || 12);
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    return RotaTimesheet.find({
      business,
      clockOut: null,
      isDeleted: false,
      clockIn: { $lte: cutoff },
    })
      .populate('employee')
      .populate('shift')
      .sort({ clockIn: 1 });
  },

  // STAFF — What's my current open entry (if any)?
  async getMyCurrent(userId: string, business: string) {
    const employee = await findMyEmployee(userId, business);
    const open = await RotaTimesheet.findOne({
      business,
      employee: employee._id,
      clockOut: null,
      isDeleted: false,
    }).populate('shift');

    // Also surface the *latest closed* entry from today so the staff home
    // screen can show overtime status / undertime status after clocking out.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const latestClosed = await RotaTimesheet.findOne({
      business,
      employee: employee._id,
      clockOut: { $ne: null },
      clockIn: { $gte: startOfDay },
      isDeleted: false,
    })
      .sort({ clockIn: -1 })
      .populate('shift');

    // Flag "stuck" if the open entry has been running > 12h (likely forgot
    // to clock out). The home UI can offer a recovery prompt.
    const isStuck = !!(
      open &&
      Date.now() - new Date(open.clockIn).getTime() > 12 * 60 * 60 * 1000
    );

    return {
      entry: open,
      stats: open ? entryStats(open) : null,
      latest: latestClosed,
      latestStats: latestClosed ? entryStats(latestClosed) : null,
      isStuck,
      isOvertimeAllowed: !!(employee as any).isOvertimeAllowed,
    };
  },

  // STAFF — Pay summary for a date window (defaults to current week).
  async getMyPaySummary(userId: string, query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const employee = await findMyEmployee(userId, business);

    // Default to current ISO week (Mon-Sun).
    const now = new Date();
    const weekStart = new Date(now);
    const day = (now.getDay() + 6) % 7; // 0 = Monday
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const from = query?.from ? new Date(String(query.from)) : weekStart;
    const to = query?.to ? new Date(String(query.to)) : weekEnd;

    const entries = await RotaTimesheet.find({
      business,
      employee: employee._id,
      isDeleted: false,
      clockIn: { $gte: from, $lt: to },
    }).populate('shift').sort({ clockIn: 1 });

    const hourlyWage = Number((employee as any).hourlyWage) || 0;

    let workedMinutes = 0;
    let overtimeMinutes = 0;
    let pendingOvertimeMinutes = 0;
    let undertimeMinutes = 0;
    const rows: any[] = [];

    for (const e of entries) {
      const stats = entryStats(e);
      workedMinutes += stats.workedMinutes;
      overtimeMinutes += stats.overtimeMinutes;
      undertimeMinutes += (e.undertime?.status === 'MUST_MAKEUP') ? (e.undertime?.minutes || 0) : 0;
      if (e.overtime?.status === 'PENDING' && e.overtime.endAt) {
        const otMin = Math.floor(
          (new Date(e.overtime.endAt).getTime() - new Date(e.overtime.startAt).getTime()) / 60000,
        );
        pendingOvertimeMinutes += Math.max(0, otMin);
      }
      rows.push({
        _id: e._id,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        shift: e.shift,
        stats,
        overtime: e.overtime,
        undertime: e.undertime,
      });
    }

    const payableMinutes = workedMinutes + overtimeMinutes;
    const pay = +((payableMinutes / 60) * hourlyWage).toFixed(2);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      hourlyWage,
      workedMinutes,
      overtimeMinutes,
      pendingOvertimeMinutes,
      undertimeMinutes,
      payableMinutes,
      pay,
      rows,
    };
  },

  // STAFF — Pending items count for the home screen bell badge.
  async getMyPendingCounts(userId: string, business: string) {
    const employee = await findMyEmployee(userId, business);
    const [pendingOT, pendingUT] = await Promise.all([
      RotaTimesheet.countDocuments({
        business, employee: employee._id, isDeleted: false,
        'overtime.status': 'PENDING',
      }),
      RotaTimesheet.countDocuments({
        business, employee: employee._id, isDeleted: false,
        'undertime.status': { $in: ['PENDING_EXCUSE', 'MUST_MAKEUP'] },
      }),
    ]);
    return { pendingOvertime: pendingOT, pendingUndertime: pendingUT };
  },

  // OWNER — Pending approvals queue (overtime + undertime needing decisions).
  async getPendingApprovals(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const [ot, ut] = await Promise.all([
      RotaTimesheet.find({
        business, isDeleted: false, 'overtime.status': 'PENDING',
      }).populate('employee').populate('shift').sort({ 'overtime.endAt': -1 }),
      RotaTimesheet.find({
        business, isDeleted: false, 'undertime.status': 'PENDING_EXCUSE',
      }).populate('employee').populate('shift').sort({ clockIn: -1 }),
    ]);
    return { overtime: ot, undertime: ut };
  },

  // OWNER — List timesheets for the business in a date window.
  async getAll(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 50, maxLimit: 500 });

    const filter: FilterQuery<IRotaTimesheet> = { business, isDeleted: false };

    const employee = RotaUtils.optionalObjectId(query?.employee);
    if (employee) filter.employee = new Types.ObjectId(employee);

    const from = query?.from ? new Date(String(query.from)) : null;
    const to = query?.to ? new Date(String(query.to)) : null;
    if (from && Number.isNaN(from.getTime())) throw new AppError(400, 'from is invalid');
    if (to && Number.isNaN(to.getTime())) throw new AppError(400, 'to is invalid');

    if (from) filter.clockIn = { ...(filter.clockIn as any), $gte: from };
    if (to) filter.clockIn = { ...(filter.clockIn as any), $lte: to };

    if (query?.open === 'true') filter.clockOut = null;

    const [data, total] = await Promise.all([
      RotaTimesheet.find(filter)
        .populate('employee')
        .populate('shift')
        .sort({ clockIn: -1 })
        .skip(skip)
        .limit(limit),
      RotaTimesheet.countDocuments(filter),
    ]);

    const enriched = data.map((d) => ({ ...d.toObject(), stats: entryStats(d) }));
    return { meta: { page, limit, total }, data: enriched };
  },

  // OWNER — Aggregated hours per employee over a window (monthly report).
  async getSummary(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');

    const from = query?.from ? new Date(String(query.from)) : null;
    const to = query?.to ? new Date(String(query.to)) : null;
    if (from && Number.isNaN(from.getTime())) throw new AppError(400, 'from is invalid');
    if (to && Number.isNaN(to.getTime())) throw new AppError(400, 'to is invalid');

    const filter: FilterQuery<IRotaTimesheet> = { business, isDeleted: false };
    if (from) filter.clockIn = { ...(filter.clockIn as any), $gte: from };
    if (to) filter.clockIn = { ...(filter.clockIn as any), $lte: to };

    const entries = await RotaTimesheet.find(filter).populate('employee').populate('shift');

    const byEmployee = new Map<
      string,
      {
        employee: any;
        workedMinutes: number;
        overtimeMinutes: number;
        openEntries: number;
        entriesCount: number;
        wageEstimate: number;
      }
    >();

    for (const e of entries) {
      const empId = String((e.employee as any)?._id || e.employee);
      const stats = entryStats(e);
      const empObj = (e.employee as any) || null;
      const hourly = Number(empObj?.hourlyWage) || 0;

      const acc = byEmployee.get(empId) || {
        employee: empObj,
        workedMinutes: 0,
        overtimeMinutes: 0,
        openEntries: 0,
        entriesCount: 0,
        wageEstimate: 0,
      };
      acc.workedMinutes += stats.workedMinutes;
      acc.overtimeMinutes += stats.overtimeMinutes;
      acc.entriesCount += 1;
      if (stats.isOpen) acc.openEntries += 1;
      acc.wageEstimate += ((stats.workedMinutes + stats.overtimeMinutes) / 60) * hourly;
      byEmployee.set(empId, acc);
    }

    const rows = Array.from(byEmployee.values()).map((r) => ({
      ...r,
      workedHours: +(r.workedMinutes / 60).toFixed(2),
      overtimeHours: +(r.overtimeMinutes / 60).toFixed(2),
      wageEstimate: +r.wageEstimate.toFixed(2),
    }));

    rows.sort((a, b) => b.workedMinutes - a.workedMinutes);

    const totals = rows.reduce(
      (t, r) => {
        t.workedMinutes += r.workedMinutes;
        t.overtimeMinutes += r.overtimeMinutes;
        t.wageEstimate += r.wageEstimate;
        return t;
      },
      { workedMinutes: 0, overtimeMinutes: 0, wageEstimate: 0 },
    );

    return {
      from: from?.toISOString() || null,
      to: to?.toISOString() || null,
      rows,
      totals: {
        ...totals,
        workedHours: +(totals.workedMinutes / 60).toFixed(2),
        overtimeHours: +(totals.overtimeMinutes / 60).toFixed(2),
        wageEstimate: +totals.wageEstimate.toFixed(2),
      },
    };
  },

  // OWNER — Create an entry from scratch (e.g. recording a forgotten shift).
  async ownerCreate(userId: string, payload: any) {
    const dto = RotaTimesheetValidation.ownerCreate(payload);

    const emp = await RotaEmployee.findOne({
      _id: dto.employee,
      business: dto.business,
      isDeleted: false,
    });
    if (!emp) throw new AppError(400, 'Employee not found for this business');

    const doc = await RotaTimesheet.create({
      business: dto.business,
      employee: dto.employee,
      shift: dto.shift ?? null,
      clockIn: dto.clockIn,
      clockOut: dto.clockOut ?? null,
      breakMinutes: dto.breakMinutes ?? 0,
      notes: dto.notes ?? '',
      source: 'OWNER',
      editedBy: userId,
      editedAt: new Date(),
    });

    return doc.populate(['employee', 'shift']);
  },

  // OWNER — Adjust an existing entry.
  async update(userId: string, id: string, business: string, payload: any) {
    const existing = await RotaTimesheet.findOne({ _id: id, business, isDeleted: false });
    if (!existing) throw new AppError(404, 'Timesheet entry not found');

    const dto = RotaTimesheetValidation.update(payload);

    const nextClockIn = dto.clockIn ?? existing.clockIn;
    const nextClockOut = dto.clockOut !== undefined ? dto.clockOut : existing.clockOut;
    if (nextClockOut && nextClockOut <= nextClockIn) {
      throw new AppError(400, 'clockOut must be after clockIn');
    }

    Object.assign(existing, {
      ...dto,
      clockIn: nextClockIn,
      clockOut: nextClockOut,
      source: existing.source === 'STAFF' ? 'OWNER_EDIT' : existing.source,
      editedBy: userId,
      editedAt: new Date(),
    });
    await existing.save();

    return existing.populate(['employee', 'shift']);
  },

  // OWNER — Soft delete (e.g. duplicate clock-ins). Keeps audit history.
  async remove(id: string, business: string) {
    const doc = await RotaTimesheet.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!doc) throw new AppError(404, 'Timesheet entry not found');
    return doc;
  },
};
