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
exports.ContactCountServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const business_model_1 = require("../../business/business.model");
const contactCount_model_1 = __importDefault(require("./contactCount.model"));
const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};
const addContactCount = (businessId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isBusiness = yield business_model_1.Business.findById(businessId);
    if (!isBusiness) {
        throw new AppError_1.default(404, 'Invalid Business Id: Business is not found.');
    }
    const result = yield contactCount_model_1.default.create(payload);
    return result;
});
const getContactAnalytics = (businessId, queries) => __awaiter(void 0, void 0, void 0, function* () {
    const isBusiness = yield business_model_1.Business.findById(businessId);
    if (!isBusiness) {
        throw new AppError_1.default(404, 'Invalid Business Id: Business is not found.');
    }
    // Date range filter
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
    //  Lifetime total count (no date filter)
    const lifetimeCount = yield contactCount_model_1.default.countDocuments({
        business: new mongoose_1.default.Types.ObjectId(businessId),
    });
    // Monthly breakdown (within date range)
    const monthlyResult = yield contactCount_model_1.default.aggregate([
        {
            $match: {
                business: new mongoose_1.default.Types.ObjectId(businessId),
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
});
exports.ContactCountServices = {
    addContactCount,
    getContactAnalytics,
};
