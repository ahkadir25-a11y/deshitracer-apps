import { getCookie } from "@/app/utils/cookie";
import baseApi from "../baseApi";

/** ---------- Types ---------- */
export interface MemberDTO {
  id: string;
  name: string;
  phone: string;
  city?: string;
  serialNumber: string;
  qrCodeUrl?: string;
  active: boolean;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
  member: MemberDTO;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  city?: string;
  email?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface UpdateMePayload {
  name?: string;
  phone?: string;
  city?: string;
}

export interface VerifyResult {
  valid: boolean;
  name?: string;
  phone?: string;
  serialNumber?: string;
  verification?: string;
}

export interface LookupResult {
  name: string;
  phone: string;
  serialNumber: string;
  verification: string;
  printable: boolean;
}

/** PUBLIC search-by-serial result */
export interface SearchBySerialResult {
  id: string;
  serialNumber: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
  membershipStatus: "Valid Member" | "Inactive Member";
}

/** ---------- Admin/backoffice member list ---------- */
export interface MemberListItem {
  serialNumber: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
  active: boolean;
  membershipStatus: "Valid Member" | "Inactive Member";
}
export interface PagedMembersResponse {
  items: MemberListItem[];
  page: number;
  limit: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}
export interface SetStatusBySerialResult {
  serialNumber: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
  active: boolean;
  membershipStatus: "Valid Member" | "Inactive Member";
}
/** set status by serial (admin/backoffice) */
export interface SetStatusBySerialPayload {
  serial: string;
  active: boolean;
}

/** ---------- Restaurant offers ---------- */
export interface RestaurantOffer {
  _id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  images: { url: string; description: string }[];
  thumbnail?: string;
  discount_percent: number;
  discount_start?: string | null;
  discount_end?: string | null;
  final_price: number;
  createdAt: string;
  business: {
    _id: string;
    businessName: string;
    logo?: string;
    locations?: { city?: string; country?: string };
  };
}
export interface RestaurantOffersResponse {
  items: RestaurantOffer[];
  page: number;
  limit: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/** ---------- Deactivation Requests ---------- */
export type DeactivationStatus = "pending" | "accepted" | "rejected";

export interface DeactivationRequest {
  _id: string;
  member_id: string;
  serialNumber: string;
  name: string;
  phone: string;
  reason?: string;
  note?: string;
  status: DeactivationStatus;
  processedAt?: string | null;
  processedBy?: string | null;
  processedNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeactivationRequestPayload {
  reason?: string;
  note?: string;
}
export interface CreateDeactivationRequestResponse {
  id: string;
  status: DeactivationStatus;
  createdAt: string;
}
export interface PagedDeactivationRequestsResponse {
  items: DeactivationRequest[];
  page: number;
  limit: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}
export interface AcceptDeactivationRequestPayload {
  id: string; // request id (path param)
  note?: string; // optional processed note
  apiKey?: string; // optional admin API key for header
}
export interface AcceptDeactivationRequestResponse {
  request: DeactivationRequest;
  member: { serialNumber: string; name: string; phone: string; active: boolean };
}

/** Ensure Authorization: Bearer <token> for endpoints where needed */
function memberAuthHeaders() {
  const t = getCookie("desiTrackerToken");
  if (!t) return undefined;
  return {
    authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}`,
  } as HeadersInit;
}

/** Optional admin header helper (x-api-key) */
function adminHeaders(apiKey?: string) {
  return apiKey ? ({ "x-api-key": apiKey } as HeadersInit) : undefined;
}

/** ---------- Leads ---------- */
export interface LeadMember {
  id: string;
  serialNumber: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
  active: boolean;
  membershipStatus: "Valid Member" | "Inactive Member";
}

export interface AddLeadPayload {
  memberId: string; // lead member _id
  ownerId?: string; // lead member _id
}

export interface AddLeadResponse {
  id: string; // lead doc id
  lead: LeadMember;
  createdAt: string;
}

export interface RemoveLeadResponse {
  message: string;
  ownerId: string;
}

export interface MyLeadItem {
  id: string; // lead doc id
  createdAt: string;
  lead: LeadMember;
}

export interface PagedMyLeadsResponse {
  items: MyLeadItem[];
  page: number;
  limit: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  ownerId: string;
}
export interface SendPromotionPayload {
  offerId: string;
  ownerId:string;
  subject?: string;
  message?: string;
}

export interface SendPromotionResponse {
  offerId: string;
  totalLeads: number;
  recipients: number;
  sent: number;
  failed: number;
  skippedNoEmail: number;
}
const memberApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** REGISTER */
    registerMember: build.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: "/members/register",
        method: "POST",
        body,
      }),
    }),

    /** LOGIN */
    loginMember: build.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: "/members/login",
        method: "POST",
        body,
      }),
    }),

    /** ME (dashboard data) */
    getMemberMe: build.query<MemberDTO & { info: string }, void>({
      query: () => ({
        url: "/members/me",
        method: "GET",
        headers: memberAuthHeaders(),
      }),
    }),

    /** UPDATE name/phone/city */
    updateMemberMe: build.mutation<
      { id: string; name?: string; phone?: string; city?: string },
      UpdateMePayload
    >({
      query: (body) => ({
        url: "/members/me",
        method: "PATCH",
        body,
        headers: memberAuthHeaders(),
      }),
    }),

    /** UPLOAD PROFILE IMAGE (multipart) */
    uploadMemberProfileImage: build.mutation<{ profileImageUrl: string }, File | { file: File }>(
      {
        query: (arg) => {
          const file = arg instanceof File ? arg : arg.file;
          const form = new FormData();
          form.append("image", file);
          return {
            url: "/members/upload-profile-image",
            method: "POST",
            body: form,
            headers: memberAuthHeaders(), // don't set Content-Type manually
          };
        },
      }
    ),

    /** SET ACTIVE / INACTIVE */
    setMemberStatus: build.mutation<{ active: boolean }, boolean | { active: boolean }>(
      {
        query: (arg) => {
          const active = typeof arg === "boolean" ? arg : arg.active;
          return {
            url: "/members/me/status",
            method: "PATCH",
            body: { active },
            headers: memberAuthHeaders(),
          };
        },
      }
    ),

    /** DELETE ACCOUNT */
    deleteMemberAccount: build.mutation<{ message: string }, void>({
      query: () => ({
        url: "/members/me",
        method: "DELETE",
        headers: memberAuthHeaders(),
      }),
    }),

    /** PUBLIC: VERIFY BY QR SLUG */
    verifyMemberBySlug: build.query<VerifyResult, string>({
      query: (slug) => ({
        url: `/members/verify/${slug}`,
        method: "GET",
      }),
    }),

    /** PUBLIC: LOOKUP BY SERIAL */
    lookupMemberBySerial: build.query<LookupResult, string>({
      query: (serial) => ({
        url: `/members/lookup/${encodeURIComponent(serial)}`,
        method: "GET",
      }),
    }),

    /** PUBLIC: SEARCH BY SERIAL (compact profile) */
    searchMemberBySerial: build.query<SearchBySerialResult, string>({
      query: (serial) => ({
        url: `/members/search-by-serial`,
        method: "GET",
        params: { serial },
      }),
    }),

    /** 🔹 PAGED MEMBERS (default list + search + pagination + limit) */
    pagedMembers: build.query<
      PagedMembersResponse,
      { q?: string; page?: number; limit?: number }
    >({
      query: ({ q, page = 1, limit = 10 }) => ({
        url: "/members/search",
        method: "GET",
        params: { q, page, limit },
      }),
    }),

    /** 🔹 UPDATE ACTIVE BY SERIAL (activate/deactivate) */
    setMemberStatusBySerial: build.mutation<SetStatusBySerialResult, SetStatusBySerialPayload>({
      query: (body) => ({
        url: "/members/status-by-serial",
        method: "PATCH",
        body,
      }),
    }),

    /** ---------- Restaurant offers ---------- */
    getRestaurantOffers: build.query<
      RestaurantOffersResponse,
      { selectedCountry?: string; city?: string; q?: string; min_discount?: number; page?: number; limit?: number }
    >({
      query: ({ selectedCountry, city, q, min_discount, page = 1, limit = 12 } = {}) => ({
        url: "/members/restaurants",
        method: "GET",
        params: { city, q, min_discount, page, limit, country: selectedCountry },
      }),
    }),

    /** ---------- Deactivation Requests (Member) ---------- */

    /** Create a deactivation request (reason + note) */
    createDeactivationRequest: build.mutation<
      CreateDeactivationRequestResponse,
      CreateDeactivationRequestPayload
    >({
      query: (body) => ({
        url: "/members/me/deactivation-requests",
        method: "POST",
        body,
        headers: memberAuthHeaders(),
      }),
    }),

    /** Get my deactivation requests */
    getMyDeactivationRequests: build.query<DeactivationRequest[], void>({
      query: () => ({
        url: "/members/me/deactivation-requests",
        method: "GET",
        headers: memberAuthHeaders(),
      }),
    }),

    /** ---------- Deactivation Requests (Admin/backoffice) ---------- */

    /** List all requests (supports status, q, pagination). Pass apiKey if required by backend. */
    listDeactivationRequests: build.query<
      PagedDeactivationRequestsResponse,
      { status?: DeactivationStatus; q?: string; page?: number; limit?: number; apiKey?: string }
    >({
      query: ({ status, q, page = 1, limit = 20, apiKey } = {}) => ({
        url: "/members/deactivation-requests",
        method: "GET",
        params: { status, q, page, limit },
        headers: adminHeaders(apiKey),
      }),
    }),

    /** Accept a request by id (also deactivates member). Pass apiKey if required. */
    acceptDeactivationRequest: build.mutation<
      AcceptDeactivationRequestResponse,
      AcceptDeactivationRequestPayload
    >({
      query: ({ id, note, apiKey }) => ({
        url: `/members/deactivation-requests/${encodeURIComponent(id)}/accept`,
        method: "PATCH",
        body: note ? { note } : undefined,
        headers: adminHeaders(apiKey),
      }),

    }),
    /** Add a member as lead */
    addLead: build.mutation<AddLeadResponse, AddLeadPayload>({
      query: (body) => ({
        url: "/members/me/leads",
        method: "POST",
        body,
        headers: memberAuthHeaders(),
      }),
    }),

    /** List my leads (paged + optional search) */
    listMyLeads: build.query<
      PagedMyLeadsResponse,
      { q?: string; page?: number; limit?: number, ownerId?: string }
    >({
      query: ({ q, page = 1, limit = 20, ownerId } = {}) => ({
        url: "/members/me/leads",
        method: "GET",
        params: { q, page, limit, ownerId },
        headers: memberAuthHeaders(),
      }),
    }),

    /** Remove a lead by lead memberId */
    removeLead: build.mutation<RemoveLeadResponse, { memberId: string, ownerId?: string }>({
      query: ({ memberId, ownerId }) => ({
        url: `/members/me/leads/${encodeURIComponent(memberId)}?ownerId=${ownerId}`,
        method: "DELETE",
        headers: memberAuthHeaders(),
      }),
    }),
    sendPromotionToLeads: build.mutation<SendPromotionResponse, SendPromotionPayload>({
      query: (body) => ({
        url: "/members/me/leads/send-promotion",
        method: "POST",
        body,
        headers: memberAuthHeaders(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMemberMutation,
  useLoginMemberMutation,
  useGetMemberMeQuery,
  useUpdateMemberMeMutation,
  useUploadMemberProfileImageMutation,
  useSetMemberStatusMutation,
  useDeleteMemberAccountMutation,
  useVerifyMemberBySlugQuery,
  useLookupMemberBySerialQuery,
  useSearchMemberBySerialQuery,
  usePagedMembersQuery,
  useSetMemberStatusBySerialMutation,
  useGetRestaurantOffersQuery,

  // Deactivation requests
  useCreateDeactivationRequestMutation,
  useGetMyDeactivationRequestsQuery,
  useListDeactivationRequestsQuery,
  useAcceptDeactivationRequestMutation,

  useAddLeadMutation,
  useListMyLeadsQuery,
  useRemoveLeadMutation,
  useSendPromotionToLeadsMutation
} = memberApi;

export default memberApi;

