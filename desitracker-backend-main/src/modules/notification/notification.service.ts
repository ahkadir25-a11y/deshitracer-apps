import AppError from '../../errors/AppError';
import { Notification } from './notification.model';
import { TNotification } from './notification.interface';
import httpStatus from 'http-status';

const createNotification = async (payload: Partial<TNotification>) => {
  const result = await Notification.create(payload);
  return result;
};

// What this viewer is allowed to see: anything not addressed to someone else,
// and anything for their side of the business. Rows written before targeting
// existed have neither field and stay visible to everyone.
const visibleTo = (businessId: string, viewer: { id?: string; role?: string }) => {
  const isOwner = viewer?.role === 'business_owner' || viewer?.role === 'admin';
  return {
    business: businessId,
    $and: [
      { $or: [{ user: null }, { user: { $exists: false } }, { user: viewer?.id }] },
      {
        $or: [
          { audience: null },
          { audience: { $exists: false } },
          { audience: 'ALL' },
          { audience: isOwner ? 'OWNER' : 'STAFF' },
        ],
      },
    ],
  };
};

const getNotifications = async (
  businessId: string,
  viewer: { id?: string; role?: string } = {},
) => {
  const notifications = await Notification.find(visibleTo(businessId, viewer))
    .sort({ createdAt: -1 })
    .limit(50);
  return notifications;
};

const markAsRead = async (notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  return notification;
};

// Only what this viewer can actually see. Marking every row in the business
// read from a staff account would otherwise clear the owner's badge too.
const markAllAsRead = async (
  businessId: string,
  viewer: { id?: string; role?: string } = {},
) => {
  const result = await Notification.updateMany(
    { ...visibleTo(businessId, viewer), isRead: false },
    { isRead: true }
  );
  return result;
};

export const NotificationServices = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
