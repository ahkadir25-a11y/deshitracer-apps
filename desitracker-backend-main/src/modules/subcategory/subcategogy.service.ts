import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { stringToSlug } from '../../utils/lib/slug';
import QueryBuilder from '../../utils/queryBuilder';
import { Category } from '../category/category.model';
import { TSubcategory } from './subcategory.interface';
import { Subcategory } from './subcategory.model';

// Create Subcategory
const createSubcategory = async (payload: TSubcategory) => {
  if (!payload.parentCategory) {
    throw new AppError(
      400,
      'Parent category is required to create a subcategory.',
    );
  }

  // Generate slug from name
  const slug = stringToSlug(payload.name);

  // Prepare the SubCategory data with slug and author
  const subCategoryData: TSubcategory = {
    ...payload,
    slug,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await Subcategory.create([subCategoryData], { session });

    // Update the parent category with the new subcategory ID
    await Category.findByIdAndUpdate(
      payload.parentCategory,
      { $addToSet: { subCategories: result[0]._id } },
      { session },
    );

    // Commit the transaction
    await session.commitTransaction();

    return result[0];
  } catch (error: any) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to create subcategory.',
    );
  } finally {
    session.endSession();
  }
};

// Get All Subcategories
const getAllSubcategories = async (query: Record<string, unknown>) => {
  const subCategoryQuery = new QueryBuilder<TSubcategory>(
    Subcategory.find().populate('parentCategory'),
    query
  )
    .search(['name', 'details'])
    .filter() // Handle parentCategory filter here
    .sort()
    .paginate();

  // Add parentCategory filter if provided
  if (query.parentCategory) {
    subCategoryQuery.modelQuery = subCategoryQuery.modelQuery.where({
      parentCategory: query.parentCategory,
    });
  }

  const result = await subCategoryQuery.modelQuery;
  const meta = await subCategoryQuery.countTotal();

  return {
    meta,
    result,
  };
};

// Get Single Subcategory by Slug
const getSingleSubcategory = async (slug: string) => {
  const subcategory = await Subcategory.findOne({ slug }).populate(
    'parentCategory',
  );

  if (!subcategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found.');
  }

  return subcategory;
};

// Update Subcategory by Slug
const updateSubcategory = async (
  slug: string,
  payload: Partial<TSubcategory>,
) => {
  const subcategory = await Subcategory.findOne({ slug });

  if (!subcategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found.');
  }

  const updatedSubcategoryData = { ...payload };

  // Ensure slug is updated or generated
  if (payload.name) {
    updatedSubcategoryData.slug = stringToSlug(payload.name);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Handle parent category change
    if (payload.parentCategory) {
      const newParentId = payload.parentCategory;
      const oldParentId = subcategory.parentCategory;

      // Update the new parent category to include this subcategory ID
      await Category.findByIdAndUpdate(
        newParentId,
        { $addToSet: { subCategories: subcategory._id } },
        { session },
      );

      // Remove the subcategory ID from the old parent category (if different)
      if (oldParentId && oldParentId.toString() !== newParentId.toString()) {
        await Category.findByIdAndUpdate(
          oldParentId,
          { $pull: { subCategories: subcategory._id } },
          { session },
        );
      }
    }

    // Update the subcategory data
    const result = await Subcategory.findOneAndUpdate(
      { slug },
      updatedSubcategoryData,
      { new: true, session },
    );

    await session.commitTransaction();

    return result;
  } catch (error: any) {
    await session.abortTransaction();

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to update subcategory.',
    );
  } finally {
    session.endSession();
  }
};

// Delete Subcategory by Slug
const deleteSubcategory = async (slug: string) => {
  const subcategory = await Subcategory.findOne({ slug });

  if (!subcategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subcategory not found.');
  }

  const isBusiness = await Subcategory.countDocuments({
    subCategory: subcategory._id,
  });
  if (isBusiness > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `failed to delete: ${isBusiness} Business are registered by ${subcategory.name} category.`,
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove the subcategory ID from its parent category
    if (subcategory.parentCategory) {
      await Category.findByIdAndUpdate(
        subcategory.parentCategory,
        { $pull: { subCategories: subcategory._id } },
        { session },
      );
    }

    // Delete the subcategory
    const result = await Subcategory.findOneAndDelete({ slug }, { session });

    await session.commitTransaction();

    return result;
  } catch (error: any) {
    await session.abortTransaction();

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to delete subcategory.',
    );
  } finally {
    session.endSession();
  }
};

export const SubCategoryServices = {
  createSubcategory,
  getAllSubcategories,
  getSingleSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
