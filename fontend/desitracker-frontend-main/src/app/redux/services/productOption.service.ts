import baseApi from "../baseApi";

export interface IProductOption {
  _id: string;
  name: string;
  options: string[];
  userId: string;
}

export interface CreateProductOptionDTO {
  name: string;
  options: string[];
  userId: string;
}

export interface UpdateProductOptionDTO {
  name?: string;
  options?: string[];
  userId: string;
}

const productOptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ───────── Create Product Option ─────────
    createProductOption: builder.mutation<IProductOption, CreateProductOptionDTO>({
      query: (body) => ({
        url: "/product-options/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ProductOption", id: "LIST" }],
    }),

    // ───────── Get ALL Product Options by user ─────────
    getProductOptions: builder.query<IProductOption[], string>({
      query: (userId) => ({
        url: `/product-options?userId=${userId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((option) => ({
                type: "ProductOption" as const,
                id: option._id,
              })),
              { type: "ProductOption" as const, id: "LIST" },
            ]
          : [{ type: "ProductOption" as const, id: "LIST" }],
    }),

    // ───────── Get Single Product Option by user ─────────
    getSingleProductOption: builder.query<
      IProductOption,
      { optionId: string; userId: string }
    >({
      query: ({ optionId, userId }) => ({
        url: `/product-options/${optionId}?userId=${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, { optionId }) => [
        { type: "ProductOption", id: optionId },
      ],
    }),

    // ───────── Update Product Option ─────────
    updateProductOption: builder.mutation<
      IProductOption,
      { optionId: string; updateData: UpdateProductOptionDTO }
    >({
      query: ({ optionId, updateData }) => ({
        url: `/product-options/${optionId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { optionId }) => [
        { type: "ProductOption", id: optionId },
        { type: "ProductOption", id: "LIST" },
      ],
    }),

    // ───────── Delete Product Option ─────────
    deleteProductOption: builder.mutation<
      { message: string },
      { optionId: string; userId: string }
    >({
      query: ({ optionId, userId }) => ({
        url: `/product-options/${optionId}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { optionId }) => [
        { type: "ProductOption", id: optionId },
        { type: "ProductOption", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateProductOptionMutation,
  useGetProductOptionsQuery,
  useGetSingleProductOptionQuery,
  useUpdateProductOptionMutation,
  useDeleteProductOptionMutation,
} = productOptionApi;

export default productOptionApi;