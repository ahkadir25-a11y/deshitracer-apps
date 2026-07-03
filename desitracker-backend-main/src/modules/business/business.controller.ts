import { Request, Response } from 'express';
import httpStatus from 'http-status';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { TBusiness } from './business.interface';
import { BusinessServices } from './business.service';

const registerBusiness = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await BusinessServices.registerBusiness(req?.body);

    sendResponse<TBusiness>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Business is registered successfully',
      data: result,
    });
  },
);

const updateBusiness = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const slug = (req.params?.slug as string);
    const result = await BusinessServices.updateBusiness(
      slug,
      req?.body,
      req?.user,
    );

    sendResponse<TBusiness>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Business info is updated successfully',
      data: result,
    });
  },
);

const getAllBusiness = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await BusinessServices.getAllBusiness(query);

    sendResponse<TBusiness[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Businesses retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const getSingleBusiness = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const slug = (req.params?.slug as string);
    const result = await BusinessServices.getSingleBusiness(slug, req);

    sendResponse<TBusiness>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Business is retrieved successfully',
      data: result,
    });
  },
);

const deleteBusiness = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const slug = (req.params.slug as string);
    const result = await BusinessServices.deleteBusiness(slug, req?.user);

    sendResponse<TBusiness>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Business is deleted successfully',
      data: result,
    });
  },
);
const getAllBusinessListings = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await BusinessServices.getAllBusinessListings(query);

    sendResponse<TBusiness[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All Businesses retrieved successfully',
      meta: result.meta,
      data: result.result,
    });
  },
);

const setManagerPin = handleAsyncRequest(async (req: Request, res: Response) => {
  const { businessId, pin } = req.body || {};
  const result = await BusinessServices.setManagerPin(businessId, pin);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manager PIN saved',
    data: result,
  });
});

const verifyManagerPin = handleAsyncRequest(async (req: Request, res: Response) => {
  const { businessId, pin } = req.body || {};
  const result = await BusinessServices.verifyManagerPin(businessId, pin);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PIN verified',
    data: result,
  });
});

export const BusinessControllers = {
  registerBusiness,
  updateBusiness,
  getAllBusiness,
  getSingleBusiness,
  deleteBusiness,
  getAllBusinessListings,
  setManagerPin,
  verifyManagerPin,
};
