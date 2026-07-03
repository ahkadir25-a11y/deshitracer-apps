import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { NotificationServices } from './notification.service';
import httpStatus from 'http-status';

const getNotifications = handleAsyncRequest(async (req: Request, res: Response) => {
  const businessId = req.params.businessId;
  const result = await NotificationServices.getNotifications(businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const markAsRead = handleAsyncRequest(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NotificationServices.markAsRead(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = handleAsyncRequest(async (req: Request, res: Response) => {
  const businessId = req.params.businessId;
  const result = await NotificationServices.markAllAsRead(businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

export const NotificationControllers = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
