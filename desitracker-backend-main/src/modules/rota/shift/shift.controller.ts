import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaShiftService } from './shift.service';
import { emitToBusiness } from '../../../utils/socket';

export const RotaShiftController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaShiftService.create(req.body);
      emitToBusiness(req.body?.business, 'rota_updated', { action: 'created' });
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
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

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
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

      const result = await RotaShiftService.update(id, business, req.body);
      emitToBusiness(business, 'rota_updated', { action: 'updated' });
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
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');

      const result = await RotaShiftService.remove(id, business);
      emitToBusiness(business, 'rota_updated', { action: 'removed' });
      res.status(200).json({
        success: true,
        message: 'Shift removed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // ── Absence cover ──────────────────────────────────────────────────────
  requestCover: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaShiftService.requestCover(id, business, req.body);
      emitToBusiness(business, 'rota_updated', { action: 'cover_requested' });
      res.status(200).json({ success: true, message: 'Cover requested', data: result });
    } catch (err) { next(err); }
  },

  assignCover: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaShiftService.assignCover(id, business, req.body);
      emitToBusiness(business, 'rota_updated', { action: 'cover_assigned' });
      res.status(200).json({ success: true, message: 'Cover assigned', data: result });
    } catch (err) { next(err); }
  },

  availableForCover: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaShiftService.availableForCover(id, business);
      res.status(200).json({ success: true, message: 'Available staff resolved', data: result });
    } catch (err) { next(err); }
  },
};
