// controllers/categoryController.ts
import { RequestHandler } from 'express';
import slugify from 'slugify';
import ProductCategory from './categoryModel';
// types/category.dto.ts
export interface CreateCategoryDTO {
  name: string;
  description?: string;
  user_id: string;
  business_id: string;
  _id?: string; // optional for creation
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

export interface CategoryIdParam {
  id: string;
}

export interface CategoryQuery {
  user_id?: string;
  business_id?: string;
}
const makeSlug = (text: string) =>
  slugify(text, { lower: true, strict: true, trim: true });

export const createCategory: RequestHandler<{}, any, { name: string; description?: string; user_id: string, business_id: string; foodOrDrink: string; }> =
  async (req, res, next) => {
    try {
      const { name, description, user_id, business_id, foodOrDrink } = req.body;

      const base = makeSlug(name);
      let slug = base;
      let i = 1;

      // ensure uniqueness for this user
      // (unique index also enforces at DB-level)
      while (await ProductCategory.exists({ user_id, slug })) {
        slug = `${base}-${i++}`;
      }

      const category = await ProductCategory.create({ name, description, user_id, slug, business_id: business_id, foodOrDrink });
      res.status(201).json(category);
      return;
    } catch (err: any) {
      // Handle rare race where two requests collide and unique index triggers
      if (err?.code === 11000 && err?.keyPattern?.slug) {
        res.status(409).json({ message: 'Category slug already exists. Try a different name.' });
        return;
      }
      next(err);
    }
  };
export const getCategories: RequestHandler<{}, any, never, CategoryQuery> = async (req, res, next) => {
  try {
    const filter: CategoryQuery = {};
    if (req.query.user_id) filter.user_id = String(req.query.user_id);
    if (req.query.business_id) filter.business_id = String(req.query.business_id);
    const categories = await ProductCategory.find(filter).populate('products').sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) { next(err); }
};

export const getCategoryById: RequestHandler<CategoryIdParam> = async (req, res, next) => {
  try {
    const category = await ProductCategory.findById((req.params.id as string)).populate('products');
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (err) { next(err); }
};

export const updateCategory: RequestHandler<CategoryIdParam, any, UpdateCategoryDTO> =
  async (req, res, next) => {
    try {
      const updated = await ProductCategory.findByIdAndUpdate((req.params.id as string), req.body, { new: true });
      if (!updated) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      res.json(updated);
      return;
    } catch (err) { next(err); }
  };

// Delete has no body; only params
export const deleteCategory: RequestHandler<CategoryIdParam> = async (req, res, next) => {
  try {
    const deleted = await ProductCategory.findByIdAndDelete((req.params.id as string));
    if (!deleted) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) { next(err); }
};