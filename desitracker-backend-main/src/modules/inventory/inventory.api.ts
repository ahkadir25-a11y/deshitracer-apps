import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { InventoryControllers } from './inventory.controller';
import requirePermission from '../../middlewares/requirePermission';
import { requireBusinessAccess } from '../../utils/lib/businessAccess';

const router = Router();

// auth() + requirePermission() only prove the caller holds a business role
// somewhere — not that :businessId (or body.business / body.businessId) is
// theirs. Without requireBusinessAccess any owner could read, add to, or
// adjust another business's stock. PATCH/DELETE name only an ingredient, so
// they prove ownership in the controller (assertOwnsRecord).

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  requireBusinessAccess,
  InventoryControllers.createIngredient
);

router.get(
  '/business/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canViewInventory'),
  requireBusinessAccess,
  InventoryControllers.getIngredientsByBusiness
);

router.post(
  '/adjust',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canEditInventory'),
  requireBusinessAccess,
  InventoryControllers.adjustStock
);

router.get(
  '/history/:businessId',
  auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF),
  requirePermission('canViewInventory'),
  requireBusinessAccess,
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
