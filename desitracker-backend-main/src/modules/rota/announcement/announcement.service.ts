import { FilterQuery } from 'mongoose';
import AppError from '../../../errors/AppError';
import { Announcement } from './announcement.model';
import { IAnnouncement } from './announcement.interface';
import { RotaUtils } from '../rota.utils';

export const AnnouncementService = {
  // OWNER — Create a new announcement for staff at this business.
  async create(userId: string, payload: any) {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const title = RotaUtils.requireString(payload?.title, 'title');
    const body = RotaUtils.requireString(payload?.body, 'body');
    const pinned = payload?.pinned === true || payload?.pinned === 'true';
    const expiresAt = payload?.expiresAt ? RotaUtils.parseDate(payload.expiresAt, 'expiresAt') : null;

    const doc = await Announcement.create({
      business,
      author: userId,
      title,
      body,
      pinned,
      expiresAt,
      readBy: [],
    });
    return doc;
  },

  // OWNER + STAFF — List announcements for a business. Filters out expired.
  async list(query: any) {
    const business = RotaUtils.requireObjectId(query?.business, 'business');
    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 30, maxLimit: 100 });

    const now = new Date();
    const filter: FilterQuery<IAnnouncement> = {
      business,
      isDeleted: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    const [data, total] = await Promise.all([
      Announcement.find(filter)
        .populate('author', 'name email')
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    return { meta: { page, limit, total }, data };
  },

  // STAFF — Mark an announcement read for THIS user.
  async markRead(userId: string, id: string, business: string) {
    const doc = await Announcement.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { $addToSet: { readBy: userId } },
      { new: true },
    );
    if (!doc) throw new AppError(404, 'Announcement not found');
    return doc;
  },

  // STAFF — Unread count for this user. Drives the bell badge.
  async unreadCount(userId: string, business: string) {
    const now = new Date();
    const count = await Announcement.countDocuments({
      business,
      isDeleted: false,
      readBy: { $ne: userId },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    });
    return { count };
  },

  // OWNER — Edit an announcement (title/body/pinned/expiresAt).
  async update(id: string, business: string, payload: any) {
    const doc = await Announcement.findOne({ _id: id, business, isDeleted: false });
    if (!doc) throw new AppError(404, 'Announcement not found');

    if (payload?.title !== undefined) doc.title = RotaUtils.requireString(payload.title, 'title');
    if (payload?.body !== undefined) doc.body = RotaUtils.requireString(payload.body, 'body');
    if (payload?.pinned !== undefined) doc.pinned = !!payload.pinned;
    if (payload?.expiresAt !== undefined) {
      doc.expiresAt = payload.expiresAt ? RotaUtils.parseDate(payload.expiresAt, 'expiresAt') : null;
    }
    await doc.save();
    return doc;
  },

  // OWNER — Soft delete.
  async remove(id: string, business: string) {
    const doc = await Announcement.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true },
      { new: true },
    );
    if (!doc) throw new AppError(404, 'Announcement not found');
    return doc;
  },
};
