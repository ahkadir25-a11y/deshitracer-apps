import AppError from '../../../errors/AppError';
import { RotaUtils } from '../rota.utils';

export type CreateEmployeeDTO = {
  business: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: any;
  role: string;
  status?: 'ACTIVE' | 'INACTIVE';
  user?: string;
  notes?: string;
};

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;

export const RotaEmployeeValidation = {
  create(payload: any): CreateEmployeeDTO {
    const business = RotaUtils.requireObjectId(payload?.business, 'business');
    const firstName = RotaUtils.requireString(payload?.firstName, 'firstName');
    const lastName = RotaUtils.optionalString(payload?.lastName);
    const email = RotaUtils.normalizeEmail(payload?.email);
    const phone = RotaUtils.optionalString(payload?.phone);

    const role = RotaUtils.requireObjectId(payload?.role, 'role');
    const status = payload?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const user = RotaUtils.optionalObjectId(payload?.user);
    const notes = RotaUtils.optionalString(payload?.notes);

    const address = payload?.address ?? {};

    if (firstName.length > 80) throw new AppError(400, 'firstName is too long');
    if (lastName && lastName.length > 80) throw new AppError(400, 'lastName is too long');

    return { business, firstName, lastName, email, phone, address, role, status, user, notes };
  },

  update(payload: any): UpdateEmployeeDTO {
    const dto: UpdateEmployeeDTO = {};

    if (payload?.firstName !== undefined) dto.firstName = RotaUtils.requireString(payload.firstName, 'firstName');
    if (payload?.lastName !== undefined) dto.lastName = RotaUtils.optionalString(payload.lastName) ?? '';
    if (payload?.email !== undefined) dto.email = RotaUtils.normalizeEmail(payload.email);
    if (payload?.phone !== undefined) dto.phone = RotaUtils.optionalString(payload.phone) ?? '';
    if (payload?.address !== undefined) dto.address = payload.address ?? {};

    if (payload?.role !== undefined) dto.role = RotaUtils.requireObjectId(payload.role, 'role');

    if (payload?.status !== undefined) {
      if (payload.status !== 'ACTIVE' && payload.status !== 'INACTIVE') {
        throw new AppError(400, 'status must be ACTIVE or INACTIVE');
      }
      dto.status = payload.status;
    }

    if (payload?.user !== undefined) dto.user = RotaUtils.optionalObjectId(payload.user);
    if (payload?.notes !== undefined) dto.notes = RotaUtils.optionalString(payload.notes) ?? '';

    return dto;
  },

  businessFromQuery(query: any) {
    return RotaUtils.requireObjectId(query?.business, 'business');
  },
};
