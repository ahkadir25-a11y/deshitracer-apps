import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';

export type CreateRoleDTO = {
  business: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateRoleDTO = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export const RotaRoleValidation = {
  create(payload: any): CreateRoleDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const name = RotaUtils.requireString(payload?.name, 'name');

    if (name.length > 80) throw new AppError(400, 'name is too long');

    const description = RotaUtils.optionalString(payload?.description);
    const isActive = RotaUtils.parseBoolean(payload?.isActive);

    return { business, name, description, isActive };
  },

  update(payload: any): UpdateRoleDTO {
    const dto: UpdateRoleDTO = {};
    if (payload?.name !== undefined) dto.name = RotaUtils.requireString(payload.name, 'name');
    if (payload?.description !== undefined) dto.description = RotaUtils.optionalString(payload.description) ?? '';
    if (payload?.isActive !== undefined) dto.isActive = RotaUtils.parseBoolean(payload.isActive);
    return dto;
  },

  businessFromQuery(query: any) {
    return RotaUtils.requireObjectId(query?.business, 'business');
  },
};
