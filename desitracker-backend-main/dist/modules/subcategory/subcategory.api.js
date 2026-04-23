"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategoryRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const subcategory_controller_1 = require("./subcategory.controller");
const router = (0, express_1.Router)();
// Create a SubCategory (Admin only)
router.post('/create', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), subcategory_controller_1.SubCategoryControllers.createSubcategory);
// Get all SubCategories (Admin or authenticated users)
router.get('/', subcategory_controller_1.SubCategoryControllers.getAllSubcategories);
// Get SubCategory by Slug (Admin or authenticated users)
router.get('/:slug', subcategory_controller_1.SubCategoryControllers.getSingleSubcategory);
// Update a SubCategory by Slug (Admin only)
router.put('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), subcategory_controller_1.SubCategoryControllers.updateSubcategory);
// Delete a SubCategory by Slug (Admin only)
router.delete('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), subcategory_controller_1.SubCategoryControllers.deleteSubcategory);
exports.SubCategoryRoutes = router;
