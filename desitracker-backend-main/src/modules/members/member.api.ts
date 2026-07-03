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
  savePushTokenController,
  getScanHistoryController,
} from './member.controller';
import { requireMemberAuth } from '../../middlewares/memberAuth';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
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
MemberRoutes.put('/me/push-token', requireMemberAuth, savePushTokenController);
MemberRoutes.get('/me/scan-history', requireMemberAuth, getScanHistoryController);
MemberRoutes.post(
  '/upload-profile-image',
  requireMemberAuth,
  upload.single('image'),
  uploadProfileImageController
);
MemberRoutes.patch('/me/status', requireMemberAuth, setStatusController);
MemberRoutes.delete('/me', requireMemberAuth, deleteMeController);
// Returns member PII (name + phone), so it is locked to authenticated business
// users — same as /search. The only caller (OwnerMembersScreen) is a logged-in
// owner whose Bearer token is attached automatically by the RTK baseApi.
MemberRoutes.get(
  '/search-by-serial',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  searchBySerialController,
);

// 🔹 paginated list + search. Returns member PII (name + phone), so it is
// locked to authenticated business users. All callers — AdminMembersScreen
// (RTK), WaiterTakeOrderScreen and MemberLeadsScreen (axios) — already send a
// 'Bearer <userToken>', which is exactly what auth() expects.
MemberRoutes.get(
  '/search',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  pagedSearchMembersController,
);

// 🔹 set active by serial — admin only (destructive write). Called solely by the
// admin app via RTK Query (bare token), so the general auth() middleware applies.
MemberRoutes.patch('/status-by-serial', auth(USER_ROLE.ADMIN), setStatusBySerialController);

MemberRoutes.get("/restaurants", getRestaurantOffersController);


// Member creates + views own deactivation requests
MemberRoutes.post('/me/deactivation-requests', requireMemberAuth, createDeactivationRequestController);
MemberRoutes.get('/me/deactivation-requests', requireMemberAuth, myDeactivationRequestsController);

// Admin/backoffice list + accept — admin-only (these expose member PII and
// approve account deactivations; previously the x-api-key was never enforced).
MemberRoutes.get('/deactivation-requests', auth(USER_ROLE.ADMIN), listDeactivationRequestsController);
MemberRoutes.patch('/deactivation-requests/:id/accept', auth(USER_ROLE.ADMIN), acceptDeactivationRequestController);

// Leads (member-only)
// Leads are an owner tool (the owner is an authenticated User). Require auth so
// these aren't world-open — previously anyone could read/modify any owner's
// leads and trigger promotional sends by passing an arbitrary ownerId.
const requireBizUser = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);
MemberRoutes.post('/me/leads', requireBizUser, addLeadController);
MemberRoutes.get('/me/leads', requireBizUser, listMyLeadsController);
MemberRoutes.delete('/me/leads/:memberId', requireBizUser, removeLeadController);
MemberRoutes.post(
  "/me/leads/send-promotion",
  requireBizUser,
  sendPromotionToLeadsController
);
export default MemberRoutes;
