import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';
import { CategoryControllers } from './category.controller';

const router = Router();

// Create a category (Admin only)
router.post(
  '/create',
  auth(USER_ROLE.ADMIN),
  CategoryControllers.createCategory,
);

// Get all categories (Public)
router.get('/', CategoryControllers.getAllCategories);

// Get a single category by slug (Public)
router.get('/:slug', CategoryControllers.getSingleCategory);

// Update a category by slug (Admin only)
router.put('/:slug', auth(USER_ROLE.ADMIN), CategoryControllers.updateCategory);

// Delete a category by slug (Admin only)
router.delete(
  '/:slug',
  auth(USER_ROLE.ADMIN),
  CategoryControllers.deleteCategory,
);

export const CategoryRoutes = router;
