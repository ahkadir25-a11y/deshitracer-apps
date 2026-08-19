import { Request, Response } from 'express';
import catchAsync from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { TableServices } from './table.service';

const createTable = catchAsync(async (req: Request, res: Response) => {
  const business_id = req.body.business_id || req.user?.business_id;
  const result = await TableServices.createTable(business_id, req.body, {
    id: req.user?.id as string,
    role: req.user?.role as string,
  });

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

const updateTable = catchAsync(async (req: Request, res: Response) => {
  const result = await TableServices.updateTable(
    req.user?.id as string,
    req.user?.role as string,
    req.params.id as string,
    { tableNo: req.body?.tableNo, capacity: req.body?.capacity },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Table updated successfully',
    data: result,
  });
});

const deleteTable = catchAsync(async (req: Request, res: Response) => {
  // Ownership is resolved from the table's own business_id inside the service
  // — the JWT does not carry business_id.
  const result = await TableServices.deleteTable(
    req.user?.id as string,
    req.user?.role as string,
    req.params.id as string,
  );

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
  updateTable,
  deleteTable,
};
