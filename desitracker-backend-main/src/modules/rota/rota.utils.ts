import { Types } from 'mongoose';
import AppError from '../../errors/AppError';

export const RotaUtils = {
  requireString(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new AppError(400, `${field} is required`);
    }
    return value.trim();
  },

  optionalString(value: unknown) {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') return undefined;
    const v = value.trim();
    return v ? v : undefined;
  },

  requireObjectId(id: unknown, field: string) {
    const str = this.requireString(id, field);
    if (!Types.ObjectId.isValid(str)) throw new AppError(400, `${field} is invalid`);
    return str;
  },

  optionalObjectId(id: unknown) {
    if (id === undefined || id === null || id === '') return undefined;
    if (typeof id !== 'string') return undefined;
    if (!Types.ObjectId.isValid(id)) return undefined;
    return id;
  },

  normalizeEmail(value: unknown) {
    const email = this.requireString(value, 'email').toLowerCase();
    // Simple email check (good enough for backend validation; DB still enforces uniqueness)
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) throw new AppError(400, 'email is invalid');
    return email;
  },

  parseBoolean(value: unknown) {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  },

  pagination(query: any, defaults = { page: 1, limit: 20, maxLimit: 200 }) {
    const page = Math.max(parseInt(String(query?.page ?? defaults.page), 10) || defaults.page, 1);
    const limitRaw = parseInt(String(query?.limit ?? defaults.limit), 10) || defaults.limit;
    const limit = Math.min(Math.max(limitRaw, 1), defaults.maxLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },

  sort(query: any, defaultSortBy: string) {
    const sortBy = typeof query?.sortBy === 'string' && query.sortBy.trim() ? query.sortBy.trim() : defaultSortBy;
    const sortOrder = query?.sortOrder === 'asc' ? 1 : -1;
    return { sortBy, sortOrder };
  },

  parseDate(value: unknown, field: string) {
    const s = this.requireString(value, field);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new AppError(400, `${field} is invalid ISO date`);
    return d;
  },
};
