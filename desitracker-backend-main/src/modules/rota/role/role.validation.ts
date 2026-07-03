import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';
import { PERMISSION_KEYS, TRolePermissions } from './role.interface';

export type CreateRoleDTO = {
  business: string;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: Partial<TRolePermissions>;
};

export type UpdateRoleDTO = {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: Partial<TRolePermissions>;
};

// Whitelist the incoming permissions object so callers can't sneak arbitrary
// keys onto the role doc, and so unknown future keys don't trigger casts.
function sanitizePermissions(input: any): Partial<TRolePermissions> | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== 'object') {
    throw new AppError(400, 'permissions must be an object');
  }
  const out: Partial<TRolePermissions> = {};
  for (const key of PERMISSION_KEYS) {
    if (input[key] !== undefined) {
      out[key] = Boolean(input[key]);
    }
  }
  return out;
}

export const RotaRoleValidation = {
  create(payload: any): CreateRoleDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const name = RotaUtils.requireString(payload?.name, 'name');

    if (name.length > 80) throw new AppError(400, 'name is too long');

    const description = RotaUtils.optionalString(payload?.description);
    const isActive = RotaUtils.parseBoolean(payload?.isActive);
    const permissions = sanitizePermissions(payload?.permissions);

    return { business, name, description, isActive, permissions };
  },

  update(payload: any): UpdateRoleDTO {
    const dto: UpdateRoleDTO = {};
    if (payload?.name !== undefined) dto.name = RotaUtils.requireString(payload.name, 'name');
    if (payload?.description !== undefined) dto.description = RotaUtils.optionalString(payload.description) ?? '';
    if (payload?.isActive !== undefined) dto.isActive = RotaUtils.parseBoolean(payload.isActive);
    if (payload?.permissions !== undefined) {
      dto.permissions = sanitizePermissions(payload.permissions);
    }
    return dto;
  },

  businessFromQuery(query: any) {
    return RotaUtils.requireObjectId(query?.business, 'business');
  },
};
