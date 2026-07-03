import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { ActivityServices } from './activity.service';

const logActivity = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await ActivityServices.logActivity(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Activity logged',
    data: result,
  });
});

const getActivityByBusiness = handleAsyncRequest(async (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const result = await ActivityServices.getActivityByBusiness(req.params.businessId as string, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity feed retrieved',
    data: result,
  });
});

const getOwnerDashboardStats = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await ActivityServices.getOwnerDashboardStats(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats retrieved',
    data: result,
  });
});

export const ActivityControllers = {
  logActivity,
  getActivityByBusiness,
  getOwnerDashboardStats,
};
