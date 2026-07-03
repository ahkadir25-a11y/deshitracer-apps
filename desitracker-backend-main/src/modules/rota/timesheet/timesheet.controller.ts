import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaTimesheetService } from './timesheet.service';
import { emitToBusiness } from '../../../utils/socket';

function requireUserId(req: Request) {
  const user = (req as any).user;
  if (!user?.id) {
    const e: any = new Error('Not authenticated');
    e.statusCode = 401;
    throw e;
  }
  return user.id as string;
}

export const RotaTimesheetController = {
  // STAFF
  clockIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.clockIn(userId, req.body);
      // Push so managers/owners see "on shift / late" update live.
      emitToBusiness(req.body?.business, 'timesheet_updated', { action: 'clock_in' });
      res.status(201).json({ success: true, message: 'Clocked in', data: result });
    } catch (err) { next(err); }
  },

  clockOut: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.clockOut(userId, req.body);
      emitToBusiness(req.body?.business, 'timesheet_updated', { action: 'clock_out' });
      res.status(200).json({ success: true, message: 'Clocked out', data: result });
    } catch (err) { next(err); }
  },

  startBreak: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.startBreak(userId, req.body);
      emitToBusiness(req.body?.business, 'timesheet_updated', { action: 'break_start' });
      res.status(200).json({ success: true, message: 'Break started', data: result });
    } catch (err) { next(err); }
  },

  endBreak: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.endBreak(userId, req.body);
      emitToBusiness(req.body?.business, 'timesheet_updated', { action: 'break_end' });
      res.status(200).json({ success: true, message: 'Break ended', data: result });
    } catch (err) { next(err); }
  },

  startOvertime: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.startOvertime(userId, req.body);
      res.status(200).json({ success: true, message: 'Overtime started', data: result });
    } catch (err) { next(err); }
  },

  stopOvertime: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.stopOvertime(userId, req.body);
      res.status(200).json({ success: true, message: 'Overtime submitted for approval', data: result });
    } catch (err) { next(err); }
  },

  submitUndertimeReason: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaTimesheetService.submitUndertimeReason(userId, id, req.body);
      res.status(200).json({ success: true, message: 'Reason submitted', data: result });
    } catch (err) { next(err); }
  },

  getMyCurrent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaTimesheetService.getMyCurrent(userId, business);
      res.status(200).json({ success: true, message: 'Current entry resolved', data: result });
    } catch (err) { next(err); }
  },

  getMyPaySummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.getMyPaySummary(userId, req.query);
      res.status(200).json({ success: true, message: 'Pay summary', data: result });
    } catch (err) { next(err); }
  },

  getMyPendingCounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaTimesheetService.getMyPendingCounts(userId, business);
      res.status(200).json({ success: true, message: 'Pending counts', data: result });
    } catch (err) { next(err); }
  },

  // OWNER
  getPendingApprovals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaTimesheetService.getPendingApprovals(req.query);
      res.status(200).json({ success: true, message: 'Pending approvals', data: result });
    } catch (err) { next(err); }
  },

  getStuckTimesheets: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaTimesheetService.getStuckTimesheets(req.query);
      res.status(200).json({ success: true, message: 'Stuck timesheets', data: result });
    } catch (err) { next(err); }
  },

  decideOvertime: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaTimesheetService.decideOvertime(userId, id, business, req.body);
      res.status(200).json({ success: true, message: 'Overtime decided', data: result });
    } catch (err) { next(err); }
  },

  decideUndertime: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaTimesheetService.decideUndertime(userId, id, business, req.body);
      res.status(200).json({ success: true, message: 'Undertime decided', data: result });
    } catch (err) { next(err); }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaTimesheetService.getAll(req.query);
      res.status(200).json({
        success: true,
        message: 'Timesheets fetched',
        meta: result.meta,
        data: result.data,
      });
    } catch (err) { next(err); }
  },

  getSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaTimesheetService.getSummary(req.query);
      res.status(200).json({ success: true, message: 'Summary computed', data: result });
    } catch (err) { next(err); }
  },

  ownerCreate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaTimesheetService.ownerCreate(userId, req.body);
      res.status(201).json({ success: true, message: 'Timesheet entry created', data: result });
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaTimesheetService.update(userId, id, business, req.body);
      res.status(200).json({ success: true, message: 'Timesheet entry updated', data: result });
    } catch (err) { next(err); }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaTimesheetService.remove(id, business);
      res.status(200).json({ success: true, message: 'Timesheet entry removed', data: result });
    } catch (err) { next(err); }
  },
};
