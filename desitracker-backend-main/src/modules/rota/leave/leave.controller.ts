import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { RotaLeaveService } from './leave.service';

function requireUserId(req: Request) {
  const user = (req as any).user;
  if (!user?.id) {
    const e: any = new Error('Not authenticated');
    e.statusCode = 401;
    throw e;
  }
  return user.id as string;
}

export const RotaLeaveController = {
  createForStaff: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await RotaLeaveService.createForStaff(userId, req.body);
      res.status(201).json({ success: true, message: 'Leave request submitted', data: result });
    } catch (err) { next(err); }
  },

  listMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaLeaveService.listMine(userId, business);
      res.status(200).json({ success: true, message: 'My leaves', data: result });
    } catch (err) { next(err); }
  },

  cancelMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaLeaveService.cancelMine(userId, id, business);
      res.status(200).json({ success: true, message: 'Leave cancelled', data: result });
    } catch (err) { next(err); }
  },

  listForOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaLeaveService.listForOwner(req.query);
      res.status(200).json({ success: true, message: 'Leaves fetched', data: result });
    } catch (err) { next(err); }
  },

  decide: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaLeaveService.decide(userId, id, business, req.body);
      res.status(200).json({ success: true, message: 'Decision recorded', data: result });
    } catch (err) { next(err); }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const result = await RotaLeaveService.remove(id, business);
      res.status(200).json({ success: true, message: 'Leave removed', data: result });
    } catch (err) { next(err); }
  },

  getMyBalance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await RotaLeaveService.getMyBalance(userId, business);
      res.status(200).json({ success: true, message: 'Balance', data: result });
    } catch (err) { next(err); }
  },

  getOwnerBalances: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RotaLeaveService.getOwnerBalances(req.query);
      res.status(200).json({ success: true, message: 'Balances', data: result });
    } catch (err) { next(err); }
  },
};
