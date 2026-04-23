import { Request, Response } from 'express';
import config from '../../../config';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { setCookie } from '../../../utils/setCookie';
import { AuthServices } from './auth.services';

// Login User
const loginUser = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  setCookie(result?.accessToken, res);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Login is successfully!',
    data: result,
  });
});

// Logout User
const logoutUser = handleAsyncRequest(async (req: Request, res: Response) => {
  res.cookie('accessToken', null, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Logout is successfully!',
    data: null,
  });
});

// Forgot Password
const forgotPassword = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password reset link is sent to your email!',
      data: result,
    });
  },
);

// Reset Password
const resetPassword = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await AuthServices.resetPassword(
      req?.params?.token,
      req?.body,
    );

    setCookie(result?.accessToken, res);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password is changed successfully!!',
      data: { accessToken: result?.accessToken },
    });
  },
);

export const AuthControllers = {
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
};
