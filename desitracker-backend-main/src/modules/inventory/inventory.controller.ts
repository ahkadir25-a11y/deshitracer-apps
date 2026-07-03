import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { InventoryServices } from './inventory.service';

const createIngredient = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await InventoryServices.createIngredient(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ingredient created successfully',
    data: result,
  });
});

const getIngredientsByBusiness = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await InventoryServices.getIngredientsByBusiness(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ingredients retrieved successfully',
    data: result,
  });
});

const adjustStock = handleAsyncRequest(async (req: Request, res: Response) => {
  const { ingredientId, businessId, actionType, amount, notes } = req.body;
  const result = await InventoryServices.adjustStock(
    ingredientId,
    businessId,
    actionType,
    amount,
    notes,
    req.user
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock adjusted successfully',
    data: result,
  });
});

const getStockHistory = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await InventoryServices.getStockHistory(req.params.businessId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock history retrieved successfully',
    data: result,
  });
});

const updateIngredient = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await InventoryServices.updateIngredient(req.params.ingredientId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ingredient updated successfully',
    data: result,
  });
});

const deleteIngredient = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await InventoryServices.deleteIngredient(req.params.ingredientId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ingredient deleted successfully',
    data: result,
  });
});

export const InventoryControllers = {
  createIngredient,
  getIngredientsByBusiness,
  adjustStock,
  getStockHistory,
  updateIngredient,
  deleteIngredient
};
