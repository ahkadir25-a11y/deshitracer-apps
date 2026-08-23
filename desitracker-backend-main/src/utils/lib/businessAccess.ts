import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { config as memberConfig } from '../../middlewares/config';
import AppError from '../../errors/AppError';
import { USER_ROLE } from '../../modules/user/auth/auth.constants';

// A caller resolved from either a user JWT (auth) or a member JWT (memberAuth).
export type Principal = { id: string; role: string; email?: string };

/**
 * Resolve the caller from the Bearer token, accepting BOTH a user token
 * (signed with the access secret) and a member token (signed with the member
 * secret). Returns null when there's no valid token. Used by endpoints that are
 * reachable by both staff (user token) and customers (member token), e.g. the
 * orders list where customers read their own history.
 */
export async function resolvePrincipal(req: Request): Promise<Principal | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();

  try {
    const d: any = jwt.verify(token, config.jwt.accessSecret as string);
    if (d?.id) return { id: String(d.id), role: String(d.role || 'user'), email: d.email };
  } catch {
    /* not a user token — fall through to member */
  }
  try {
    const m: any = jwt.verify(token, memberConfig.memberJwtSecret as string);
    if (m?.type === 'member' && m?.id) return { id: String(m.id), role: 'member' };
  } catch {
    /* not a member token either */
  }
  return null;
}

/**
 * True when the principal is an admin, the owner of the business, or active
 * staff of it. Mirrors the membership check used by the realtime socket layer
 * (utils/socket.ts) so HTTP and socket authorization stay consistent.
 */
export async function isBusinessMember(
  principal: Principal,
  businessId: string,
): Promise<boolean> {
  if (!businessId) return false;
  if (principal.role === USER_ROLE.ADMIN) return true;

  const { Business } = await import('../../modules/business/business.model');
  const biz = await Business.findById(businessId).select('owner').lean();
  if (biz && String((biz as any).owner) === principal.id) return true;

  const { RotaEmployee } = await import('../../modules/rota/employee/employee.model');
  const staff = await RotaEmployee.exists({
    business: businessId,
    isDeleted: false,
    $or: [
      ...(principal.id ? [{ user: principal.id }] : []),
      ...(principal.email ? [{ email: String(principal.email).toLowerCase() }] : []),
    ],
  });
  return !!staff;
}

/**
 * For data models keyed by a single user id (fridge, cleaning) where records
 * belong to the business OWNER's user id and staff access them by passing that
 * owner id (see StaffHomeScreen navigating with `userId: ownerUserId`).
 *
 * A caller may access the target user's data when:
 *   - caller is admin, OR
 *   - caller IS that user (owner viewing their own data), OR
 *   - caller is active staff of a business owned by the target user.
 */
export async function canAccessUserScopedData(
  callerId: string | undefined,
  callerRole: string | undefined,
  targetUserId: string | undefined,
  callerEmail?: string,
): Promise<boolean> {
  if (!callerId || !targetUserId) return false;
  if (callerRole === USER_ROLE.ADMIN) return true;
  if (String(callerId) === String(targetUserId)) return true;

  const { Business } = await import('../../modules/business/business.model');
  const ownerBusinesses = await Business.find({ owner: targetUserId }).distinct('_id');
  if (!ownerBusinesses.length) return false;

  const { RotaEmployee } = await import('../../modules/rota/employee/employee.model');
  const staff = await RotaEmployee.exists({
    business: { $in: ownerBusinesses },
    isDeleted: false,
    $or: [
      { user: callerId },
      ...(callerEmail ? [{ email: String(callerEmail).toLowerCase() }] : []),
    ],
  });
  return !!staff;
}

const pickBusinessId = (req: Request): string | undefined => {
  const b: any = req.body || {};
  const q: any = req.query || {};
  const p: any = req.params || {};
  return (
    b.business_id || q.business_id || p.businessId || b.business || q.business || p.business
  );
};

/**
 * Use AFTER `auth(...)` (so `req.user` is populated). Confirms the authenticated
 * user is owner/staff/admin of the business referenced anywhere in the request
 * (body.business_id, query.business_id, params.businessId, or `business`).
 */
export const requireBusinessAccess: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user?.id) throw new AppError(401, 'Not authenticated');
    const businessId = pickBusinessId(req);
    if (!businessId) throw new AppError(400, 'business id is required');
    const ok = await isBusinessMember(
      { id: String(user.id), role: String(user.role), email: user.email },
      String(businessId),
    );
    if (!ok) throw new AppError(403, 'You are not authorized for this business');
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Guard for GET /orders, which is reachable by staff (business scope) AND by
 * customers (their own history). Accepts a user OR member token and enforces:
 *   ?business_id=X -> caller must be owner/staff/admin of X
 *   ?user_id=X     -> caller must be that user (or an admin)
 */
export const authOrderRead: RequestHandler = async (req, res, next) => {
  try {
    const principal = await resolvePrincipal(req);
    if (!principal) throw new AppError(401, 'Login required to view orders');

    const businessId = req.query.business_id as string | undefined;
    const userId = req.query.user_id as string | undefined;

    if (businessId) {
      const ok = await isBusinessMember(principal, businessId);
      if (!ok) throw new AppError(403, 'You are not authorized for this business');
    } else if (userId) {
      if (principal.role !== USER_ROLE.ADMIN && String(userId) !== principal.id) {
        throw new AppError(403, 'You can only view your own orders');
      }
    } else {
      throw new AppError(400, 'business_id or user_id is required');
    }
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * Ownership check driven by the RECORD, not by what the caller sent.
 *
 * The write routes for products, categories and day-offers take an id in the
 * URL and were guarded only by a role check — any authenticated staff member
 * of any business could edit or delete any product on the platform simply by
 * knowing its id. Checking a business id out of the request body does not help:
 * the attacker supplies that too, and passing their own is exactly what makes
 * such a check succeed.
 *
 * So the business is read off the stored document and the caller is tested
 * against that.
 *
 * Throws 404 when the record does not exist and 403 when it belongs to someone
 * else — a missing record must not be reported differently from a forbidden
 * one, or the endpoint becomes a way to enumerate which ids exist.
 */
export async function assertOwnsRecord(
  // Deliberately untyped: `req.user` is declared globally as JwtPayload and
  // the callers use RequestHandler with typed params, neither of which is
  // assignable to a narrower shape. Only `user` is read, and it is validated
  // below before use.
  req: any,
  doc: any,
  notFoundMessage = 'Not found',
): Promise<void> {
  if (!doc) throw new AppError(404, notFoundMessage);

  const user = (req as any).user;
  if (!user?.id) throw new AppError(401, 'Not authenticated');

  const businessId = String(doc.business_id || doc.business || '');
  if (!businessId) {
    // A record with no business cannot be proven to belong to the caller.
    // Only an admin may touch it.
    if (String(user.role) !== USER_ROLE.ADMIN) {
      throw new AppError(403, 'You are not authorized for this record');
    }
    return;
  }

  const ok = await isBusinessMember(
    { id: String(user.id), role: String(user.role), email: user.email },
    businessId,
  );
  if (!ok) throw new AppError(404, notFoundMessage);
}
