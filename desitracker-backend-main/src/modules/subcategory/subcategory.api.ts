import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { SubCategoryControllers } from './subcategory.controller';

const router = Router();

// Create a SubCategory (Admin only)
router.post(
  '/create',
  auth(USER_ROLE.ADMIN),

  SubCategoryControllers.createSubcategory,
);

// Get all SubCategories (Admin or authenticated users)
router.get('/', SubCategoryControllers.getAllSubcategories);

// Get SubCategory by Slug (Admin or authenticated users)
router.get('/:slug', SubCategoryControllers.getSingleSubcategory);

// Update a SubCategory by Slug (Admin only)
router.put(
  '/:slug',
  auth(USER_ROLE.ADMIN),
  SubCategoryControllers.updateSubcategory,
);

// Delete a SubCategory by Slug (Admin only)
router.delete(
  '/:slug',
  auth(USER_ROLE.ADMIN),
  SubCategoryControllers.deleteSubcategory,
);

export const SubCategoryRoutes = router;
