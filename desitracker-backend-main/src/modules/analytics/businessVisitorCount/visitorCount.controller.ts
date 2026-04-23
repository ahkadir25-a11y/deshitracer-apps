import { Request, Response } from 'express';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { VisitorCountServices } from './visitorCount.service';

const getBusinessAnalytics = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { businessId } = req?.params;
    const result = await VisitorCountServices.getBusinessAnalytics(
      businessId,
      req.query,
    );

    sendResponse<any>(res, {
      success: true,
      statusCode: 200,
      message: 'Business Visitor analytics retrieved successfully!',
      data: result,
    });
  },
);

const getAdminAnalytics = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await VisitorCountServices.getAdminAnalytics(req.query);

    sendResponse<any>(res, {
      success: true,
      statusCode: 200,
      message: 'Business Visitor analytics retrieved successfully!',
      data: result,
    });
  },
);
// 🆕 Add this!
const addToVisitorCount = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const result = await VisitorCountServices.addToVisitorCount(businessId, req);

    sendResponse<any>(res, {
      success: true,
      statusCode: 201,
      message: 'Visitor count updated successfully!',
      data: result,
    });
  },
);

const getMemberVisitHistory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const memberId = (req as any).member?.id;
    const result = await VisitorCountServices.getMemberVisitHistory(memberId);

    sendResponse<any>(res, {
      success: true,
      statusCode: 200,
      message: 'Member visit history retrieved successfully!',
      data: result,
    });
  },
);

export const VisitorCountControllers = {
  getBusinessAnalytics,
  getAdminAnalytics,
  addToVisitorCount,
  getMemberVisitHistory,
};
