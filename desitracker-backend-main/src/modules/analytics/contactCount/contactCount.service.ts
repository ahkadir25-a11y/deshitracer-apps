import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { Business } from '../../business/business.model';
import ContactCount from './contactCount.model';

const isValidDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const addContactCount = async (
  businessId: string,
  payload: { username?: string },
) => {
  const isBusiness = await Business.findById(businessId);

  if (!isBusiness) {
    throw new AppError(404, 'Invalid Business Id: Business is not found.');
  }

  const result = await ContactCount.create(payload);

  return result;
};

const getContactAnalytics = async (
  businessId: string,
  queries: Record<string, unknown>,
) => {
  const isBusiness = await Business.findById(businessId);
  if (!isBusiness) {
    throw new AppError(404, 'Invalid Business Id: Business is not found.');
  }

  // Date range filter
  const { startDate, endDate } = queries;

  let start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // default 1 year ago
  let end = new Date(); // default now

  if (startDate && isValidDate(startDate as string)) {
    start = new Date(startDate as string);
  }

  if (endDate && isValidDate(endDate as string)) {
    end = new Date(endDate as string);
  }

  if (start > end) {
    throw new Error('Start date cannot be after end date.');
  }

  //  Lifetime total count (no date filter)
  const lifetimeCount = await ContactCount.countDocuments({
    business: new mongoose.Types.ObjectId(businessId),
  });

  // Monthly breakdown (within date range)
  const monthlyResult = await ContactCount.aggregate([
    {
      $match: {
        business: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
    {
      $project: {
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' },
              ],
            },
          ],
        },
        count: 1,
        _id: 0,
      },
    },
  ]);

  return {
    data: {
      lifetimeContactCount: lifetimeCount,
      monthlyCount: monthlyResult,
    },
  };
};

export const ContactCountServices = {
  addContactCount,
  getContactAnalytics,
};
