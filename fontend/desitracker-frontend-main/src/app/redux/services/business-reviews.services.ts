import baseApi from "../baseApi";

const businessReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all reviews for a specific business
    getAllBusinessReviews: builder.query({
      query: ({ busniessId, meta }) => {
        const queryString = new URLSearchParams(meta).toString();
        return {
          url: `/reviews/all/${busniessId}/?${queryString}`,
          method: "GET",
        };
      },

      providesTags: ["Business_Reviews"],
    }),

    // Fetch a single review by reviewId
    getSingleReview: builder.query({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "GET",
      }),
      providesTags: ["Business_Reviews"],
    }),

    // Create a new review
    createReview: builder.mutation({
      query: (newReviewData) => ({
        url: "/reviews/create",
        method: "POST",
        body: newReviewData,
      }),
      invalidatesTags: ["Business_Reviews"],
    }),

    // Update review visibility
    updateReviewVisibility: builder.mutation({
      query: ({ reviewId, visibilityData }) => ({
        url: `/reviews/${reviewId}/visibility`,
        method: "PUT",
        body: visibilityData,
      }),
      invalidatesTags: ["Business_Reviews"],
    }),

    // Update review by reviewer
    updateReviewByReviewer: builder.mutation({
      query: ({ reviewId, updatedReviewData }) => ({
        url: `/reviews/${reviewId}`,
        method: "PUT",
        body: updatedReviewData,
      }),
      invalidatesTags: ["Business_Reviews"],
    }),
  }),
});

export const {
  useGetAllBusinessReviewsQuery,
  useGetSingleReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewVisibilityMutation,
  useUpdateReviewByReviewerMutation,
} = businessReviewsApi;
