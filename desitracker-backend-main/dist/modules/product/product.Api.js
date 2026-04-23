"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRoutes = void 0;
// routes/productRoutes.ts
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const categoryController_1 = require("./categoryController");
const router = (0, express_1.Router)();
router.post('/create', product_controller_1.ProductControllers.addProduct); // Create product
router.put('/products/:productId', product_controller_1.ProductControllers.editProduct); // Update product
router.delete('/products/:productId', product_controller_1.ProductControllers.deleteProduct); // Delete product
router.get('/products/:user_id/:business_id', product_controller_1.ProductControllers.getProductsByUserAndBusiness);
router.get('/products-category/:user_id/:business_id', product_controller_1.ProductControllers.getProductsCategoryByUserAndBusiness);
router.get('/product/:id', product_controller_1.ProductControllers.getProductById);
router.get('/category-products/:categoryId', product_controller_1.ProductControllers.getProductsByCategory);
router.post('/category/create', categoryController_1.createCategory);
router.get('/category', categoryController_1.getCategories);
router.get('/:id', categoryController_1.getCategoryById);
router.put('/category/:id', categoryController_1.updateCategory);
router.delete('/category/:id', categoryController_1.deleteCategory);
router.put('/products/discount/bulk', product_controller_1.ProductControllers.bulkUpdateDiscount);
// Day-offer routes (limit 7 per business, unique weekday)
router.get("/poffer/day-offers/active-today", product_controller_1.ProductControllers.getActiveTodayDayOffer);
router.post('/poffer/day-offers/apply-today', product_controller_1.ProductControllers.applyDayOfferToday);
router.post('/poffer/day-offers', product_controller_1.ProductControllers.createDayOffer);
router.get('/poffer/day-offers', product_controller_1.ProductControllers.listDayOffers);
const objectId = ':id([0-9a-fA-F]{24})';
router.get(`/poffer/day-offers/${objectId}`, product_controller_1.ProductControllers.getDayOffer);
router.put(`/poffer/day-offers/${objectId}`, product_controller_1.ProductControllers.updateDayOffer);
router.delete(`/poffer/day-offers/${objectId}`, product_controller_1.ProductControllers.deleteDayOffer);
exports.ProductsRoutes = router;
