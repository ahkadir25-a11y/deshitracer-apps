import { Request, Response } from 'express';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { BannerServices } from './banner.services';

// Create a new banner
const createBanner = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await BannerServices.createBanner(req.file);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Banner created successfully!',
    data: result,
  });
});

// Get all banners
const getAllBanners = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await BannerServices.getAllBanners();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Banners retrieved successfully!',
      data: result,
    });
  },
);

// Get a single banner by ID
const getSingleBanner = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await BannerServices.getSingleBanner(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Banner retrieved successfully!',
      data: result,
    });
  },
);

// Update a banner
// const updateBanner = handleAsyncRequest(async (req: Request, res: Response) => {
//   const result = await BannerServices.updateBanner(
//     req.params.id,
//     req.body,
//     req.file,
//   );
//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Banner updated successfully!',
//     data: result,
//   });
// });

// Delete a banner
const deleteBanner = handleAsyncRequest(async (req: Request, res: Response) => {
  await BannerServices.deleteBanner(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Banner deleted successfully!',
    data: null,
  });
});

export const BannerControllers = {
  createBanner,
  getAllBanners,
  getSingleBanner,
  deleteBanner,
};
