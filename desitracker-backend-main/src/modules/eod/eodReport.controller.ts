import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { EODServices } from './eodReport.service';

const submitEODReport = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await EODServices.submitEODReport(req.body, req.user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'EOD Report submitted successfully',
    data: result,
  });
});

const getEODReportsByBusiness = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await EODServices.getEODReportsByBusiness(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'EOD Reports retrieved successfully',
    data: result,
  });
});

export const EODControllers = {
  submitEODReport,
  getEODReportsByBusiness
};
