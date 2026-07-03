export interface TSubCategory {
  _id: string;
  name: string;
  slug: string;
  details: string;
  parentCategory: {
    _id : string
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
