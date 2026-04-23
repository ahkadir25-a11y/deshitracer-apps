import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';
import { TTestimonial } from './testimonial.interface';
import { TestimonialServices } from './testimonial.service';

const createTestimonial = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const user = req?.user;

    const result = await TestimonialServices.createTestimonial(req.body, user);

    sendResponse<TTestimonial>(res, {
      success: true,
      statusCode: 201,
      message: 'Testimonial created successfully!',
      data: result,
    });
  },
);

const getAllTestimonials = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await TestimonialServices.getAllTestimonials(req.query);

    const { testimonials, meta } = result;

    sendResponse<TTestimonial[]>(res, {
      success: true,
      statusCode: 200,
      message: 'Testimonials retrieved successfully!',
      data: testimonials,
      meta,
    });
  },
);

const getSingleTestimonial = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await TestimonialServices.getSingleTestimonial(
      req?.params?.testimonialId,
    );

    sendResponse<TTestimonial>(res, {
      success: true,
      statusCode: 200,
      message: 'Testimonial retrieved successfully!',
      data: result,
    });
  },
);

const updateTestimonialVisibility = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await TestimonialServices.updateTestimonialVisibility(
      req.params?.testimonialId,
      req.body?.show,
    );
    sendResponse<TTestimonial>(res, {
      success: true,
      statusCode: 200,
      message: 'Testimonial visibility updated successfully!',
      data: result,
    });
  },
);

const updateTestimonialByProvider = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await TestimonialServices.updateTestimonialByProvider(
      req.params?.testimonialId,
      req.body,
      req?.user,
    );
    sendResponse<TTestimonial>(res, {
      success: true,
      statusCode: 200,
      message: 'Your Testimonial data updated successfully!',
      data: result,
    });
  },
);

export const TestimonialControllers = {
  createTestimonial,
  getAllTestimonials,
  getSingleTestimonial,
  updateTestimonialVisibility,
  updateTestimonialByProvider,
};
