"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const category_controller_1 = require("./category.controller");
const router = (0, express_1.Router)();
// Create a category (Admin only)
router.post('/create', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), category_controller_1.CategoryControllers.createCategory);
// Get all categories (Public)
router.get('/', category_controller_1.CategoryControllers.getAllCategories);
// Get a single category by slug (Public)
router.get('/:slug', category_controller_1.CategoryControllers.getSingleCategory);
// Update a category by slug (Admin only)
router.put('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), category_controller_1.CategoryControllers.updateCategory);
// Delete a category by slug (Admin only)
router.delete('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), category_controller_1.CategoryControllers.deleteCategory);
exports.CategoryRoutes = router;
