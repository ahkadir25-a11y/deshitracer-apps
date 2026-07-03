import { NextFunction, Request, Response } from 'express';
import { RotaUtils } from '../rota.utils';
import { AnnouncementService } from './announcement.service';

function requireUserId(req: Request) {
  const user = (req as any).user;
  if (!user?.id) {
    const e: any = new Error('Not authenticated');
    e.statusCode = 401;
    throw e;
  }
  return user.id as string;
}

export const AnnouncementController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const result = await AnnouncementService.create(userId, req.body);
      res.status(201).json({ success: true, message: 'Announcement posted', data: result });
    } catch (err) { next(err); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AnnouncementService.list(req.query);
      res.status(200).json({
        success: true,
        message: 'Announcements fetched',
        meta: result.meta,
        data: result.data,
      });
    } catch (err) { next(err); }
  },

  markRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await AnnouncementService.markRead(userId, id, business);
      res.status(200).json({ success: true, message: 'Marked as read', data: result });
    } catch (err) { next(err); }
  },

  unreadCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserId(req);
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await AnnouncementService.unreadCount(userId, business);
      res.status(200).json({ success: true, message: 'Unread count', data: result });
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await AnnouncementService.update(id, business, req.body);
      res.status(200).json({ success: true, message: 'Announcement updated', data: result });
    } catch (err) { next(err); }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = RotaUtils.requireObjectId((req.params.id as string), 'id');
      const business = RotaUtils.requireObjectId(req.query.business, 'business');
      const result = await AnnouncementService.remove(id, business);
      res.status(200).json({ success: true, message: 'Announcement deleted', data: result });
    } catch (err) { next(err); }
  },
};
