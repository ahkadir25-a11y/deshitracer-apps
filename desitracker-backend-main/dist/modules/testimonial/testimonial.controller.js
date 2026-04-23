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
exports.TestimonialControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const testimonial_service_1 = require("./testimonial.service");
const createTestimonial = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req === null || req === void 0 ? void 0 : req.user;
    const result = yield testimonial_service_1.TestimonialServices.createTestimonial(req.body, user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Testimonial created successfully!',
        data: result,
    });
}));
const getAllTestimonials = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield testimonial_service_1.TestimonialServices.getAllTestimonials(req.query);
    const { testimonials, meta } = result;
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Testimonials retrieved successfully!',
        data: testimonials,
        meta,
    });
}));
const getSingleTestimonial = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield testimonial_service_1.TestimonialServices.getSingleTestimonial((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.testimonialId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Testimonial retrieved successfully!',
        data: result,
    });
}));
const updateTestimonialVisibility = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield testimonial_service_1.TestimonialServices.updateTestimonialVisibility((_a = req.params) === null || _a === void 0 ? void 0 : _a.testimonialId, (_b = req.body) === null || _b === void 0 ? void 0 : _b.show);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Testimonial visibility updated successfully!',
        data: result,
    });
}));
const updateTestimonialByProvider = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield testimonial_service_1.TestimonialServices.updateTestimonialByProvider((_a = req.params) === null || _a === void 0 ? void 0 : _a.testimonialId, req.body, req === null || req === void 0 ? void 0 : req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Your Testimonial data updated successfully!',
        data: result,
    });
}));
exports.TestimonialControllers = {
    createTestimonial,
    getAllTestimonials,
    getSingleTestimonial,
    updateTestimonialVisibility,
    updateTestimonialByProvider,
};
