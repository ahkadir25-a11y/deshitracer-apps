import { Request, Response } from 'express';
import catchAsync from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { TableServices } from './table.service';

const createTable = catchAsync(async (req: Request, res: Response) => {
  const business_id = req.user?.business_id || req.body.business_id; // Depend on your auth structure
  const result = await TableServices.createTable(business_id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Table created successfully',
    data: result,
  });
});

const getBusinessTables = catchAsync(async (req: Request, res: Response) => {
  const business_id = (req.params.businessId as string);
  const result = await TableServices.getBusinessTables(business_id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tables retrieved successfully',
    data: result,
  });
});

const deleteTable = catchAsync(async (req: Request, res: Response) => {
  const business_id = req.user?.business_id || req.body.business_id; // Or extract from decoded token properly
  const result = await TableServices.deleteTable(business_id, (req.params.id as string));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Table deleted successfully',
    data: result,
  });
});

export const TableControllers = {
  createTable,
  getBusinessTables,
  deleteTable,
};
