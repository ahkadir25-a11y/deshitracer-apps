import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaEmployeeService } from './employee.service';

export const RotaEmployeeController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaEmployeeService.create(req.body);
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
      res.status(200).json({
        success: true,
        message: 'Employees fetched successfully',
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
      const id = RotaUtils.requireObjectId(req.params.id, 'id');

      const result = await RotaEmployeeService.update(id, business, req.body);
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
      const id = RotaUtils.requireObjectId(req.params.id, 'id');

      const result = await RotaEmployeeService.remove(id, business);
      res.status(200).json({
        success: true,
        message: 'Employee removed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
