import { Router } from 'express';
import {
  registerController,
  loginController,
  meController,
  updateMeController,
  uploadProfileImageController,
  setStatusController,
  deleteMeController,
  verifyBySlugController,
  lookupBySerialController,
  searchBySerialController,
  pagedSearchMembersController,
  setStatusBySerialController,
  getRestaurantOffersController,
  createDeactivationRequestController,
  myDeactivationRequestsController,
  listDeactivationRequestsController,
  acceptDeactivationRequestController,
  addLeadController,
  listMyLeadsController,
  removeLeadController,
  sendPromotionToLeadsController,
} from './member.controller';
import { requireMemberAuth } from '../../middlewares/memberAuth';
import { upload } from '../../utils/lib/sendImageToCloudinery';

export const MemberRoutes = Router();

// Public
MemberRoutes.post('/register', registerController);
MemberRoutes.post('/login', loginController);
MemberRoutes.get('/verify/:slug', verifyBySlugController);
MemberRoutes.get('/lookup/:serial', lookupBySerialController);

// Authenticated (member-only)
MemberRoutes.get('/me', requireMemberAuth, meController);
MemberRoutes.patch('/me', requireMemberAuth, updateMeController);
MemberRoutes.post(
  '/upload-profile-image',
  requireMemberAuth,
  upload.single('image'),
  uploadProfileImageController
);
MemberRoutes.patch('/me/status', requireMemberAuth, setStatusController);
MemberRoutes.delete('/me', requireMemberAuth, deleteMeController);
MemberRoutes.get('/search-by-serial', searchBySerialController);

// 🔹 NEW: paginated list + search (admin/backoffice; uses x-api-key if set)
MemberRoutes.get('/search', pagedSearchMembersController);

// 🔹 NEW: set active by serial (admin/backoffice; uses x-api-key if set)
MemberRoutes.patch('/status-by-serial', setStatusBySerialController);
MemberRoutes.get("/restaurants", getRestaurantOffersController);


// Member creates + views own deactivation requests
MemberRoutes.post('/me/deactivation-requests', requireMemberAuth, createDeactivationRequestController);
MemberRoutes.get('/me/deactivation-requests', requireMemberAuth, myDeactivationRequestsController);

// Admin/backoffice list + accept
MemberRoutes.get('/deactivation-requests', listDeactivationRequestsController); // optional x-api-key
MemberRoutes.patch('/deactivation-requests/:id/accept', acceptDeactivationRequestController); // optional x-api-key

// Leads (member-only)
MemberRoutes.post('/me/leads', addLeadController);
MemberRoutes.get('/me/leads', listMyLeadsController);
MemberRoutes.delete('/me/leads/:memberId', removeLeadController);
MemberRoutes.post(
  "/me/leads/send-promotion",
  sendPromotionToLeadsController
);
export default MemberRoutes;
