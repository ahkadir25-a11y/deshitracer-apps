import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { DineInServices } from './dinein.service';
import { DineInTable } from './dinein.model';
import { assertOwnsRecord } from '../../utils/lib/businessAccess';

const createTable = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await DineInServices.createTable(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Table created successfully',
    data: result,
  });
});

const getTablesByBusiness = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await DineInServices.getTablesByBusiness(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tables retrieved successfully',
    data: result,
  });
});

const updateTable = handleAsyncRequest(async (req: Request, res: Response) => {
  await assertOwnsRecord(req, await DineInTable.findById(req.params.tableId as string).select('business').lean(), 'Table not found');
  delete (req.body as any).business;
  const result = await DineInServices.updateTable(req.params.tableId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table updated successfully',
    data: result,
  });
});

const deleteTable = handleAsyncRequest(async (req: Request, res: Response) => {
  await assertOwnsRecord(req, await DineInTable.findById(req.params.tableId as string).select('business').lean(), 'Table not found');
  const result = await DineInServices.deleteTable(req.params.tableId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table removed successfully',
    data: result,
  });
});

const getFloorStatus = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await DineInServices.getFloorStatus(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Floor status retrieved successfully',
    data: result,
  });
});

export const DineInControllers = {
  createTable,
  getTablesByBusiness,
  updateTable,
  deleteTable,
  getFloorStatus,
};
