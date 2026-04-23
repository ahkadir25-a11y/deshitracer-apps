import { Request, Response } from 'express';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { SliderServices } from './slider.services';

const createSlider = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await SliderServices.createSlider(req.body, req.file);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Slider created successfully!',
    data: result,
  });
});

const getAllSliders = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SliderServices.getAllSliders();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Sliders retrieved successfully!',
      data: result,
    });
  },
);

const getSingleSlider = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await SliderServices.getSingleSlider(req.params.id);
    // console.log({ result });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Slider retrieved successfully!',
      data: result,
    });
  },
);

const deleteSlider = handleAsyncRequest(async (req: Request, res: Response) => {
  await SliderServices.deleteSlider(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Slider deleted successfully!',
    data: null,
  });
});

export const SliderControllers = {
  createSlider,
  getAllSliders,
  getSingleSlider,
  deleteSlider,
};
