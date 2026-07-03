import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { InventoryControllers } from './inventory.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.createIngredient
);

router.get(
  '/business/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.getIngredientsByBusiness
);

router.post(
  '/adjust',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.adjustStock
);

router.get(
  '/history/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.getStockHistory
);

router.patch(
  '/:ingredientId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.updateIngredient
);

router.delete(
  '/:ingredientId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  InventoryControllers.deleteIngredient
);

export const InventoryRoutes = router;
