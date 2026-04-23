import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { SubCategoryServices } from './subcategogy.service';

// Create SubCategory
const createSubcategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SubCategoryServices.createSubcategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: 'Subcategory created successfully!',
      data: result,
    });
  },
);

// Get all SubCategories
const getAllSubcategories = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { result, meta } = await SubCategoryServices.getAllSubcategories(
      req?.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Subcategories retrieved successfully!',
      meta,
      data: result,
    });
  },
);

// Get SubCategory by Slug
const getSingleSubcategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SubCategoryServices.getSingleSubcategory(
      req.params?.slug,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Subcategory retrieved successfully!',
      data: result,
    });
  },
);

// Update SubCategory by Slug
const updateSubcategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SubCategoryServices.updateSubcategory(
      req.params?.slug,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Subcategory updated successfully!',
      data: result,
    });
  },
);

// Delete SubCategory by Slug
const deleteSubcategory = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SubCategoryServices.deleteSubcategory(
      req.params?.slug,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Subcategory deleted successfully!',
      data: result,
    });
  },
);

export const SubCategoryControllers = {
  createSubcategory,
  getAllSubcategories,
  getSingleSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
