import { FilterQuery, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { RotaLeave, IRotaLeave, LeaveStatus, LeaveType } from './leave.model';
import { RotaEmployee } from '../employee/employee.model';
import { RotaUtils } from '../rota.utils';

const VALID_TYPES: LeaveType[] = ['HOLIDAY', 'SICK', 'UNPAID', 'OTHER'];

async function findMyEmployee(userId: string, business: string) {
  const emp = await RotaEmployee.findOne({
    user: userId, business, isDeleted: false, status: 'ACTIVE',
  });
  if (!emp) throw new AppError(403, 'No active employee record for this business.');
  return emp;
}

function parseDate(value: any, field: string): Date {
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) throw new AppError(400, `${field} is invalid date`);
  return d;
}

export const RotaLeaveService = {
  // STAFF — submit a leave request for themselves.
  async createForStaff(userId: string, payload: any) {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const startDate = parseDate(payload?.startDate, 'startDate');
    const endDate = parseDate(payload?.endDate, 'endDate');
    if (endDate < startDate) throw new AppError(400, 'endDate must be on or after startDate');

    const type: LeaveType =
      VALID_TYPES.includes(payload?.type) ? payload.type : 'HOLIDAY';
    const reason = RotaUtils.optionalString(payload?.reason) ?? '';

    const employee = await findMyEmployee(userId, business);

    const doc = await RotaLeave.create({
      business,
      employee: employee._id,
      type,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
    });
    return doc.populate('employee');
  },

  // STAFF — list own requests.
  async listMine(userId: string, business: string) {
    const employee = await findMyEmployee(userId, business);
    const data = await RotaLeave.find({
      business, employee: employee._id, isDeleted: false,
    })
      .populate('employee')
      .sort({ startDate: -1 });
    return data;
  },

  // STAFF — cancel one of their own PENDING requests.
  async cancelMine(userId: string, id: string, business: string) {
    const employee = await findMyEmployee(userId, business);
    const doc = await RotaLeave.findOne({ _id: id, business, employee: employee._id, isDeleted: false });
    if (!doc) throw new AppError(404, 'Leave request not found');
    if (doc.status !== 'PENDING') throw new AppError(409, 'Only pending requests can be cancelled');
    doc.status = 'CANCELLED';
    await doc.save();
    return doc;
  },

  // OWNER — list all for a business, optionally filter by status / employee.
  async listForOwner(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const filter: FilterQuery<IRotaLeave> = { business, isDeleted: false };

    const status = query?.status as LeaveStatus | undefined;
    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      filter.status = status;
    }

    const employee = RotaUtils.optionalObjectId(query?.employee);
    if (employee) filter.employee = new Types.ObjectId(employee);

    const data = await RotaLeave.find(filter)
      .populate('employee')
      .sort({ status: 1, startDate: -1 });
    return data;
  },

  // OWNER — approve or reject a request.
  async decide(userId: string, id: string, business: string, payload: any) {
    const doc = await RotaLeave.findOne({ _id: id, business, isDeleted: false });
    if (!doc) throw new AppError(404, 'Leave request not found');
    if (doc.status !== 'PENDING') throw new AppError(409, 'Request has already been decided');

    const decision = payload?.status;
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new AppError(400, 'status must be APPROVED or REJECTED');
    }

    doc.status = decision;
    doc.decidedBy = userId as any;
    doc.decidedAt = new Date();
    doc.decisionNote = RotaUtils.optionalString(payload?.decisionNote) ?? '';
    await doc.save();
    return doc.populate('employee');
  },

  // OWNER — soft delete.
  async remove(id: string, business: string) {
    const doc = await RotaLeave.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!doc) throw new AppError(404, 'Leave request not found');
    return doc;
  },

  // STAFF — annual leave balance. Counts days in APPROVED holiday requests
  // for the current calendar year against the employee's `holidayAllowance`.
  async getMyBalance(userId: string, business: string) {
    const employee = await findMyEmployee(userId, business);

    const yearStart = new Date(); yearStart.setMonth(0, 1); yearStart.setHours(0, 0, 0, 0);
    const yearEnd   = new Date(yearStart); yearEnd.setFullYear(yearEnd.getFullYear() + 1);

    const approved = await RotaLeave.find({
      business,
      employee: employee._id,
      isDeleted: false,
      type: 'HOLIDAY',
      status: 'APPROVED',
      startDate: { $gte: yearStart, $lt: yearEnd },
    });

    // Pending PENDING holiday requests are surfaced separately so staff can
    // see "you've asked for 3 more, awaiting approval".
    const pending = await RotaLeave.find({
      business,
      employee: employee._id,
      isDeleted: false,
      type: 'HOLIDAY',
      status: 'PENDING',
      startDate: { $gte: yearStart, $lt: yearEnd },
    });

    const sumDays = (list: any[]) => list.reduce((n, d) => {
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      // Inclusive day count, e.g. Mon-Mon = 1, Mon-Tue = 2.
      const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
      return n + Math.max(0, days);
    }, 0);

    const allowance = Number((employee as any).holidayAllowance ?? 28);
    const used = sumDays(approved);
    const pendingDays = sumDays(pending);
    const remaining = Math.max(0, allowance - used);

    return {
      year: yearStart.getFullYear(),
      allowance,
      used,
      pending: pendingDays,
      remaining,
    };
  },

  // OWNER — balances for all employees of the business (single round-trip).
  async getOwnerBalances(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const employees = await RotaEmployee.find({ business, isDeleted: false });

    const yearStart = new Date(); yearStart.setMonth(0, 1); yearStart.setHours(0, 0, 0, 0);
    const yearEnd   = new Date(yearStart); yearEnd.setFullYear(yearEnd.getFullYear() + 1);

    const approved = await RotaLeave.find({
      business, isDeleted: false, type: 'HOLIDAY', status: 'APPROVED',
      startDate: { $gte: yearStart, $lt: yearEnd },
    });

    const usedByEmployee = new Map<string, number>();
    for (const d of approved) {
      const id = String((d as any).employee);
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
      usedByEmployee.set(id, (usedByEmployee.get(id) || 0) + Math.max(0, days));
    }

    return employees.map((e) => {
      const allowance = Number((e as any).holidayAllowance ?? 28);
      const used = usedByEmployee.get(String(e._id)) || 0;
      return {
        employee: e,
        allowance,
        used,
        remaining: Math.max(0, allowance - used),
      };
    });
  },
};
