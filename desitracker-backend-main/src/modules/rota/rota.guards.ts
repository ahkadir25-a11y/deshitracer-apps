import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/AppError';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import { Business } from '../business/business.model';
import { USER_ROLE } from '../user/auth/auth.constants';

/**
 * Ensures the authenticated user owns the business referenced by the request.
 * Admins bypass the check. Looks for the business id in (in order):
 *   req.body.business, req.query.business, req.params.business
 *
 * Use this AFTER `auth(...)` middleware so `req.user` is populated.
 */
export const requireBusinessOwnership = handleAsyncRequest(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) throw new AppError(401, 'Not authenticated');

    // Admins can manage any business.
    if (user.role === USER_ROLE.ADMIN) return next();

    const businessId =
      (req.body && req.body.business) ||
      (req.query && req.query.business) ||
      (req.params && (req.params as any).business);

    if (!businessId) {
      throw new AppError(400, 'business id is required');
    }

    const biz = await Business.findById(businessId).select('owner');
    if (!biz) throw new AppError(404, 'Business not found');

    if (String(biz.owner) !== String(user.id)) {
      throw new AppError(403, 'You do not own this business');
    }

    next();
  },
);
