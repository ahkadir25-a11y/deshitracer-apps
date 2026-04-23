import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { TReview } from './review.interface';
import { ReviewServices } from './review.service';

const createReview = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await ReviewServices.createReview(req.body);

  sendResponse<TReview>(res, {
    success: true,
    statusCode: 201,
    message: 'Review created successfully!',
    data: result,
  });
});

const getAllBusinessReviews = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const { businessId } = req?.params;
    const result = await ReviewServices.getAllBusinessReviews(
      businessId,
      req.query,
    );

    const { reviews, meta } = result;
    sendResponse<TReview[]>(res, {
      success: true,
      statusCode: 200,
      message: 'Business Reviews retrieved successfully!',
      meta,
      data: reviews,
    });
  },
);

const getAllReviews = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await ReviewServices.getAllReviews(req.query);

    const { reviews, meta } = result;

    sendResponse<TReview[]>(res, {
      success: true,
      statusCode: 200,
      message: 'Reviews retrieved successfully!',
      data: reviews,
      meta,
    });
  },
);

const getSingleReview = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await ReviewServices.getSingleReview(req?.params?.reviewId);

    sendResponse<TReview>(res, {
      success: true,
      statusCode: 200,
      message: 'Review retrieved successfully!',
      data: result,
    });
  },
);

const updateReviewVisibility = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await ReviewServices.updateReviewVisibility(
      req.params?.reviewId,
      req.body?.show,
    );
    sendResponse<TReview>(res, {
      success: true,
      statusCode: 200,
      message: 'Review visibility updated successfully!',
      data: result,
    });
  },
);

const updateReviewByReviewer = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await ReviewServices.updateReviewByReviewer(
      req.params?.reviewId,
      req.body,
    );
    sendResponse<TReview>(res, {
      success: true,
      statusCode: 200,
      message: 'Your Review data updated successfully!',
      data: result,
    });
  },
);

export const ReviewControllers = {
  createReview,
  getAllBusinessReviews,
  getAllReviews,
  getSingleReview,
  updateReviewVisibility,
  updateReviewByReviewer,
};
