// routes/productRoutes.ts
import { Router } from 'express';
import { ProductControllers } from './product.controller';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from './categoryController';

const router = Router();

router.post('/create', ProductControllers.addProduct);          // Create product
router.put('/products/:productId', ProductControllers.editProduct);  // Update product
router.delete('/products/:productId', ProductControllers.deleteProduct); // Delete product

router.get('/products/:user_id/:business_id', ProductControllers.getProductsByUserAndBusiness);
router.get('/products-category/:user_id/:business_id', ProductControllers.getProductsCategoryByUserAndBusiness);
router.get('/product/:id', ProductControllers.getProductById);

router.get('/category-products/:categoryId', ProductControllers.getProductsByCategory);

router.post('/category/create', createCategory);
router.get('/category', getCategories);
router.get('/:id', getCategoryById);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);
router.put('/products/discount/bulk', ProductControllers.bulkUpdateDiscount);
// Day-offer routes (limit 7 per business, unique weekday)

router.get("/poffer/day-offers/active-today", ProductControllers.getActiveTodayDayOffer);

router.post('/poffer/day-offers/apply-today', ProductControllers.applyDayOfferToday);
router.post('/poffer/day-offers', ProductControllers.createDayOffer);
router.get('/poffer/day-offers', ProductControllers.listDayOffers);
const objectId = ':id([0-9a-fA-F]{24})';
router.get(`/poffer/day-offers/${objectId}`, ProductControllers.getDayOffer);
router.put(`/poffer/day-offers/${objectId}`, ProductControllers.updateDayOffer);
router.delete(`/poffer/day-offers/${objectId}`, ProductControllers.deleteDayOffer);

export const ProductsRoutes = router;
