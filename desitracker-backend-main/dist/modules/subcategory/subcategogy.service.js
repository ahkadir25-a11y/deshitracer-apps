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
exports.SubCategoryServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const slug_1 = require("../../utils/lib/slug");
const queryBuilder_1 = __importDefault(require("../../utils/queryBuilder"));
const category_model_1 = require("../category/category.model");
const subcategory_model_1 = require("./subcategory.model");
// Create Subcategory
const createSubcategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.parentCategory) {
        throw new AppError_1.default(400, 'Parent category is required to create a subcategory.');
    }
    // Generate slug from name
    const slug = (0, slug_1.stringToSlug)(payload.name);
    // Prepare the SubCategory data with slug and author
    const subCategoryData = Object.assign(Object.assign({}, payload), { slug });
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const result = yield subcategory_model_1.Subcategory.create([subCategoryData], { session });
        // Update the parent category with the new subcategory ID
        yield category_model_1.Category.findByIdAndUpdate(payload.parentCategory, { $addToSet: { subCategories: result[0]._id } }, { session });
        // Commit the transaction
        yield session.commitTransaction();
        return result[0];
    }
    catch (error) {
        // Rollback the transaction in case of an error
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to create subcategory.');
    }
    finally {
        session.endSession();
    }
});
// Get All Subcategories
const getAllSubcategories = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const subCategoryQuery = new queryBuilder_1.default(subcategory_model_1.Subcategory.find().populate('parentCategory'), query)
        .search(['name', 'details'])
        .filter() // Handle parentCategory filter here
        .sort()
        .paginate();
    // Add parentCategory filter if provided
    if (query.parentCategory) {
        subCategoryQuery.modelQuery = subCategoryQuery.modelQuery.where({
            parentCategory: query.parentCategory,
        });
    }
    const result = yield subCategoryQuery.modelQuery;
    const meta = yield subCategoryQuery.countTotal();
    return {
        meta,
        result,
    };
});
// Get Single Subcategory by Slug
const getSingleSubcategory = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const subcategory = yield subcategory_model_1.Subcategory.findOne({ slug }).populate('parentCategory');
    if (!subcategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subcategory not found.');
    }
    return subcategory;
});
// Update Subcategory by Slug
const updateSubcategory = (slug, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const subcategory = yield subcategory_model_1.Subcategory.findOne({ slug });
    if (!subcategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subcategory not found.');
    }
    const updatedSubcategoryData = Object.assign({}, payload);
    // Ensure slug is updated or generated
    if (payload.name) {
        updatedSubcategoryData.slug = (0, slug_1.stringToSlug)(payload.name);
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Handle parent category change
        if (payload.parentCategory) {
            const newParentId = payload.parentCategory;
            const oldParentId = subcategory.parentCategory;
            // Update the new parent category to include this subcategory ID
            yield category_model_1.Category.findByIdAndUpdate(newParentId, { $addToSet: { subCategories: subcategory._id } }, { session });
            // Remove the subcategory ID from the old parent category (if different)
            if (oldParentId && oldParentId.toString() !== newParentId.toString()) {
                yield category_model_1.Category.findByIdAndUpdate(oldParentId, { $pull: { subCategories: subcategory._id } }, { session });
            }
        }
        // Update the subcategory data
        const result = yield subcategory_model_1.Subcategory.findOneAndUpdate({ slug }, updatedSubcategoryData, { new: true, session });
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to update subcategory.');
    }
    finally {
        session.endSession();
    }
});
// Delete Subcategory by Slug
const deleteSubcategory = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const subcategory = yield subcategory_model_1.Subcategory.findOne({ slug });
    if (!subcategory) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subcategory not found.');
    }
    const isBusiness = yield subcategory_model_1.Subcategory.countDocuments({
        subCategory: subcategory._id,
    });
    if (isBusiness > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `failed to delete: ${isBusiness} Business are registered by ${subcategory.name} category.`);
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Remove the subcategory ID from its parent category
        if (subcategory.parentCategory) {
            yield category_model_1.Category.findByIdAndUpdate(subcategory.parentCategory, { $pull: { subCategories: subcategory._id } }, { session });
        }
        // Delete the subcategory
        const result = yield subcategory_model_1.Subcategory.findOneAndDelete({ slug }, { session });
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to delete subcategory.');
    }
    finally {
        session.endSession();
    }
});
exports.SubCategoryServices = {
    createSubcategory,
    getAllSubcategories,
    getSingleSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
