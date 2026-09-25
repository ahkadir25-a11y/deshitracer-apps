import { RequestHandler } from 'express';
import AppError from '../errors/AppError';
import { resolvePrincipal } from '../utils/lib/businessAccess';
import { RotaEmployee } from '../modules/rota/employee/employee.model';
import { RotaRole } from '../modules/rota/role/role.model';

/**
 * Enforce one of the rota role permissions on a route.
 *
 * The permission flags existed only on the client: routes checked that the
 * caller held the `staff` role and nothing more, so taking `canAccessTables`
 * away from someone hid the buttons and left the API wide open to them. A
 * permission that is only a hidden button is not a permission.
 *
 * Roles other than `staff` pass straight through, which keeps every route
 * behaving exactly as it did for owners, admins and customers — the flags
 * describe what a staff member's rota role allows, and nobody else has one.
 */
const requirePermission = (key: string): RequestHandler => async (req, _res, next) => {
  try {
    // Not every route authenticates the same way. `auth()` puts the caller on
    // req.user, but the orders list uses authOrderRead, which resolves the
    // caller itself and leaves req.user unset, and order creation is reachable
    // by customers with no auth middleware at all. Reading only req.user meant
    // this rejected both — a permission check that broke sign-in.
    const fromAuth = (req as any).user;
    const principal = fromAuth?.id
      ? { id: String(fromAuth.id), role: String(fromAuth.role || '') }
      : await resolvePrincipal(req);

    // Authenticating is the route's job, not this one's. Where no staff member
    // can be identified there is no rota role to check, so stand aside and let
    // whatever guards the route decide.
    if (!principal || principal.role !== 'staff') return next();

    const employee = await RotaEmployee.findOne({ user: principal.id, isDeleted: false, status: 'ACTIVE' })
      .select('role')
      .lean();
    if (!employee?.role) {
      // Covers both 'no role set' and 'deactivated' — neither should get through.
      return next(new AppError(403, 'Your account does not have access to this. Ask your manager.'));
    }

    const role = await RotaRole.findOne({ _id: employee.role as any, isDeleted: false })
      .select('permissions')
      .lean();
    if (!(role as any)?.permissions?.[key]) {
      return next(new AppError(403, 'Your role does not include this. Ask your manager if you need it.'));
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default requirePermission;
