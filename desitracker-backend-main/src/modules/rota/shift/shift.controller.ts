import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaShiftService } from './shift.service';

export const RotaShiftController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaShiftService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Shift created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaShiftService.getAll(req.query);
      res.status(200).json({
        success: true,
        message: 'Shifts fetched successfully',
        meta: result.meta,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId(req.params.id, 'id');

      const result = await RotaShiftService.getById(id, business);
      res.status(200).json({
        success: true,
        message: 'Shift fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId(req.params.id, 'id');

      const result = await RotaShiftService.update(id, business, req.body);
      res.status(200).json({
        success: true,
        message: 'Shift updated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId(req.params.id, 'id');

      const result = await RotaShiftService.remove(id, business);
      res.status(200).json({
        success: true,
        message: 'Shift removed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
