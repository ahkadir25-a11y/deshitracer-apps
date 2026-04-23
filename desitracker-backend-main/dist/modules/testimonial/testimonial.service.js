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
exports.TestimonialServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const queryBuilder_1 = __importDefault(require("../../utils/queryBuilder"));
const testimonial_model_1 = __importDefault(require("./testimonial.model"));
const createTestimonial = (payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    return yield testimonial_model_1.default.create(Object.assign(Object.assign({}, payload), { user: decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser.id }));
});
const getAllTestimonials = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const testimonialQuery = new queryBuilder_1.default(testimonial_model_1.default.find().populate([
        {
            path: 'user',
            model: 'User',
        },
    ]), query)
        .search(['name', 'feedback']) // Enable search by name & feedback
        .filter()
        .sort()
        .paginate()
        .fieldsLimit();
    const testimonials = yield testimonialQuery.modelQuery;
    const meta = yield testimonialQuery.countTotal();
    return { testimonials, meta };
});
const getSingleTestimonial = (testimonialId) => __awaiter(void 0, void 0, void 0, function* () {
    const testimonial = yield testimonial_model_1.default.findById(testimonialId)
        .populate('user')
        .exec();
    if (!testimonial) {
        throw new AppError_1.default(404, 'Testimonial not found!');
    }
    return testimonial;
});
const updateTestimonialVisibility = (testimonialId, show) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTestimonial = yield testimonial_model_1.default.findByIdAndUpdate(testimonialId, { show: show }, { new: true, runValidators: true });
    if (!updatedTestimonial) {
        throw new AppError_1.default(404, 'Testimonial not found!');
    }
    return updatedTestimonial;
});
const updateTestimonialByProvider = (testimonialId, payload, decodedUser) => __awaiter(void 0, void 0, void 0, function* () {
    const testimonial = yield testimonial_model_1.default.findById(testimonialId);
    if (!testimonial) {
        throw new AppError_1.default(404, 'Testimonial is not found.');
    }
    if (testimonial.user.toString() !== decodedUser.id.toString()) {
        throw new AppError_1.default(403, 'You are not authorized to edit this testimonial.');
    }
    const { user, show } = payload, remaining = __rest(payload, ["user", "show"]);
    const updatedTestimonialData = {
        rating: (payload === null || payload === void 0 ? void 0 : payload.rating) ? payload === null || payload === void 0 ? void 0 : payload.rating : testimonial === null || testimonial === void 0 ? void 0 : testimonial.rating,
        feedback: (payload === null || payload === void 0 ? void 0 : payload.feedback) ? payload === null || payload === void 0 ? void 0 : payload.feedback : testimonial === null || testimonial === void 0 ? void 0 : testimonial.feedback,
    };
    const updatedTestimonial = yield testimonial_model_1.default.findByIdAndUpdate(testimonialId, updatedTestimonialData, { new: true, runValidators: true });
    if (!updatedTestimonial) {
        throw new AppError_1.default(404, 'Testimonial not found!');
    }
    return updatedTestimonial;
});
exports.TestimonialServices = {
    createTestimonial,
    getAllTestimonials,
    getSingleTestimonial,
    updateTestimonialVisibility,
    updateTestimonialByProvider,
};
