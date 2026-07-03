import baseApi from "../baseApi";

const siteReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all reviews for a specific business
    getAllSiteSiteReviews: builder.query({
      query: () => ({
        url: `/testimonials`,
        method: "GET",
      }),
      providesTags: ["SiteReviews"],
    }),
    getAllShowBusinessSiteReviews: builder.query({
      query: (show) => ({
        url: `/testimonials?show=${show}`,
        method: "GET",
      }),
      providesTags: ["SiteReviews"],
    }),
    // Fetch a single review by testimonialId
    getSingleSiteReview: builder.query({
      query: (testimonialId) => ({
        url: `/testimonials/${testimonialId}`,
        method: "GET",
      }),
      providesTags: ["SiteReviews"],
    }),
    // Create a new review
    createSiteReview: builder.mutation({
      query: (newReviewData) => ({
        url: "/testimonials/create",
        method: "POST",
        body: newReviewData,
      }),
      invalidatesTags: ["SiteReviews"],
    }),
    // Update review visibility
    updateReviewVisibility: builder.mutation({
      query: ({ testimonialId, visibilityData }) => ({
        url: `/testimonials/${testimonialId}/visibility`,
        method: "PUT",
        body: visibilityData,
      }),
      invalidatesTags: ["SiteReviews"],
    }),
    // Update review by reviewer
    updateReviewBySiteReviewer: builder.mutation({
      query: ({ testimonialId, updatedReviewData }) => ({
        url: `/testimonials/${testimonialId}`,
        method: "PUT",
        body: updatedReviewData,
      }),
      invalidatesTags: ["SiteReviews"],
    }),
  }),
});

export const {
  useUpdateReviewVisibilityMutation,
} = siteReviewsApi;
