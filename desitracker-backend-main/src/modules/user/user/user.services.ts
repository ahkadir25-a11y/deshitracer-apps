import config from '../../../config';
import AppError from '../../../errors/AppError';
import { JwtHelpers, TJwtPayload } from '../../../utils/jwt';
import { sendImageToCloudinary } from '../../../utils/lib/sendImageToCloudinery';
import { sendImageToCloudinary2 } from '../../../utils/lib/uploadToSpace';
import QueryBuilder from '../../../utils/queryBuilder';
import { TChangePassword, TUser } from './user.interface';
import { User } from './user.model';
import { cleanupUserRelations } from '../../../utils/lib/cascadeCleanup';

// Register a User
const registerUser = async (payload: TUser, image: any) => {
  // ⚠️ Don't call removePhoneNumberIndex() here unless absolutely necessary
  const { profilePic, ...remaining } = payload;
  const userData: any = { ...remaining };

  // Role policy for PUBLIC self-registration:
  //   - 'user' (member) and 'business_owner' may self-register.
  //   - 'staff' accounts are ONLY created via the employer's invite flow
  //     (rota/employees/accept-invite) — never here.
  //   - 'admin' can never be self-assigned from an unauthenticated endpoint.
  const requestedRole = String(payload?.role || 'user');
  if (requestedRole === 'staff') {
    throw new AppError(
      403,
      'Staff accounts are created by your employer. Ask your business owner for an invite instead of registering here.',
    );
  }
  if (requestedRole !== 'user' && requestedRole !== 'business_owner') {
    throw new AppError(403, 'This account type cannot be self-registered.');
  }
  userData.role = requestedRole;

  if (payload.email) {
    userData.email = payload.email.toLowerCase();
  }

  // One email = one account (and one role). Explain which kind of account the
  // email is already tied to, instead of surfacing a raw duplicate-key error.
  // In particular: a STAFF email can never be reused to create an owner account.
  if (userData.email) {
    const existing = await User.findOne({ email: userData.email });
    if (existing && !existing.isDeleted) {
      const roleLabel =
        existing.role === 'business_owner' ? 'Business Owner'
        : existing.role === 'staff' ? 'Staff'
        : existing.role === 'admin' ? 'Admin'
        : 'Member';
      if (existing.role === 'staff') {
        throw new AppError(
          409,
          'This email belongs to a Staff account managed by an employer, so it cannot be used to create a new account. Please use a different email address.',
        );
      }
      throw new AppError(
        409,
        `This email is already registered as a ${roleLabel} account. Please sign in instead, or use a different email address.`,
      );
    }
  }
  if (image) {
    const imageName = `${userData?.email}-${new Date()}`;
    const path = image?.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path, 'web_user');
    userData.profilePic = secure_url as string;
  }

  // NOTE: the stale unique `phone_1` index (if any) is dropped once at server
  // startup, not per-registration — see main() in server.ts.
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
const updateUser = async (userId: string, payload: Partial<TUser> & { currentPassword?: string }) => {
  try {
    // Security: changing email requires the current password. Without this,
    // a stolen session lets an attacker swap the email and take over the
    // account via forgot-password.
    const existing = await User.findById(userId).select('+password +email');
    if (!existing) throw new AppError(404, 'User is not found!');

    const wantsEmailChange =
      typeof payload.email === 'string' &&
      payload.email.toLowerCase() !== (existing.email || '').toLowerCase();

    if (wantsEmailChange) {
      const current = payload.currentPassword;
      if (!current) {
        throw new AppError(401, 'Current password is required to change your email.');
      }
      const bcrypt = await import('bcrypt');
      const ok = await bcrypt.compare(current, (existing as any).password || '');
      if (!ok) throw new AppError(401, 'Current password is incorrect.');
    }

    // Strip the proof so we never persist it on the user doc.
    // Also strip `password` and `role` — password changes must go through the
    // dedicated change-password flow (which requires oldPassword), and role
    // must not be self-elevated via this endpoint.
    const { currentPassword, password, role, ...rest } = payload as any;
    const userData: any = { ...rest, profilePic: (payload as any)?.profilePicUrl };

    const result = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(404, 'User is not found!');
    }

    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
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

// Delete User — hard delete: row is removed from the collection so the
// email becomes available again. Old soft-delete behavior left the row
// (with isDeleted:true) and the unique email index still blocked re-signups.
const deleteUser = async (userId: string) => {
  // Make sure the user exists before we touch anything related to them.
  const existing = await User.findById(userId);
  if (!existing) {
    throw new AppError(404, 'User is not found!');
  }

  // Cascade-clean what this user leaves behind: any businesses they own (and
  // everything under those businesses) plus any staff records linked to them.
  // This prevents orphaned Business.owner / RotaEmployee.user references.
  await cleanupUserRelations(userId);

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError(404, 'User is not found!');
  }

  return user;
};

// Self-service account deletion — the logged-in user deletes their OWN account.
// Required by Apple App Store & Google Play for any self-created account.
//
// Staff are an exception: their account is created and managed by their
// employer (the business owner), so they CANNOT self-delete. The owner removes
// them from the team instead. Both stores explicitly allow this for
// organization-managed accounts.
const deleteOwnAccount = async (userId: string, role?: string) => {
  if (role === 'staff') {
    throw new AppError(
      403,
      'Your staff account is managed by your employer. Please contact your business owner to remove your account.',
    );
  }
  return deleteUser(userId);
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
  deleteOwnAccount,
  getUsers,
};
