import { addMonths, format, startOfMonth } from 'date-fns';
import { Request } from 'express';
import AppError from '../../../errors/AppError';
import { Business } from '../../business/business.model';
import { User } from '../../user/user/user.model';
import VisitorCount from './visitorCount.model';
import Testimonial from '../../testimonial/testimonial.model';
import mongoose from 'mongoose';

const addToVisitorCount = async (businessId: string, req: Request) => {
  const business = await Business.findById(businessId);
  if (!business) throw new AppError(404, 'Business not found!');

  // Ensure correct IP detection
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || req.ip;

  const cooldownTime = new Date(Date.now() - 30 * 1000);
  const recentVisit = await VisitorCount.findOne({
    business: businessId,
    ipAddress: ipAddress,
    createdAt: { $gte: cooldownTime },
  });

  if (recentVisit) {
    return null;
  }

  return await VisitorCount.create({
    business: businessId,
    ipAddress: ipAddress,
  });
};

const isValidDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const getBusinessAnalytics = async (
  businessId: string,
  queries: Record<string, unknown>
) => {
  const { startDate, endDate } = queries;

  // Default to start of current year
  let start = new Date(new Date().getFullYear(), 0, 1);
  let end = new Date();

  if (startDate && isValidDate(startDate as string)) {
    start = new Date(startDate as string);
  }

  if (endDate && isValidDate(endDate as string)) {
    end = new Date(endDate as string);
  }

  if (start > end) {
    throw new Error('Start date cannot be after end date.');
  }

  const matchStage = {
    $match: {
      business: new mongoose.Types.ObjectId(businessId), // Convert to ObjectId
      createdAt: {
        $gte: start,
        $lte: end,
      },
    },
  };

  const groupStage = {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
      count: { $sum: 1 },
    },
  };

  const projectStage = {
    $project: {
      _id: 0,
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
    },
  };

  const monthlyRaw = await VisitorCount.aggregate([
    matchStage,
    groupStage,
    projectStage,
    { $sort: { month: 1 } }, // Sort ascending; we'll reverse later
  ]);

  const monthMap = new Map<string, number>();
  monthlyRaw.forEach((entry) => monthMap.set(entry.month, entry.count));

  const monthly: { month: string; count: number }[] = [];
  let current = startOfMonth(start);
  const final = startOfMonth(end);

  while (current <= final) {
    const monthStr = format(current, 'yyyy-MM');
    monthly.push({
      month: monthStr,
      count: monthMap.get(monthStr) || 0,
    });
    current = addMonths(current, 1);
  }

  const totalCount = monthly.reduce((acc, curr) => acc + curr.count, 0);

  return {
    totalCount,
    monthly: monthly.reverse(), // Show latest month first
  };
};


const getAdminAnalytics = async (queries: Record<string, unknown>) => {
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

  // Total counts
  const totalBusinessCount = await Business.countDocuments({
    createdAt: {
      $gte: start,
      $lte: end,
    },
  });

  const totalUserCount = await User.countDocuments({
    createdAt: {
      $gte: start,
      $lte: end,
    },
  });

  // Monthly aggregation for users
  const userMonthlyAgg = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        userCount: { $sum: 1 },
      },
    },
  ]);

  // Monthly aggregation for businesses
  const businessMonthlyAgg = await Business.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        businessCount: { $sum: 1 },
      },
    },
  ]);

  // Get average rating of site
  const averageRatting = await Testimonial.aggregate([
    {
      $match: { show: true }, // Only include reviews that are visible
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' }, // Calculate the average rating
      },
    },
  ]);

  // Get unique countries all over the world
  const uniqueCountries = await Business.aggregate([
    {
      $unwind: "$locations" // Unwind the locations array
    },
    {
      $group: {
        _id: "$locations.country", // Group by the country field
      }
    },
    {
      $count: "uniqueCountries" // Count the number of unique countries
    }
  ]);

  // Get the new registrations (Businesses created within the time frame)
  const newRegistrations = await Business.countDocuments({
    createdAt: {
      $gte: start,
      $lte: end,
    },
  });

  // Get the user reviews count
  const userReviews = await Testimonial.countDocuments({
    createdAt: {
      $gte: start,
      $lte: end,
    },
    show: true, // Only count visible reviews
  });

  // Build lookup maps
  const userMap = new Map();
  userMonthlyAgg.forEach((item) => {
    const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    userMap.set(monthKey, item.userCount);
  });

  const businessMap = new Map();
  businessMonthlyAgg.forEach((item) => {
    const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    businessMap.set(monthKey, item.businessCount);
  });

  // Merge into monthlyData array
  const monthlyData = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.push({
      month: key,
      userCount: userMap.get(key) || 0,
      businessCount: businessMap.get(key) || 0,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return {
    data: {
      totalBusinessCount,
      totalUserCount,
      monthlyData,
      averageRatting: averageRatting[0]?.averageRating,
      uniqueCountries: uniqueCountries[0]?.uniqueCountries,
      newRegistrations,
      userReviews,
    },
  };
};

export const VisitorCountServices = {
  addToVisitorCount,
  getBusinessAnalytics,
  getAdminAnalytics,
};
