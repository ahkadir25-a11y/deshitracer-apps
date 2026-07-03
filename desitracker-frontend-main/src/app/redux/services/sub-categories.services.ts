import baseApi from "../baseApi";

const subCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubCategory: builder.query({
      query: (subCategorySlug) => {
        return {
          url: `/sub-category/${subCategorySlug}`,
          method: "GET",
        };
      },
      providesTags: ["SubCategory"],
    }),

   getAllSubCategories: builder.query({
  query: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return {
      url: `/sub-category/?${queryString}`,
      method: "GET",
    };
  },
  providesTags: ["SubCategory"],
}),

    createSubCategory: builder.mutation({
      query: (newSubCategoryData) => ({
        url: "/sub-category/create",
        method: "POST",
        body: newSubCategoryData,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    updateSubCategory: builder.mutation({
      query: ({ slug, updatedSubCategoryData }) => {
        return {
          url: `/sub-category/${slug}`,
          method: "PUT",
          body: updatedSubCategoryData,
        };
      },
      invalidatesTags: ["SubCategory"],
    }),

    deleteSubCategory: builder.mutation({
      query: (slug) => ({
        url: `/sub-category/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),
  }),
});

export const {
  useGetSubCategoryQuery,
  useGetAllSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} = subCategoriesApi;
