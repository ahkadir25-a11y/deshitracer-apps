import { NextFunction, Request, Response, Router } from 'express';
import auth from '../../../middlewares/auth';
import { upload } from '../../../utils/lib/sendImageToCloudinery';
import { USER_ROLE } from '../auth/auth.constants';
import { UserControllers } from './user.controllers';
import { upload2 } from '../../../utils/lib/uploadToSpace';

const router = Router();

router.post(
  '/register',
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('bor ouch');
    req.body = JSON.parse(req?.body?.data);
    next();
  },

  UserControllers.registerUser,
);

router.get(
  '/me',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.getMe,
);

// Admin-only: full user listing exposes emails/phones (PII) — must never be public.
router.get('/', auth(USER_ROLE.ADMIN), UserControllers.getUsers);

// Any signed-in user may fetch a user by id (website business form needs it),
// but anonymous access is blocked — the payload contains email/phone (PII).
router.get(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.getUserDetails,
);

router.put(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.updateUser,
);


// Self-service account deletion — must be declared BEFORE '/:id' so that
// 'me' is not captured as a user id. Owners & members can delete their own
// account; staff are blocked in the service (employer-managed).
router.delete(
  '/me',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.deleteMe,
);

router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN),
  UserControllers.deleteUser,
);

// Owner/staff saves their Expo push token.
router.put(
  '/me/push-token',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.savePushToken,
);

// Secure self-service password change — requires the CURRENT password
// (oldPassword) so a stolen unlocked device can't silently change it. This is
// the App Store / Play Store compliant flow, separate from forgot-password.
router.put(
  '/me/change-password',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  UserControllers.updatePassword,
);

export const UserRoutes = router;
