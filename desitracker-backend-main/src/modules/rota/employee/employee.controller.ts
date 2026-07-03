import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaEmployeeService } from './employee.service';
import { emitToBusiness } from '../../../utils/socket';

export const RotaEmployeeController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaEmployeeService.create(req.body);
      emitToBusiness(req.body?.business, 'rota_updated', { action: 'employee_created' });
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaEmployeeService.getAll(req.query);

      // Staff can list colleagues (needed to render the rota with names) but
      // must not see private HR fields — trim to a safe projection for them.
      const callerRole = (req as any).user?.role;
      const data =
        callerRole === 'staff'
          ? result.data.map((e: any) => ({
              _id: e._id,
              firstName: e.firstName,
              lastName: e.lastName,
              photoUrl: e.photoUrl,
              status: e.status,
              role: e.role,
              user: e.user,
              business: e.business,
            }))
          : result.data;

      res.status(200).json({
        success: true,
        message: 'Employees fetched successfully',
        meta: result.meta,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

      const result = await RotaEmployeeService.getById(id, business);
      res.status(200).json({
        success: true,
        message: 'Employee fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

      const result = await RotaEmployeeService.update(id, business, req.body);
      // Role assignment / details changed — push so the affected staff
      // re-pull permissions live.
      emitToBusiness(business, 'rota_updated', { action: 'employee_updated' });
      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

      const result = await RotaEmployeeService.remove(id, business);
      emitToBusiness(business, 'rota_updated', { action: 'employee_removed' });
      res.status(200).json({
        success: true,
        message: 'Employee removed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  acceptInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaEmployeeService.acceptInvite(req.body);
      res.status(200).json({
        success: true,
        message: 'Invite accepted. You can now sign in.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getMyPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const result = await RotaEmployeeService.getMyPermissions(user.id, user.role);
      res.status(200).json({
        success: true,
        message: 'Permissions resolved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  savePushToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const { token } = req.body;
      if (!token || typeof token !== 'string') {
        res.status(400).json({ success: false, message: 'token is required' });
        return;
      }
      const emp = await (await import('./employee.model')).RotaEmployee.findOneAndUpdate(
        { user: user.id, business, isDeleted: false },
        { expoPushToken: token },
        { new: true },
      );
      if (!emp) {
        res.status(404).json({ success: false, message: 'Employee record not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Push token saved' });
    } catch (err) {
      next(err);
    }
  },

  resendInvite: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaEmployeeService.resendInvite(id, business);
      res.status(200).json({
        success: true,
        message: 'Invite resent',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
