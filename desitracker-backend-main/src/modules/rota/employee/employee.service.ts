import { FilterQuery, Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { RotaEmployee } from './employee.model';
import { IRotaEmployee } from './employee.interface';
import { RotaEmployeeValidation } from './employee.validation';
import { RotaRole } from '../role/role.model';
import { RotaUtils } from '../rota.utils';
import type { SortOrder } from 'mongoose';

async function ensureRole(roleId: string, business: string) {
  const role = await RotaRole.findOne({ _id: roleId, business, isDeleted: false, isActive: true });
  if (!role) throw new AppError(400, 'Invalid role for this business');
  return role;
}

export const RotaEmployeeService = {
  async create(payload: any) {
    const dto = RotaEmployeeValidation.create(payload);

    await ensureRole(dto.role, dto.business);

    try {
      const doc = await RotaEmployee.create({
        business: dto.business,
        firstName: dto.firstName,
        lastName: dto.lastName ?? '',
        email: dto.email,
        phone: dto.phone,
        address: dto.address ?? {},
        role: dto.role,
        status: dto.status ?? 'ACTIVE',
        user: dto.user,
        notes: dto.notes ?? '',
        isDeleted: false,
      });

      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Employee email already exists for this business');
      throw e;
    }
  },

  async getAll(query: any) {
    const business = RotaEmployeeValidation.businessFromQuery(query);
    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 20, maxLimit: 200 });
    const { sortBy: sortByRaw, sortOrder: sortOrderRaw } = RotaUtils.sort(query, 'createdAt');
    const sortBy = String(sortByRaw);          // force string key
    const sortOrder = sortOrderRaw as SortOrder;
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };

    const filter: FilterQuery<IRotaEmployee> = { business, isDeleted: false };

    if (query?.status === 'ACTIVE' || query?.status === 'INACTIVE') filter.status = query.status;

    const role = RotaUtils.optionalObjectId(query?.role);
    if (role) filter.role = new Types.ObjectId(role);

    const searchTerm = RotaUtils.optionalString(query?.searchTerm);
    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      RotaEmployee.find(filter).populate('role').sort(sort).skip(skip).limit(limit),
      RotaEmployee.countDocuments(filter),
    ]);

    return { meta: { page, limit, total }, data };
  },

  async getById(id: string, business: string) {
    const doc = await RotaEmployee.findOne({ _id: id, business, isDeleted: false }).populate('role');
    if (!doc) throw new AppError(404, 'Employee not found');
    return doc;
  },

  async update(id: string, business: string, payload: any) {
    const dto = RotaEmployeeValidation.update(payload);

    if (dto.role) await ensureRole(dto.role, business);

    try {
      const doc = await RotaEmployee.findOneAndUpdate(
        { _id: id, business, isDeleted: false },
        dto,
        { new: true, runValidators: true }
      ).populate('role');

      if (!doc) throw new AppError(404, 'Employee not found');
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Employee email already exists for this business');
      throw e;
    }
  },

  // Soft delete
  async remove(id: string, business: string) {
    const doc = await RotaEmployee.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true, status: 'INACTIVE' },
      { new: true }
    );
    if (!doc) throw new AppError(404, 'Employee not found');
    return doc;
  },
};
