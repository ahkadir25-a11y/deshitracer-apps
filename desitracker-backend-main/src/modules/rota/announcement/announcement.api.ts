import express from 'express';
import auth from '../../../middlewares/auth';
import { AnnouncementController } from './announcement.controller';

const router = express.Router();

// Read — both staff and owner.
router.get(
  '/',
  auth('staff', 'business_owner', 'admin'),
  AnnouncementController.list,
);

router.get(
  '/unread-count',
  auth('staff', 'business_owner', 'admin'),
  AnnouncementController.unreadCount,
);

router.post(
  '/:id/read',
  auth('staff', 'business_owner', 'admin'),
  AnnouncementController.markRead,
);

// Write — owner only.
router.post(
  '/',
  auth('business_owner', 'admin'),
  AnnouncementController.create,
);

router.patch(
  '/:id',
  auth('business_owner', 'admin'),
  AnnouncementController.update,
);

router.delete(
  '/:id',
  auth('business_owner', 'admin'),
  AnnouncementController.remove,
);

export const AnnouncementRoutes = router;
