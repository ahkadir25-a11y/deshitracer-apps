import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaRoleService } from './role.service';

export const RotaRoleController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaRoleService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaRoleService.getAll(req.query);
      res.status(200).json({
        success: true,
        message: 'Roles fetched successfully',
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

      const result = await RotaRoleService.getById(id, business);
      res.status(200).json({
        success: true,
        message: 'Role fetched successfully',
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

      const result = await RotaRoleService.update(id, business, req.body);
      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
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

      const result = await RotaRoleService.remove(id, business);
      res.status(200).json({
        success: true,
        message: 'Role removed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
