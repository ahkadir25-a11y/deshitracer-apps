import { FilterQuery, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { RotaShift } from './shift.model';
import { IRotaShift } from './shift.interface';
import { RotaRole } from '../role/role.model';
import { RotaEmployee } from '../employee/employee.model';
import { RotaShiftValidation } from './shift.validation';
import { RotaUtils } from '../rota.utils';
import type { SortOrder } from 'mongoose';

async function ensureRole(roleId: string, business: string) {
  const role = await RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
  if (!role) throw new AppError(400, 'Invalid role for this business');
  return role;
}

async function ensureEmployee(employeeId: string, business: string) {
  const emp = await RotaEmployee.findOne({ _id: employeeId, business, isDeleted: false, status: 'ACTIVE' });
  if (!emp) throw new AppError(400, 'Invalid/Inactive employee for this business');
  return emp;
}

// Prevent double-booking (overlapping shifts)
async function ensureNoOverlap(args: {
  business: string;
  employee?: string | null;
  startAt: Date;
  endAt: Date;
  excludeId?: string;
}) {
  if (!args.employee) return;

  const filter: FilterQuery<IRotaShift> = {
    business: args.business,
    employee: new Types.ObjectId(args.employee),
    isDeleted: false,
    status: { $ne: 'CANCELLED' },
    startAt: { $lt: args.endAt },
    endAt: { $gt: args.startAt },
  };

  if (args.excludeId) filter._id = { $ne: new Types.ObjectId(args.excludeId) };

  const clash = await RotaShift.findOne(filter).select('_id startAt endAt');
  if (clash) {
    const fmt = (d: Date) =>
      `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    throw new AppError(
      409,
      `Conflict: this employee already has a shift ${fmt(new Date(clash.startAt))} – ${fmt(new Date(clash.endAt))}. Pick a different time or reassign.`,
    );
  }
}

// Check if this shift would push the employee over their personal weekly hour limit.
// Fetches the employee's maxWeeklyHours — if null/0, no limit is enforced.
async function ensureNoOvertimeRisk(args: {
  business: string;
  employee: string;
  startAt: Date;
  endAt: Date;
  excludeId?: string;
}) {
  const empDoc = await RotaEmployee.findById(args.employee).select('maxWeeklyHours').lean();
  const rawLimit = (empDoc as any)?.maxWeeklyHours;

  // null or 0 means "no weekly hour cap" — skip the check entirely.
  if (rawLimit === null || rawLimit === undefined || rawLimit === 0) return;

  const MAX_HOURS = rawLimit as number;

  // Find the Monday (start) and Sunday (end) of the week containing startAt
  const day       = args.startAt.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMon = (day === 0 ? -6 : 1 - day); // days back to Monday
  const weekStart = new Date(args.startAt);
  weekStart.setDate(weekStart.getDate() + diffToMon);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const filter: FilterQuery<IRotaShift> = {
    business: args.business,
    employee: new Types.ObjectId(args.employee),
    isDeleted: false,
    status:   { $ne: 'CANCELLED' },
    startAt:  { $gte: weekStart },
    endAt:    { $lte: weekEnd },
  };
  if (args.excludeId) filter._id = { $ne: new Types.ObjectId(args.excludeId) };

  const existingShifts = await RotaShift.find(filter).select('startAt endAt');

  // Sum existing scheduled minutes
  const existingMinutes = existingShifts.reduce((sum: number, s: any) => {
    return sum + (s.endAt.getTime() - s.startAt.getTime()) / 60000;
  }, 0);

  // Add the new shift duration
  const newShiftMinutes = (args.endAt.getTime() - args.startAt.getTime()) / 60000;
  const totalHours = (existingMinutes + newShiftMinutes) / 60;

  if (totalHours > MAX_HOURS) {
    throw new AppError(
      422,
      `Weekly hours exceeded: This shift would schedule this employee for ${totalHours.toFixed(1)} hours this week, exceeding their ${MAX_HOURS}h weekly limit. Remove an existing shift, reduce hours, or raise their weekly limit in the employee profile.`
    );
  }
}
// ────────────────────────────────────────────────────────────────────────────────────

export const RotaShiftService = {
  async create(payload: any) {
    const dto = RotaShiftValidation.create(payload);

    await ensureRole(dto.role, dto.business);

    // If shift is assigned to employee, employee must exist & be ACTIVE & belong to business
    if (dto.employee) {
      await ensureEmployee(dto.employee, dto.business);
      // Note: we intentionally do NOT enforce that the shift role matches the
      // employee's default role. Owners routinely cover shifts across roles
      // (e.g. a manager filling in as waiter). Enforcing the match here also
      // breaks edits whenever an employee's role is changed after scheduling.
    }

    await ensureNoOverlap({ business: dto.business, employee: dto.employee ?? null, startAt: dto.startAt, endAt: dto.endAt });

    // ─── NEW: Overtime protection check before saving ────────────────────────────────
    // Only runs if an employee is assigned to this shift
    if (dto.employee) {
      await ensureNoOvertimeRisk({
        business: dto.business,
        employee: dto.employee,
        startAt:  dto.startAt,
        endAt:    dto.endAt,
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const doc = await RotaShift.create({
      business: dto.business,
      employee: dto.employee ?? null,
      role: dto.role,
      startAt: dto.startAt,
      endAt: dto.endAt,
      breakMinutes: dto.breakMinutes ?? 0,
      location: dto.location ?? '',
      notes: dto.notes ?? '',
      status: dto.status ?? 'DRAFT',
      isDeleted: false,
    });

    // ─── NEW: 2-Month Recurring Shift Engine ───────────────────────────────────────
    // If repeatWeeklyFor is set (1-8 weeks), auto-generate identical shifts
    // for each subsequent week. Each copy also runs the overlap &
    // overtime checks so the auto-schedule is always conflict-free.
    const repeatWeeks = typeof payload?.repeatWeeklyFor === 'number'
      ? Math.min(Math.max(Math.floor(payload.repeatWeeklyFor), 0), 8) // clamp 0–8
      : 0;

    if (repeatWeeks > 0) {
      const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

      for (let week = 1; week <= repeatWeeks; week++) {
        const repeatStart = new Date(dto.startAt.getTime() + week * MS_PER_WEEK);
        const repeatEnd   = new Date(dto.endAt.getTime()   + week * MS_PER_WEEK);

        // Run the same safety checks for every future week
        await ensureNoOverlap({
          business: dto.business,
          employee: dto.employee ?? null,
          startAt:  repeatStart,
          endAt:    repeatEnd,
        });

        if (dto.employee) {
          await ensureNoOvertimeRisk({
            business: dto.business,
            employee: dto.employee,
            startAt:  repeatStart,
            endAt:    repeatEnd,
          });
        }

        // Create the duplicated shift for this week
        await RotaShift.create({
          business:     dto.business,
          employee:     dto.employee ?? null,
          role:         dto.role,
          startAt:      repeatStart,
          endAt:        repeatEnd,
          breakMinutes: dto.breakMinutes ?? 0,
          location:     dto.location ?? '',
          notes:        dto.notes ?? '',
          status:       dto.status ?? 'DRAFT',
          isDeleted:    false,
        });
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    return doc;
  },

  async getAll(query: any) {
    const business = RotaShiftValidation.businessFromQuery(query);

    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 50, maxLimit: 200 });
    const { sortBy: sortByRaw, sortOrder: sortOrderRaw } = RotaUtils.sort(query, 'startAt');

    const sort: Record<string, SortOrder> = {
      [String(sortByRaw)]: sortOrderRaw as SortOrder,
    };

    const filter: FilterQuery<IRotaShift> = { business, isDeleted: false };

    if (query?.status === 'DRAFT' || query?.status === 'PUBLISHED' || query?.status === 'CANCELLED') {
      filter.status = query.status;
    }

    const employee = RotaUtils.optionalObjectId(query?.employee);
    if (employee) filter.employee = new Types.ObjectId(employee);

    const role = RotaUtils.optionalObjectId(query?.role);
    if (role) filter.role = new Types.ObjectId(role);

    // Window query (weekly/daily rota)
    const from = query?.from ? new Date(String(query.from)) : null;
    const to = query?.to ? new Date(String(query.to)) : null;

    if (from && Number.isNaN(from.getTime())) throw new AppError(400, 'from is invalid');
    if (to && Number.isNaN(to.getTime())) throw new AppError(400, 'to is invalid');

    // return shifts that intersect [from, to]
    if (from) filter.endAt = { ...(filter.endAt as any), $gt: from };
    if (to) filter.startAt = { ...(filter.startAt as any), $lt: to };

    const [data, total] = await Promise.all([
      RotaShift.find(filter)
        .populate('employee')
        .populate('role')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      RotaShift.countDocuments(filter),
    ]);

    return { meta: { page, limit, total }, data };
  },

  async getById(id: string, business: string) {
    const doc = await RotaShift.findOne({ _id: id, business, isDeleted: false })
      .populate('employee')
      .populate('role');

    if (!doc) throw new AppError(404, 'Shift not found');
    return doc;
  },

  async update(id: string, business: string, payload: any) {
    const existing = await RotaShift.findOne({ _id: id, business, isDeleted: false });
    if (!existing) throw new AppError(404, 'Shift not found');

    const dto = RotaShiftValidation.update(payload);

    const nextStart = dto.startAt ?? existing.startAt;
    const nextEnd = dto.endAt ?? existing.endAt;

    if (nextEnd <= nextStart) throw new AppError(400, 'endAt must be after startAt');

    const nextBreak = dto.breakMinutes ?? existing.breakMinutes ?? 0;
    const durationMinutes = Math.floor((nextEnd.getTime() - nextStart.getTime()) / 60000);
    if (nextBreak > durationMinutes) throw new AppError(400, 'breakMinutes cannot exceed shift duration');

    const nextRole = dto.role ?? String(existing.role);
    await ensureRole(String(nextRole), business);

    const nextEmployee =
      dto.employee === undefined
        ? (existing.employee ? String(existing.employee) : null)
        : (dto.employee ? String(dto.employee) : null);

    if (nextEmployee) {
      await ensureEmployee(nextEmployee, business);
      // Role-match constraint intentionally removed — see create() for rationale.
    }

    await ensureNoOverlap({
      business,
      employee: nextEmployee,
      startAt: nextStart,
      endAt: nextEnd,
      excludeId: id,
    });

    // ─── Overtime protection also applies when editing shifts ────────────────────
    // Guards against silently extending a shift (e.g. 8h → 16h) past the weekly cap.
    // BUT skip it when:
    //   • the shift times aren't changing (only toggling a flag / location / notes),
    //     otherwise flipping the "OT On" switch re-runs the guard and blocks itself; or
    //   • the owner is mandating overtime (ownerMandatedOvertime === true) — that IS
    //     the explicit authorization to exceed the normal weekly limit.
    const timesChanged = dto.startAt !== undefined || dto.endAt !== undefined;
    const nextOvertime =
      dto.ownerMandatedOvertime !== undefined
        ? dto.ownerMandatedOvertime
        : existing.ownerMandatedOvertime;
    if (nextEmployee && timesChanged && nextOvertime !== true) {
      await ensureNoOvertimeRisk({
        business,
        employee: nextEmployee,
        startAt:  nextStart,
        endAt:    nextEnd,
        excludeId: id,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────────

    const doc = await RotaShift.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      {
        ...dto,
        startAt: nextStart,
        endAt: nextEnd,
        breakMinutes: nextBreak,
      },
      { new: true, runValidators: true }
    )
      .populate('employee')
      .populate('role');

    if (!doc) throw new AppError(404, 'Shift not found');

    // ─── NEW: Notify staff if Owner mandated overtime was just toggled ON ──────
    if (
      dto.ownerMandatedOvertime === true &&
      existing.ownerMandatedOvertime !== true &&
      doc.employee
    ) {
      try {
        const { sendExpoPush } = await import('../../../utils/lib/push');
        const empDoc = await RotaEmployee.findById(doc.employee._id).select('expoPushToken').lean();
        const pushToken = (empDoc as any)?.expoPushToken;
        if (pushToken) {
          await sendExpoPush({
            to: pushToken,
            title: '⚠️ Mandatory Overtime Requested',
            body: `Your manager has requested you to stay for overtime today. Your timesheet will automatically track your overtime hours after your shift ends.`,
            sound: 'default',
            data: { type: 'MANDATORY_OVERTIME', shiftId: String(doc._id) },
          });
        }
      } catch (err) {
        console.error('[Overtime Push Notification Error]:', err);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────────

    return doc;
  },

  // Soft delete: cancel + isDeleted
  async remove(id: string, business: string) {
    const doc = await RotaShift.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true, status: 'CANCELLED' },
      { new: true }
    );
    if (!doc) throw new AppError(404, 'Shift not found');
    return doc;
  },

  // ── ABSENCE COVER ────────────────────────────────────────────────────────
  // Owner flags a shift as needing cover (assigned staff called in sick etc.)
  async requestCover(id: string, business: string, payload: any) {
    const shift = await RotaShift.findOne({ _id: id, business, isDeleted: false });
    if (!shift) throw new AppError(404, 'Shift not found');
    if (!shift.employee) throw new AppError(400, 'Shift has no assigned employee');

    shift.coverStatus = 'NEEDS_COVER';
    shift.coverNote = (payload?.coverNote || '').toString().slice(0, 500);
    // Preserve the original assignee so the report still knows whose absence
    // triggered the cover. Only set if not already set (don't overwrite on a
    // second request).
    if (!shift.originalEmployee) shift.originalEmployee = shift.employee;
    await shift.save();

    return shift.populate(['employee', 'role', 'originalEmployee']);
  },

  // Owner picks a replacement and reassigns. Runs the same overlap + OT
  // checks as a normal edit so we don't accidentally double-book the cover.
  async assignCover(id: string, business: string, payload: any) {
    const newEmployeeId = RotaUtils.requireObjectId(payload?.employee, 'employee');
    const shift = await RotaShift.findOne({ _id: id, business, isDeleted: false });
    if (!shift) throw new AppError(404, 'Shift not found');

    const emp = await ensureEmployee(newEmployeeId, business);
    if (String(emp.role) !== String(shift.role)) {
      throw new AppError(400, 'Cover employee must have the same role as the shift');
    }

    await ensureNoOverlap({
      business,
      employee: newEmployeeId,
      startAt: shift.startAt,
      endAt: shift.endAt,
      excludeId: id,
    });
    await ensureNoOvertimeRisk({
      business,
      employee: newEmployeeId,
      startAt: shift.startAt,
      endAt: shift.endAt,
      excludeId: id,
    });

    if (!shift.originalEmployee && shift.employee) {
      shift.originalEmployee = shift.employee;
    }
    shift.employee = newEmployeeId as any;
    shift.coverStatus = 'COVERED';
    await shift.save();

    return shift.populate(['employee', 'role', 'originalEmployee']);
  },

  // Returns employees eligible to cover the shift:
  //   • same business, ACTIVE, same role
  //   • no overlapping shift in the same time window
  //   • no APPROVED leave that overlaps the shift
  async availableForCover(id: string, business: string) {
    const shift = await RotaShift.findOne({ _id: id, business, isDeleted: false });
    if (!shift) throw new AppError(404, 'Shift not found');

    // Lazy-import to avoid a circular dep with leave.model.
    const { RotaEmployee } = await import('../employee/employee.model');
    const { RotaLeave } = await import('../leave/leave.model');

    const sameRoleEmployees = await RotaEmployee.find({
      business,
      role: shift.role,
      status: 'ACTIVE',
      isDeleted: false,
      _id: { $ne: shift.employee },
    });

    if (!sameRoleEmployees.length) return [];

    const employeeIds = sameRoleEmployees.map((e) => e._id);

    // Find overlapping shifts for those employees.
    const overlapping = await RotaShift.find({
      business,
      employee: { $in: employeeIds },
      isDeleted: false,
      status: { $ne: 'CANCELLED' },
      _id: { $ne: shift._id },
      startAt: { $lt: shift.endAt },
      endAt:   { $gt: shift.startAt },
    }).select('employee');
    const busyIds = new Set(overlapping.map((o) => String(o.employee)));

    // Find approved leave that overlaps.
    const overlappingLeave = await RotaLeave.find({
      business,
      employee: { $in: employeeIds },
      status: 'APPROVED',
      isDeleted: false,
      startDate: { $lte: shift.endAt },
      endDate:   { $gte: shift.startAt },
    }).select('employee');
    const onLeaveIds = new Set(overlappingLeave.map((l) => String(l.employee)));

    return sameRoleEmployees.map((e) => ({
      ...e.toObject(),
      _conflict: busyIds.has(String(e._id))
        ? 'Has overlapping shift'
        : onLeaveIds.has(String(e._id))
          ? 'On approved leave'
          : null,
    }));
  },
};
