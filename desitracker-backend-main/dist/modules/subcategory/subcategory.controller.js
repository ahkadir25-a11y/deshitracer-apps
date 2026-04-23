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
exports.SubCategoryControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const subcategogy_service_1 = require("./subcategogy.service");
// Create SubCategory
const createSubcategory = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subcategogy_service_1.SubCategoryServices.createSubcategory(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Subcategory created successfully!',
        data: result,
    });
}));
// Get all SubCategories
const getAllSubcategories = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { result, meta } = yield subcategogy_service_1.SubCategoryServices.getAllSubcategories(req === null || req === void 0 ? void 0 : req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Subcategories retrieved successfully!',
        meta,
        data: result,
    });
}));
// Get SubCategory by Slug
const getSingleSubcategory = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield subcategogy_service_1.SubCategoryServices.getSingleSubcategory((_a = req.params) === null || _a === void 0 ? void 0 : _a.slug);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Subcategory retrieved successfully!',
        data: result,
    });
}));
// Update SubCategory by Slug
const updateSubcategory = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield subcategogy_service_1.SubCategoryServices.updateSubcategory((_a = req.params) === null || _a === void 0 ? void 0 : _a.slug, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Subcategory updated successfully!',
        data: result,
    });
}));
// Delete SubCategory by Slug
const deleteSubcategory = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield subcategogy_service_1.SubCategoryServices.deleteSubcategory((_a = req.params) === null || _a === void 0 ? void 0 : _a.slug);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Subcategory deleted successfully!',
        data: result,
    });
}));
exports.SubCategoryControllers = {
    createSubcategory,
    getAllSubcategories,
    getSingleSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
