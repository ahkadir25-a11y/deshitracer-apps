import AppError from '../../errors/AppError';
import { Notification } from './notification.model';
import { TNotification } from './notification.interface';
import httpStatus from 'http-status';

const createNotification = async (payload: Partial<TNotification>) => {
  const result = await Notification.create(payload);
  return result;
};

const getNotifications = async (businessId: string) => {
  const notifications = await Notification.find({ business: businessId })
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

const markAllAsRead = async (businessId: string) => {
  const result = await Notification.updateMany(
    { business: businessId, isRead: false },
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
