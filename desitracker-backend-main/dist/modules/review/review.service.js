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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendEmail_1 = __importDefault(require("../../utils/lib/sendEmail"));
const queryBuilder_1 = __importDefault(require("../../utils/queryBuilder"));
const business_model_1 = require("../business/business.model");
const review_model_1 = __importDefault(require("./review.model"));
const createReview = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const business = yield business_model_1.Business.findById(payload === null || payload === void 0 ? void 0 : payload.business);
    if (!business) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    const existingReview = yield review_model_1.default.findOne({
        business: payload.business,
        email: payload.email,
    });
    if (existingReview) {
        throw new AppError_1.default(400, 'You have already submitted a review for this business');
    }
    if (!(payload === null || payload === void 0 ? void 0 : payload.name) || !(payload === null || payload === void 0 ? void 0 : payload.email) || !(payload === null || payload === void 0 ? void 0 : payload.rating)) {
        throw new AppError_1.default(400, 'Name, email, and rating are required');
    }
    const acceptedEmailDomains = [
        'protonmail.com', 'tutanota.com', 'fastmail.com', 'hushmail.com', 'hey.com',
        'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'zoho.com', 'gmx.com',
        'mail.com', 'aol.com', 'yandex.com', 'inbox.com'
    ];
    const emailDomain = (_a = payload === null || payload === void 0 ? void 0 : payload.email) === null || _a === void 0 ? void 0 : _a.split('@')[1];
    if (!acceptedEmailDomains.includes(emailDomain)) {
        throw new AppError_1.default(400, 'Email provider not accepted');
    }
    const review = yield review_model_1.default.create(Object.assign({}, payload));
    if (!review) {
        throw new AppError_1.default(500, 'Failed to submit review.');
    }
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Review Submission Confirmation</title></head>
    <body>
      <h1>Thank you for submitting your review!</h1>
      <p>Dear ${review === null || review === void 0 ? void 0 : review.name},</p>
      <p>Thank you for sharing your thoughts. We have received your review for <strong>${business === null || business === void 0 ? void 0 : business.businessName}</strong>.</p>
      <p>Your feedback is valuable, and we appreciate your time.</p>
      <p>Best regards,<br/>The Review Team</p>
    </body>
    </html>
  `;
    // 🔥 Using the same sendEmail helper
    (0, sendEmail_1.default)({
        email: payload.email,
        subject: `Review Submitted Successfully For ${business.businessName}`,
        message: htmlTemplate,
    });
    return review;
});
const getAllBusinessReviews = (businessId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new queryBuilder_1.default(review_model_1.default.find({ business: businessId }).populate([
        {
            path: 'business',
            model: 'Business',
        },
    ]), query)
        .search(['name', 'email']) // Enable search by name & feedback
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    const reviews = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { reviews, meta };
});
const getAllReviews = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new queryBuilder_1.default(review_model_1.default.find().populate([
        {
            path: 'business',
            model: 'Business',
        },
    ]), query)
        .search(['name', 'email']) // Enable search by name & feedback
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    const reviews = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { reviews, meta };
});
const getSingleReview = (reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.default.findById(reviewId)
        .populate('business', 'user')
        .exec();
    if (!review) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return review;
});
const updateReviewVisibility = (reviewId, show) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedReview = yield review_model_1.default.findByIdAndUpdate(reviewId, { show: show }, { new: true, runValidators: true });
    if (!updatedReview) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return updatedReview;
});
const updateReviewByReviewer = (reviewId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.default.findById(reviewId);
    if (!review) {
        throw new AppError_1.default(404, 'Review is not found.');
    }
    const { business, show } = payload, remaining = __rest(payload, ["business", "show"]);
    const updatedReviewData = {
        rating: (payload === null || payload === void 0 ? void 0 : payload.rating) ? payload === null || payload === void 0 ? void 0 : payload.rating : review === null || review === void 0 ? void 0 : review.rating,
        feedback: (payload === null || payload === void 0 ? void 0 : payload.feedback) ? payload === null || payload === void 0 ? void 0 : payload.feedback : review === null || review === void 0 ? void 0 : review.feedback,
    };
    const updatedReview = yield review_model_1.default.findByIdAndUpdate(reviewId, updatedReviewData, { new: true, runValidators: true });
    if (!updatedReview) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return updatedReview;
});
exports.ReviewServices = {
    createReview,
    getAllBusinessReviews,
    getAllReviews,
    getSingleReview,
    updateReviewVisibility,
    updateReviewByReviewer,
};
