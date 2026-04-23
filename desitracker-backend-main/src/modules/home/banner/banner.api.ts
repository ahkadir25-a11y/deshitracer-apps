import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { upload } from '../../../utils/lib/sendImageToCloudinery';
import { USER_ROLE } from '../../user/auth/auth.constants';
import { BannerControllers } from './banner.controllers';

const router = Router();

// Create a new banner
router.post(
  '/create',
  auth(USER_ROLE.ADMIN),
  upload.single('file'),
  BannerControllers.createBanner,
);

// Get all banners
router.get('/all', BannerControllers.getAllBanners);

// Delete a banner
router.delete(
  '/delete/:id',
  auth(USER_ROLE.ADMIN),
  BannerControllers.deleteBanner,
);

// Get a single banner by ID
router.get('/:id', BannerControllers.getSingleBanner);

export const BannerRoutes = router;
