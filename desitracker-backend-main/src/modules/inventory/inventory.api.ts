import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { InventoryControllers } from './inventory.controller';
import requirePermission from '../../middlewares/requirePermission';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  InventoryControllers.createIngredient
);

router.get(
  '/business/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canViewInventory'),
  InventoryControllers.getIngredientsByBusiness
);

router.post(
  '/adjust',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  InventoryControllers.adjustStock
);

router.get(
  '/history/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canViewInventory'),
  InventoryControllers.getStockHistory
);

router.patch(
  '/:ingredientId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  InventoryControllers.updateIngredient
);

router.delete(
  '/:ingredientId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  InventoryControllers.deleteIngredient
);

export const InventoryRoutes = router;
