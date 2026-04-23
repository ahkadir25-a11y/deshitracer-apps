import { Types } from 'mongoose';

export type TSubcategory = {
  name: string;
  icon: string;
  slug: string;
  details: string;
  parentCategory: Types.ObjectId;
};
