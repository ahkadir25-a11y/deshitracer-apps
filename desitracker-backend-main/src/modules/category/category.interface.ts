import { Types } from 'mongoose';

export type TCategory = {
  name: string;
  icon: string;
  slug: string;
  details: string;
  subCategories: Types.ObjectId[];
};
