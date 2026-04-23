/* eslint-disable @typescript-eslint/no-explicit-any */

import baseApi from '../baseApi';
import { CreateCategoryDTO } from './category.service';

export type GetActiveTodayOfferQuery = {
  business_id: string;            // required
  user_id?: string;
  product_category_id?: string;
  day?: Weekday | string;         // optional override (testing)
};

export type ActiveTodayOfferResponse =
  | { active: true; day: Weekday; offer: IDayOffer }
  | { active: false; day: Weekday; offer: null };


export interface IProduct {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: any;
  thumbnail: string;
  user_id: any;
  business_id: any;
  currency: string;
  product_category_id?: string;

  // NEW: discount fields
  discount_percent?: number;         // 0–100
  discount_start?: string | null;    // ISO string or null
  discount_end?: string | null;      // ISO string or null

  // NEW: virtuals coming from backend (read-only)
  final_price?: number;
  discount_active?: boolean;
  current_discount_percent?: number;
}

/** Query params for products-by-category */
type GetProductsByCategoryArgs = {
  categoryId: string;
  user_id?: string;
  business_id?: string;
};

/** NEW: bulk discount payload now supports time window */
type BulkDiscountDTO = {
  productIds?: string[];
  filters?: {
    user_id?: string;
    business_id?: string;
    product_category_id?: string;
  };
  discount_percent: number;
  discount_start?: string | null;   // optional
  discount_end?: string | null;     // optional
};

// Weekday type to mirror backend enum
export type Weekday =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Day Offer model shape (matches backend)
export interface IDayOffer {
  _id: string;
  user_id: string;
  business_id: string;
  product_category_id?: string;
  day: Weekday;
  discount_percent: number;        // 0–100
  start_date: string;              // ISO
  end_date: string | null;         // ISO or null
  createdAt: string;
  updatedAt: string;
}

// Create/Update/Apply DTOs
export type CreateDayOfferDTO = {
  user_id: string;
  business_id: string;
  product_category_id?: string;
  day: Weekday | string;           // backend normalizes
  discount_percent: number;
  start_date: string;              // ISO
  end_date?: string | null;        // optional
};

export type UpdateDayOfferDTO = Partial<{
  product_category_id: string | null;
  day: Weekday | string;
  discount_percent: number;
  start_date: string;              // ISO
  end_date: string | null;         // ISO or null
}>;

export type ListDayOffersQuery = {
  user_id?: string;
  business_id?: string;
  country?: string;   // NEW
  city?: string;      // NEW
};

export type ApplyDayOfferTodayDTO = {
  user_id: string;
  business_id: string;
  day?: Weekday | string;          // optional override
};


const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ───────── existing queries … ─────────
    getProductsCategoryByUserAndBusiness: builder.query<
      CreateCategoryDTO[],
      { user_id: string; business_id: string }
    >({
      query: ({ user_id, business_id }) => ({
        url: `/products/products-category/${user_id}/${business_id}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    getProductsByUserAndBusiness: builder.query<
      IProduct[],
      { user_id: string; business_id: string }
    >({
      query: ({ user_id, business_id }) => ({
        url: `/products/products/${user_id}/${business_id}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    getProductById: builder.query<IProduct, string>({
      query: (id) => ({
        url: `/products/product/${id}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    // ──────────────────────────────────────
    // products in a single category
    // ──────────────────────────────────────
    getProductsByCategory: builder.query<IProduct[], GetProductsByCategoryArgs>({
      query: ({ categoryId, user_id, business_id }) => {
        const qp = new URLSearchParams();
        if (user_id) qp.append('user_id', user_id);
        if (business_id) qp.append('business_id', business_id);

        return {
          url: `/products/category-products/${categoryId}${qp.size ? `?${qp.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Product'],
    }),

    // ───────── mutations … ─────────
    // Tip: keep Partial<IProduct> so callers can send discount_start/end too
    addProduct: builder.mutation<IProduct, Partial<IProduct>>({
      query: (newProduct) => ({
        url: '/products/create',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Product'],
    }),

    editProduct: builder.mutation<
      IProduct,
      { productId: string; updateData: Partial<IProduct> }
    >({
      query: ({ productId, updateData }) => ({
        url: `/products/products/${productId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/products/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // NEW: bulk update supports window fields
    bulkUpdateDiscount: builder.mutation<
      {
        message: string;
        matchedCount: number;
        modifiedCount: number;
        discount_percent: number;
        discount_start?: string | null;
        discount_end?: string | null;
      },
      BulkDiscountDTO
    >({
      query: (body) => ({
        url: '/products/products/discount/bulk',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    createDayOffer: builder.mutation<IDayOffer, CreateDayOfferDTO>({
      query: (body) => ({ url: '/products/poffer/day-offers', method: 'POST', body }),
      invalidatesTags: [{ type: 'DayOffer', id: 'LIST' }], // plus Product if you like
    }),

    // List (optionally filtered by user_id / business_id)
    listDayOffers: builder.query<IDayOffer[], ListDayOffersQuery | void>({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.user_id) qp.append("user_id", params.user_id);
        if (params?.business_id) qp.append("business_id", params.business_id);
        if (params?.country) qp.append("country", params.country); // NEW
        if (params?.city) qp.append("city", params.city);           // NEW
        return { url: `/products/poffer/day-offers${qp.size ? `?${qp.toString()}` : ''}`, method: 'GET' };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(o => ({ type: 'DayOffer' as const, id: o._id })),
            { type: 'DayOffer' as const, id: 'LIST' },
          ]
          : [{ type: 'DayOffer' as const, id: 'LIST' }],
    }),

    // Get single day-offer by id
    getDayOffer: builder.query<IDayOffer, string>({
      query: (id) => ({ url: `/products/poffer/day-offers/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'DayOffer', id }],
    }),

    // Update day-offer
    updateDayOffer: builder.mutation<IDayOffer, { id: string; updates: UpdateDayOfferDTO }>({
      query: ({ id, updates }) => ({ url: `/products/poffer/day-offers/${id}`, method: 'PUT', body: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'DayOffer', id }, { type: 'DayOffer', id: 'LIST' }],
    }),

    // Delete day-offer
    deleteDayOffer: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/products/poffer/day-offers/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'DayOffer', id }, { type: 'DayOffer', id: 'LIST' }],
    }),
    // Apply today's offer (bulk updates product discounts for today)
    applyDayOfferToday: builder.mutation<
      {
        message: string;
        day: Weekday;
        applied: boolean;
        discount_percent?: number;
        matchedCount: number;
        modifiedCount: number;
      },
      ApplyDayOfferTodayDTO
    >({
      query: (body) => ({
        url: '/products/poffer/day-offers/apply-today',
        method: 'POST',
        body,
      }),
      // Applying may change product pricing/flags immediately
      invalidatesTags: ['Product'],
    }),

    getActiveTodayDayOffer: builder.query<ActiveTodayOfferResponse, GetActiveTodayOfferQuery>({
      query: ({ business_id, user_id, product_category_id, day }) => {
        const qp = new URLSearchParams();
        qp.append("business_id", business_id);
        if (user_id) qp.append("user_id", user_id);
        if (product_category_id) qp.append("product_category_id", product_category_id);
        if (day) qp.append("day", day);

        return {
          url: `/products/poffer/day-offers/active-today?${qp.toString()}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "DayOffer" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsCategoryByUserAndBusinessQuery,
  useGetProductsByUserAndBusinessQuery,
  useGetProductsByCategoryQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
  useBulkUpdateDiscountMutation,
  useCreateDayOfferMutation,
  useListDayOffersQuery,
  useGetDayOfferQuery,
  useUpdateDayOfferMutation,
  useDeleteDayOfferMutation,
  useApplyDayOfferTodayMutation,
  useGetActiveTodayDayOfferQuery,
} = productsApi;

export default productsApi;
