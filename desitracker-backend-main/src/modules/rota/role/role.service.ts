import { FilterQuery } from 'mongoose';
import AppError from '../../../errors/AppError';
import { RotaRole } from './role.model';
import { IRotaRole } from './role.interface';
import { RotaRoleValidation } from './role.validation';
import { RotaUtils } from '../rota.utils';
import type { SortOrder } from 'mongoose';

export const RotaRoleService = {
  async create(payload: any) {
    const dto = RotaRoleValidation.create(payload);

    try {
      const doc = await RotaRole.create({
        business: dto.business,
        name: dto.name,
        description: dto.description ?? '',
        isActive: dto.isActive ?? true,
        isDeleted: false,
      });
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Role name already exists for this business');
      throw e;
    }
  },

  async getAll(query: any) {
    const business = RotaRoleValidation.businessFromQuery(query);
    const { page, limit, skip } = RotaUtils.pagination(query, { page: 1, limit: 20, maxLimit: 200 });
    const { sortBy, sortOrder } = RotaUtils.sort(query, 'createdAt');

    const filter: FilterQuery<IRotaRole> = { business, isDeleted: false };

    const isActive = RotaUtils.parseBoolean(query?.isActive);
    if (isActive !== undefined) filter.isActive = isActive;

    const searchTerm = RotaUtils.optionalString(query?.searchTerm);
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    const sort: Record<string, SortOrder> = { [String(sortBy)]: sortOrder as SortOrder };

    const [data, total] = await Promise.all([
      RotaRole.find(filter).sort(sort).skip(skip).limit(limit),
      RotaRole.countDocuments(filter),
    ]);

    return { meta: { page, limit, total }, data };
  },

  async getById(id: string, business: string) {
    const doc = await RotaRole.findOne({ _id: id, business, isDeleted: false });
    if (!doc) throw new AppError(404, 'Role not found');
    return doc;
  },

  async update(id: string, business: string, payload: any) {
    const dto = RotaRoleValidation.update(payload);

    try {
      const doc = await RotaRole.findOneAndUpdate(
        { _id: id, business, isDeleted: false },
        dto,
        { new: true, runValidators: true }
      );
      if (!doc) throw new AppError(404, 'Role not found');
      return doc;
    } catch (e: any) {
      if (e?.code === 11000) throw new AppError(409, 'Role name already exists for this business');
      throw e;
    }
  },

  // Soft delete
  async remove(id: string, business: string) {
    const doc = await RotaRole.findOneAndUpdate(
      { _id: id, business, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!doc) throw new AppError(404, 'Role not found');
    return doc;
  },
};
