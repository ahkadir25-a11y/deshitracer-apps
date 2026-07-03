import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { DineInServices } from './dinein.service';

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
  const result = await DineInServices.updateTable(req.params.tableId as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Table updated successfully',
    data: result,
  });
});

const deleteTable = handleAsyncRequest(async (req: Request, res: Response) => {
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
