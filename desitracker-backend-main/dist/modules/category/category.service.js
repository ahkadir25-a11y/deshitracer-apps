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
exports.CategoryServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const slug_1 = require("../../utils/lib/slug");
const queryBuilder_1 = __importDefault(require("../../utils/queryBuilder"));
const business_model_1 = require("../business/business.model");
const subcategory_model_1 = require("../subcategory/subcategory.model");
const category_model_1 = require("./category.model");
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = (0, slug_1.stringToSlug)(payload.name);
    const categoryData = Object.assign(Object.assign({}, payload), { slug: slug });
    const result = yield category_model_1.Category.create(categoryData);
    return result;
});
const getAllCategories = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryQuery = new queryBuilder_1.default(category_model_1.Category.find().populate('subCategories'), query)
        .search(['name', 'details'])
        .filter()
        .paginate();
    const result = yield categoryQuery.modelQuery;
    const meta = yield categoryQuery.countTotal();
    return {
        meta,
        result,
    };
});
const getSingleCategory = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findOne({ slug }).populate('subCategories');
    if (!category) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found.');
    }
    return category;
});
const updateCategory = (slug, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const newSlug = payload.name ? (0, slug_1.stringToSlug)(payload.name) : slug;
    const { subCategories } = payload, remaining = __rest(payload, ["subCategories"]);
    const updatedCategory = yield category_model_1.Category.findOneAndUpdate({ slug }, Object.assign(Object.assign({}, remaining), { slug: newSlug }), { new: true, runValidators: true });
    if (!updatedCategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found.');
    }
    return updatedCategory;
});
const deleteCategory = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the category
    const category = yield category_model_1.Category.findOne({ slug });
    if (!category) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Category not found.');
    }
    if ((category === null || category === void 0 ? void 0 : category.subCategories.length) > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `failed to delete: ${category === null || category === void 0 ? void 0 : category.subCategories.length} sub-categories exists under ${category.name} category.`);
    }
    const isBusiness = yield business_model_1.Business.countDocuments({ category: category._id });
    if (isBusiness > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `failed to delete: ${isBusiness} Business are registered by ${category.name} category.`);
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Delete all subcategories associated with this category
        yield subcategory_model_1.Subcategory.deleteMany({ parentCategory: category._id }, { session });
        // Delete the category itself
        const result = yield category_model_1.Category.findOneAndDelete({ slug }, { session });
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message ||
            'Failed to delete category and associated subcategories.');
    }
    finally {
        session.endSession();
    }
});
exports.CategoryServices = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
