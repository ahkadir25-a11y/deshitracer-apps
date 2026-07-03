"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRoutes = void 0;
// routes/productRoutes.ts
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const categoryController_1 = require("./categoryController");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const router = (0, express_1.Router)();
// Write operations require an authenticated business user. GET routes stay
// public so customers can browse menus. (All writes were previously open.)
const requireBiz = (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF);
router.post('/create', requireBiz, product_controller_1.ProductControllers.addProduct); // Create product
router.put('/products/:productId', requireBiz, product_controller_1.ProductControllers.editProduct); // Update product
router.delete('/products/:productId', requireBiz, product_controller_1.ProductControllers.deleteProduct); // Delete product
router.get('/products/:user_id/:business_id', product_controller_1.ProductControllers.getProductsByUserAndBusiness);
router.get('/products-category/:user_id/:business_id', product_controller_1.ProductControllers.getProductsCategoryByUserAndBusiness);
router.get('/product/:id', product_controller_1.ProductControllers.getProductById);
router.get('/category-products/:categoryId', product_controller_1.ProductControllers.getProductsByCategory);
router.post('/category/create', requireBiz, categoryController_1.createCategory);
router.get('/category', categoryController_1.getCategories);
router.get('/:id', categoryController_1.getCategoryById);
// Cast: these controllers declare a typed `:id` param which clashes with the
// generic auth middleware during Express overload resolution. Runtime-safe.
router.put('/category/:id', requireBiz, categoryController_1.updateCategory);
router.delete('/category/:id', requireBiz, categoryController_1.deleteCategory);
router.put('/products/discount/bulk', requireBiz, product_controller_1.ProductControllers.bulkUpdateDiscount);
// Day-offer routes (limit 7 per business, unique weekday)
router.get("/poffer/day-offers/active-today", product_controller_1.ProductControllers.getActiveTodayDayOffer);
router.post('/poffer/day-offers/apply-today', requireBiz, product_controller_1.ProductControllers.applyDayOfferToday);
router.post('/poffer/day-offers', requireBiz, product_controller_1.ProductControllers.createDayOffer);
router.get('/poffer/day-offers', product_controller_1.ProductControllers.listDayOffers);
const objectId = ':id([0-9a-fA-F]{24})';
router.get(`/poffer/day-offers/${objectId}`, product_controller_1.ProductControllers.getDayOffer);
router.put(`/poffer/day-offers/${objectId}`, requireBiz, product_controller_1.ProductControllers.updateDayOffer);
router.delete(`/poffer/day-offers/${objectId}`, requireBiz, product_controller_1.ProductControllers.deleteDayOffer);
exports.ProductsRoutes = router;
