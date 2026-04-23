import config from '../../../config';
import AppError from '../../../errors/AppError';
import { JwtHelpers, TJwtPayload } from '../../../utils/jwt';
import { sendImageToCloudinary } from '../../../utils/lib/sendImageToCloudinery';
import { sendImageToCloudinary2 } from '../../../utils/lib/uploadToSpace';
import QueryBuilder from '../../../utils/queryBuilder';
import removePhoneNumberIndex from './removeIndex';
import { TChangePassword, TUser } from './user.interface';
import { User } from './user.model';

// Register a User
const registerUser = async (payload: TUser, image: any) => {
  // ⚠️ Don't call removePhoneNumberIndex() here unless absolutely necessary
  const { profilePic, ...remaining } = payload;
  const userData: any = { ...remaining };

  if (payload?.role) {
    userData.role = payload.role;
    if (payload.role === 'admin') {
      userData.userStatus = 'verified';
    }
  }

  if (payload.email) {
    userData.email = payload.email.toLowerCase();
  }
  if (image) {
    const imageName = `${userData?.email}-${new Date()}`;
    const path = image?.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path, 'web_user');
    userData.profilePic = secure_url as string;
  }

  await removePhoneNumberIndex();
  const result = await User.create(userData);


  const jwtPayloadData: TJwtPayload = {
    id: result._id.toString(),
    role: result.role,
    email: result.email,
  };

  const accessToken = JwtHelpers.createToken(
    jwtPayloadData,
    config.jwt.accessSecret as string,
    config.jwt.accessExpiresIn,
  );

  return {
    user: result,
    accessToken,
  };
};


// Get User Detail
const getUserDetails = async (userId: string) => {
  const result = await User.findById(userId);

  if (!result) {
    throw new AppError(404, 'User is not found!');
  }

  return result;
};

// Update User
const updateUser = async (userId: string, payload: Partial<TUser>) => {
  try {
    const userData = { ...payload, profilePic: payload?.profilePicUrl };
    console.log(userData);

    const result = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(404, 'User is not found!');
    }

    return result;
  } catch (error) {
    // Handle specific errors (optional)
    console.error('Error updating user:', error);
    throw error; // Re-throw error for upstream handling
  }
};

// Update User  Password
const updatePassword = async (userId: string, payload: TChangePassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError(403, 'Un authorized access');
  }

  const isPasswordMatched = await User.comparePassword(
    payload.oldPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(400, 'Old password is incorrect');
  }

  if (payload.newPassword !== payload.confirmPassword) {
    throw new AppError(400, 'password does not match');
  }

  user.password = payload.newPassword;

  await user.save();

  const jwtPayloadData: TJwtPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = JwtHelpers.createToken(
    jwtPayloadData,
    config.jwt.accessSecret as string,
    config.jwt.accessExpiresIn,
  );

  return {
    user,
    accessToken,
  };
};

// Delete User
const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError(404, 'User is not found!');
  }

  return user;
};

// Get Users
const getUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder<TUser>(
    User.find({ isDeleted: false }),
    query,
  )
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fieldsLimit();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const UserServices = {
  registerUser,
  getUserDetails,
  updateUser,
  updatePassword,
  deleteUser,
  getUsers,
};
