"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorCountServices = void 0;
const date_fns_1 = require("date-fns");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const business_model_1 = require("../../business/business.model");
const user_model_1 = require("../../user/user/user.model");
const visitorCount_model_1 = __importDefault(require("./visitorCount.model"));
const testimonial_model_1 = __importDefault(require("../../testimonial/testimonial.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const addToVisitorCount = (businessId, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const business = yield business_model_1.Business.findById(businessId);
    if (!business)
        throw new AppError_1.default(404, 'Business not found!');
    // Ensure correct IP detection
    const ipAddress = ((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) || req.socket.remoteAddress || req.ip;
    const cooldownTime = new Date(Date.now() - 30 * 1000);
    const recentVisit = yield visitorCount_model_1.default.findOne({
        business: businessId,
        ipAddress: ipAddress,
        createdAt: { $gte: cooldownTime },
    });
    if (recentVisit) {
        return null;
    }
    return yield visitorCount_model_1.default.create({
        business: businessId,
        ipAddress: ipAddress,
    });
});
const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};
const getBusinessAnalytics = (businessId, queries) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = queries;
    // Default to start of current year
    let start = new Date(new Date().getFullYear(), 0, 1);
    let end = new Date();
    if (startDate && isValidDate(startDate)) {
        start = new Date(startDate);
    }
    if (endDate && isValidDate(endDate)) {
        end = new Date(endDate);
    }
    if (start > end) {
        throw new Error('Start date cannot be after end date.');
    }
    const matchStage = {
        $match: {
            business: new mongoose_1.default.Types.ObjectId(businessId), // Convert to ObjectId
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
    const monthlyRaw = yield visitorCount_model_1.default.aggregate([
        matchStage,
        groupStage,
        projectStage,
        { $sort: { month: 1 } }, // Sort ascending; we'll reverse later
    ]);
    const monthMap = new Map();
    monthlyRaw.forEach((entry) => monthMap.set(entry.month, entry.count));
    const monthly = [];
    let current = (0, date_fns_1.startOfMonth)(start);
    const final = (0, date_fns_1.startOfMonth)(end);
    while (current <= final) {
        const monthStr = (0, date_fns_1.format)(current, 'yyyy-MM');
        monthly.push({
            month: monthStr,
            count: monthMap.get(monthStr) || 0,
        });
        current = (0, date_fns_1.addMonths)(current, 1);
    }
    const totalCount = monthly.reduce((acc, curr) => acc + curr.count, 0);
    return {
        totalCount,
        monthly: monthly.reverse(), // Show latest month first
    };
});
const getAdminAnalytics = (queries) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { startDate, endDate } = queries;
    let start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // default 1 year ago
    let end = new Date(); // default now
    if (startDate && isValidDate(startDate)) {
        start = new Date(startDate);
    }
    if (endDate && isValidDate(endDate)) {
        end = new Date(endDate);
    }
    if (start > end) {
        throw new Error('Start date cannot be after end date.');
    }
    // Total counts
    const totalBusinessCount = yield business_model_1.Business.countDocuments({
        createdAt: {
            $gte: start,
            $lte: end,
        },
    });
    const totalUserCount = yield user_model_1.User.countDocuments({
        createdAt: {
            $gte: start,
            $lte: end,
        },
    });
    // Monthly aggregation for users
    const userMonthlyAgg = yield user_model_1.User.aggregate([
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
    const businessMonthlyAgg = yield business_model_1.Business.aggregate([
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
    const averageRatting = yield testimonial_model_1.default.aggregate([
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
    const uniqueCountries = yield business_model_1.Business.aggregate([
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
    const newRegistrations = yield business_model_1.Business.countDocuments({
        createdAt: {
            $gte: start,
            $lte: end,
        },
    });
    // Get the user reviews count
    const userReviews = yield testimonial_model_1.default.countDocuments({
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
            averageRatting: (_a = averageRatting[0]) === null || _a === void 0 ? void 0 : _a.averageRating,
            uniqueCountries: (_b = uniqueCountries[0]) === null || _b === void 0 ? void 0 : _b.uniqueCountries,
            newRegistrations,
            userReviews,
        },
    };
});
exports.VisitorCountServices = {
    addToVisitorCount,
    getBusinessAnalytics,
    getAdminAnalytics,
};
