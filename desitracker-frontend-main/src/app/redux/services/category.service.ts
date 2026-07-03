// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

import baseApi from "../baseApi";

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  user_id: string;
  business_id: string;
  _id?: string; // optional for creation
  foodOrDrink?:string;
}
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
export interface CategoryQuery { user_id?: string; business_id?: string; }

export interface Category extends CreateCategoryDTO {
  _id: string;
  products?: any[];
}

const CATEGORIES_URL = '/products/category'; // <-- adjust if your router is mounted elsewhere

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], CategoryQuery | void>({
      query: (params) => ({ url: CATEGORIES_URL, params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Category' as const, id: c._id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    getCategory: build.query<Category, string>({
      query: (id) => `${CATEGORIES_URL}/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Category', id }],
    }),

    createCategory: build.mutation<Category, CreateCategoryDTO>({
      query: (body) => ({ url: `${CATEGORIES_URL}/create`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: build.mutation<Category, { id: string; patch: UpdateCategoryDTO }>({
      query: ({ id, patch }) => ({
        url: `${CATEGORIES_URL}/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Category', id }],
    }),

    deleteCategory: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `${CATEGORIES_URL}/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
