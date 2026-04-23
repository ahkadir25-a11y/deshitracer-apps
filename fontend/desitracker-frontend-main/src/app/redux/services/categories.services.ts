import baseApi from "../baseApi";

const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query({
      query: ({ categorySlug }) => {
        return {
          url: `/category/${categorySlug}`, // Use categorySlug from params
          method: "GET",
        };
      },
      providesTags: ["Category"],
    }),

    getAllCategories: builder.query({
      query: (params = {}) => {
        // /?${queryString}
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `/category?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (newCategoryData) => ({
        url: "/products/category/create",
        method: "POST",
        body: newCategoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ slug, updatedCategoryData }) => {
        // Log the slug and updated data to verify it's correct

        return {
          url: `/category/${slug}`,
          method: "PUT",
          body: updatedCategoryData,
        };
      },
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (slug) => ({
        url: `/category/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
