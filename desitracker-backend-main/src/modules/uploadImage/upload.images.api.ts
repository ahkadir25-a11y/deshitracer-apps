import { Router } from 'express';
import { authAnySignedIn } from '../../utils/lib/businessAccess';
import { upload } from '../../utils/lib/sendImageToCloudinery';
import { UploadImageControllers } from './upload.image.controller';

const router = Router();

// The controller is identity-agnostic — it uploads to a Cloudinary folder and
// returns a URL, with no record ownership to check — so any signed-in caller
// may use it. Staff, owners and admins upload here; so do members, saving a
// profile photo or business cover. Previously restricted to
// auth(ADMIN, BUSINESS_OWNER, STAFF), which ran a member's token through the
// Users-table lookup and failed every member upload with "This user is not
// found".
router.post(
  '/:folder',
  authAnySignedIn,
  upload.array('file'),
  UploadImageControllers.uploadMultipleImages,
);

export const UploadRoutes = router;
