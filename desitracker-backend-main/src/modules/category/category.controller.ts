import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { CategoryServices } from './category.service';

const createCategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await CategoryServices.createCategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: 'Category created successfully!',
      data: result,
    });
  },
);

const getAllCategories = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { result, meta } = await CategoryServices.getAllCategories(
      req?.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Categories retrieved successfully!',
      meta: meta,
      data: result,
    });
  },
);

const getSingleCategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const result = await CategoryServices.getSingleCategory(slug);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Category retrieved successfully!',
      data: result,
    });
  },
);

const updateCategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const result = await CategoryServices.updateCategory(slug, req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Category updated successfully!',
      data: result,
    });
  },
);

const deleteCategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const result = await CategoryServices.deleteCategory(slug);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Category deleted successfully!',
      data: result,
    });
  },
);

export const CategoryControllers = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
