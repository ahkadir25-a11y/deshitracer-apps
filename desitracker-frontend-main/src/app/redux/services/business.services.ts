import baseApi from "../baseApi";

const businessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBusiness: builder.query({
      query: (slug) => {
        return {
          url: `/business/${slug}`,
          method: "GET",
        };
      },
      providesTags: ["Business"],
    }),

    getAllBusiness: builder.query({
      query: (params = {}) => {
        // Filter out undefined, null, or empty string values from params
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value != null && value !== ""
          )
        );

        // Create queryString only with valid parameters
        const queryString = new URLSearchParams(
          filteredParams as Record<string, string>
        ).toString();

        // If the queryString is empty, return the base URL without parameters
        const url = queryString ? `/business/?${queryString}` : "/business/";

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Business"],
    }),

    createBusiness: builder.mutation({
      query: (newBusinessData) => ({
        url: "/business/register",
        method: "POST",
        body: newBusinessData,
      }),
      invalidatesTags: ["Business"],
    }),

    updateBusiness: builder.mutation({
      query: ({ slug, updatedBusinessData }) => {
        // Log the slug and updated data to verify it's correct

        return {
          url: `/business/${slug}`, // API endpoint with slug
          method: "PUT",
          body: updatedBusinessData, // Data to update
        };
      },
      invalidatesTags: ["Business"],
    }),

    deleteBusiness: builder.mutation({
      query: (slug) => ({
        url: `/business/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Business"],
    }),
    getAllBusinessListing: builder.query({
      query: (params = {}) => {
        // Filter out undefined, null, or empty string values from params
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, value]) => value != null && value !== ""
          )
        );

        // Create queryString only with valid parameters
        const queryString = new URLSearchParams(
          filteredParams as Record<string, string>
        ).toString();

        // If the queryString is empty, return the base URL without parameters
        const url = queryString
          ? `/business/list/?${queryString}`
          : "/business/";

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Business"],
    }),
    getBusinessAnalytics: builder.query({
      query: (businessId) => {
        return {
          url: `/analytics/${businessId}`,
          method: "GET",
        };
      },
      providesTags: ["Business"],
    }),
    // 🆕 New Endpoint: Add Visitor Count
    addVisitorCount: builder.mutation({
      query: (businessId) => ({
        url: `/analytics/${businessId}/visit`,
        method: "POST",
      }),
      invalidatesTags: ["Business"],
    }),
  }),
});

export const {
  useGetBusinessQuery,
  useGetAllBusinessQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useGetAllBusinessListingQuery,
  useGetBusinessAnalyticsQuery,
  useAddVisitorCountMutation
} = businessApi;
