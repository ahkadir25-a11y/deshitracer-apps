import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { stringToSlug } from '../../utils/lib/slug';
import QueryBuilder from '../../utils/queryBuilder';
import { Business } from '../business/business.model';
import { Subcategory } from '../subcategory/subcategory.model';
import { TCategory } from './category.interface';
import { Category } from './category.model';

const createCategory = async (payload: TCategory) => {
  const slug = stringToSlug(payload.name);

  const categoryData: any = {
    ...payload,
    slug: slug,
  };

  const result = await Category.create(categoryData);
  return result;
};

const getAllCategories = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder<TCategory>(
    Category.find().populate('subCategories'),
    query,
  )
    .search(['name', 'details'])
    .filter()
    .paginate();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleCategory = async (slug: string) => {
  const category = await Category.findOne({ slug }).populate('subCategories');
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }
  return category;
};

const updateCategory = async (slug: string, payload: Partial<TCategory>) => {
  const newSlug = payload.name ? stringToSlug(payload.name) : slug;

  const { subCategories, ...remaining } = payload;

  const updatedCategory = await Category.findOneAndUpdate(
    { slug },
    { ...remaining, slug: newSlug },
    { new: true, runValidators: true },
  );
  if (!updatedCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }
  return updatedCategory;
};

const deleteCategory = async (slug: string) => {
  // Find the category
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found.');
  }

  if (category?.subCategories.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `failed to delete: ${category?.subCategories.length} sub-categories exists under ${category.name} category.`,
    );
  }

  const isBusiness = await Business.countDocuments({ category: category._id });
  if (isBusiness > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `failed to delete: ${isBusiness} Business are registered by ${category.name} category.`,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete all subcategories associated with this category
    await Subcategory.deleteMany({ parentCategory: category._id }, { session });

    // Delete the category itself
    const result = await Category.findOneAndDelete({ slug }, { session });

    await session.commitTransaction();

    return result;
  } catch (error: any) {
    await session.abortTransaction();

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message ||
        'Failed to delete category and associated subcategories.',
    );
  } finally {
    session.endSession();
  }
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
