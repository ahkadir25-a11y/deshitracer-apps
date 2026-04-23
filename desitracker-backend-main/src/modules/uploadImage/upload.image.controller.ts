import { Request, Response } from 'express';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import { sendImagesToCloudinary } from '../../utils/lib/sendImageToCloudinery';
import sendResponse from '../../utils/sendResponse';

const uploadMultipleImages = handleAsyncRequest(
  async (req: Request, res: Response) => {
    // console.log('uploadMultipleImages controller called');
    const files = req.files as Express.Multer.File[];
    // console.log('Number of files received:', files ? files.length : 0);

    const result = await sendImagesToCloudinary(files, req.params?.folder);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Images uploaded successfully',
      data: result,
    });
  },
);

export const UploadImageControllers = {
  uploadMultipleImages,
};
