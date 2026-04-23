import { Request, Response } from 'express';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { ContactCountServices } from './contactCount.service';

const addContactCount = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { businessId } = req?.params;
    const result = await ContactCountServices.addContactCount(
      businessId,
      req?.body,
    );

    sendResponse<any>(res, {
      success: true,
      statusCode: 200,
      message: 'Business Contact Count added successfully!',
      data: result,
    });
  },
);

const getContactAnalytics = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { businessId } = req?.params;
    const result = await ContactCountServices.getContactAnalytics(
      businessId,
      req?.query,
    );

    sendResponse<any>(res, {
      success: true,
      statusCode: 200,
      message: 'Business Contact Count Analytics retrieved successfully!',
      data: result,
    });
  },
);

export const ContactCountControllers = {
  addContactCount,
  getContactAnalytics,
};
