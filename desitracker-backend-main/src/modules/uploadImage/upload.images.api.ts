import { Router } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/lib/sendImageToCloudinery';
import { USER_ROLE } from '../user/auth/auth.constants';
import { UploadImageControllers } from './upload.image.controller';

const router = Router();

router.post(
  '/:folder',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  upload.array('file'),
  UploadImageControllers.uploadMultipleImages,
);

export const UploadRoutes = router;
