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
  if (clash) throw new AppError(409, 'Employee already has a shift that overlaps this time range');
}

export const RotaShiftService = {
  async create(payload: any) {
    const dto = RotaShiftValidation.create(payload);

    await ensureRole(dto.role, dto.business);

    // If shift is assigned to employee, employee must exist & be ACTIVE & belong to business
    if (dto.employee) {
      const emp = await ensureEmployee(dto.employee, dto.business);

      // Since your spec says: each employee has a role
      // enforce that shift role matches employee role (real-world safe default)
      if (String(emp.role) !== String(dto.role)) {
        throw new AppError(400, 'Shift role must match employee role');
      }
    }

    await ensureNoOverlap({ business: dto.business, employee: dto.employee ?? null, startAt: dto.startAt, endAt: dto.endAt });

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
      const emp = await ensureEmployee(nextEmployee, business);
      if (String(emp.role) !== String(nextRole)) {
        throw new AppError(400, 'Shift role must match employee role');
      }
    }

    await ensureNoOverlap({
      business,
      employee: nextEmployee,
      startAt: nextStart,
      endAt: nextEnd,
      excludeId: id,
    });

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
};
