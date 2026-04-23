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
exports.ReviewControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const review_service_1 = require("./review.service");
const createReview = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewServices.createReview(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Review created successfully!',
        data: result,
    });
}));
const getAllBusinessReviews = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req === null || req === void 0 ? void 0 : req.params;
    const result = yield review_service_1.ReviewServices.getAllBusinessReviews(businessId, req.query);
    const { reviews, meta } = result;
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Business Reviews retrieved successfully!',
        meta,
        data: reviews,
    });
}));
const getAllReviews = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield review_service_1.ReviewServices.getAllReviews(req.query);
    const { reviews, meta } = result;
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Reviews retrieved successfully!',
        data: reviews,
        meta,
    });
}));
const getSingleReview = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield review_service_1.ReviewServices.getSingleReview((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.reviewId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Review retrieved successfully!',
        data: result,
    });
}));
const updateReviewVisibility = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield review_service_1.ReviewServices.updateReviewVisibility((_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId, (_b = req.body) === null || _b === void 0 ? void 0 : _b.show);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Review visibility updated successfully!',
        data: result,
    });
}));
const updateReviewByReviewer = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield review_service_1.ReviewServices.updateReviewByReviewer((_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Your Review data updated successfully!',
        data: result,
    });
}));
exports.ReviewControllers = {
    createReview,
    getAllBusinessReviews,
    getAllReviews,
    getSingleReview,
    updateReviewVisibility,
    updateReviewByReviewer,
};
