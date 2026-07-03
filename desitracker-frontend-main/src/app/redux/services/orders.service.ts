import baseApi from "../baseApi";

export type OrderItemOption = {
  optionGroupId: string;
  optionGroupName: string;
  value: string;
};

export type OrderItem = {
  lineId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
  product_category_id?: string;
  product_category_type?: string;
  selectedOptions?: OrderItemOption[];
};

export type MembershipDiscountPayload = {
  applied: boolean;
  percent: number;
  discountAmount: number;
  payable: number;
  offer: any | null;
};

export type CreateOrderDTO = {
  business_id: string;
  user_id: string;
  businessName?: string;
  tableNo: string;
  notes: string;
  items: OrderItem[];
  totals: {
    totalQty: number;
    subtotal: number;
  };
  membershipDiscount?: MembershipDiscountPayload;
  currency?: string;
  status?: "pending" | "completed" | "cancelled";
};

export type UpdateOrderDTO = {
  business_id?: string;
  user_id?: string;
  businessName?: string;
  tableNo?: string;
  notes?: string;
  items?: OrderItem[];
  totalQty?: number;
  subtotal?: number;
  membershipDiscount?: MembershipDiscountPayload;
  currency?: string;
  status?: "pending" | "completed" | "cancelled";
};

export type Order = {
  _id: string;
  business_id: string;
  user_id: string;
  businessName?: string;
  tableNo: string;
  notes: string;
  items: OrderItem[];
  totalQty: number;
  subtotal: number;
  membershipDiscount?: MembershipDiscountPayload;
  currency?: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, CreateOrderDTO>({
      query: (body) => ({
        url: "/orders/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    listOrders: builder.query<Order[], { business_id: string; user_id?: string; status?: string }>({
      query: ({ business_id, user_id, status }) => {
        const qp = new URLSearchParams();
        qp.append("business_id", business_id);
        if (user_id) qp.append("user_id", user_id);
        if (status) qp.append("status", status);

        return {
          url: `/orders?${qp.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<Order, { id: string; business_id: string }>({
      query: ({ id, business_id }) => ({
        url: `/orders/${id}?business_id=${business_id}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    updateOrder: builder.mutation<
      Order,
      { id: string; business_id: string; updates: UpdateOrderDTO }
    >({
      query: ({ id, business_id, updates }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body: {
          business_id,
          ...updates,
        },
      }),
      invalidatesTags: ["Order"],
    }),

    deleteOrder: builder.mutation<{ message: string }, { id: string; business_id: string }>({
      query: ({ id, business_id }) => ({
        url: `/orders/${id}?business_id=${business_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;

export default ordersApi;