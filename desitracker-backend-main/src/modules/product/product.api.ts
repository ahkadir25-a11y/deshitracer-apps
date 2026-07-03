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
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = Router();

// Write operations require an authenticated business user. GET routes stay
// public so customers can browse menus. (All writes were previously open.)
const requireBiz = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);

router.post('/create', requireBiz, ProductControllers.addProduct);          // Create product
router.put('/products/:productId', requireBiz, ProductControllers.editProduct);  // Update product
router.delete('/products/:productId', requireBiz, ProductControllers.deleteProduct); // Delete product

router.get('/products/:user_id/:business_id', ProductControllers.getProductsByUserAndBusiness);
router.get('/products-category/:user_id/:business_id', ProductControllers.getProductsCategoryByUserAndBusiness);
router.get('/product/:id', ProductControllers.getProductById);

router.get('/category-products/:categoryId', ProductControllers.getProductsByCategory);

router.post('/category/create', requireBiz, createCategory);
router.get('/category', getCategories);
router.get('/:id', getCategoryById);
// Cast: these controllers declare a typed `:id` param which clashes with the
// generic auth middleware during Express overload resolution. Runtime-safe.
router.put('/category/:id', requireBiz, updateCategory as any);
router.delete('/category/:id', requireBiz, deleteCategory as any);
router.put('/products/discount/bulk', requireBiz, ProductControllers.bulkUpdateDiscount);
// Day-offer routes (limit 7 per business, unique weekday)

router.get("/poffer/day-offers/active-today", ProductControllers.getActiveTodayDayOffer);

router.post('/poffer/day-offers/apply-today', requireBiz, ProductControllers.applyDayOfferToday);
router.post('/poffer/day-offers', requireBiz, ProductControllers.createDayOffer);
router.get('/poffer/day-offers', ProductControllers.listDayOffers);
const objectId = ':id([0-9a-fA-F]{24})';
router.get(`/poffer/day-offers/${objectId}`, ProductControllers.getDayOffer);
router.put(`/poffer/day-offers/${objectId}`, requireBiz, ProductControllers.updateDayOffer);
router.delete(`/poffer/day-offers/${objectId}`, requireBiz, ProductControllers.deleteDayOffer);

export const ProductsRoutes = router;
