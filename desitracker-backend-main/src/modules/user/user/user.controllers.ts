import { Request, Response } from 'express';
import handleAsyncRequest from '../../../utils/handleAsyncRequest';
import sendResponse from '../../../utils/sendResponse';
import { setCookie } from '../../../utils/setCookie';
import { UserServices } from './user.services';
import AppError from '../../../errors/AppError';

// Register a User
const registerUser = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await UserServices.registerUser(req.body, req.file);
  setCookie(result.accessToken, res);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User is registered successfully!',
    data: result,
  });
});

// Get User Detail
const getUserDetails = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await UserServices.getUserDetails((req.params?.id as string));

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'User details is retrieved successfully!',
      data: result,
    });
  },
);

const getMe = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await UserServices.getUserDetails(req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User details is retrieved successfully!',
    data: result,
  });
});

// Update User
const updateUser = handleAsyncRequest(async (req: Request, res: Response) => {
  const userId = (req.params.id as string);

  // Authorization: a user can only update their own record. Admins may
  // update anyone (still no password/role through this route — stripped
  // in the service).
  if (req.user?.role !== 'admin' && String(req.user?.id) !== String(userId)) {
    throw new AppError(403, 'You can only update your own account.');
  }

  // 💡 Safe parse if needed
  let payload = req.body;

  // Check if body has 'data' field (as in your POST route)
  if (payload?.data) {
    try {
      payload = JSON.parse(payload.data);
    } catch (error) {
      console.error('Invalid JSON in req.body.data:', error);
      throw new AppError(400, 'Invalid JSON in request');
    }
  }

  console.log('Update User Payload:', payload);

  const result = await UserServices.updateUser(userId, payload);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User data is updated successfully!',
    data: result,
  });
});


// Update User  Password
const updatePassword = handleAsyncRequest(
  async (req: Request, res: Response) => {
    const result = await UserServices.updatePassword(req.user.id, req.body);

    setCookie(result.accessToken, res);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password is changed successfully!',
      data: result.user,
    });
  },
);

// Delete User
const deleteUser = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUser((req.params.id as string));

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User is deleted successfully!',
    data: result,
  });
});

// Delete own account (self-service). Owners/members can; staff cannot.
const deleteMe = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await UserServices.deleteOwnAccount(
    req.user?.id,
    req.user?.role,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your account has been deleted successfully.',
    data: result,
  });
});

// Get Users
const getUsers = handleAsyncRequest(async (req: Request, res: Response) => {
  const result = await UserServices.getUsers(req.query as any);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Users are retrieved successfully!',
    meta: result.meta,
    data: result.result,
  });
});

const savePushToken = handleAsyncRequest(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id) throw new AppError(401, 'Not authenticated');
  const { token } = req.body;
  if (!token || typeof token !== 'string') throw new AppError(400, 'token is required');
  const { User } = await import('./user.model');
  await User.findByIdAndUpdate(user.id, { expoPushToken: token });
  sendResponse(res, { success: true, statusCode: 200, message: 'Push token saved', data: null });
});

export const UserControllers = {
  registerUser,
  getUserDetails,
  updateUser,
  updatePassword,
  deleteUser,
  deleteMe,
  getUsers,
  getMe,
  savePushToken,
};
