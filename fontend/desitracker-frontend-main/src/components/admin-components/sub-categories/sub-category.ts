import { TCategory } from "../categories/category.types";

export interface TSubCategory {
  _id: string;
  name: string;
  slug: string;
  parentCategory: TCategory;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
