import baseApi from "../baseApi";

const sliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSlider: builder.query({
      query: ({ sliderSlug }) => {
        return {
          url: `/slider/${sliderSlug}`, // Use sliderSlug from params
          method: "GET",
        };
      },
      providesTags: ["Slider"],
    }),

    getAllSliders: builder.query({
      query: () => {
        // /?${queryString}
        return {
          url: `/slider/all`,
          method: "GET",
        };
      },
      providesTags: ["Slider"],
    }),

    createSlider: builder.mutation({
      query: (newSliderData) => ({
        url: "/slider/create",
        method: "POST",
        body: newSliderData,
      }),
      invalidatesTags: ["Slider"],
    }),

    updateSlider: builder.mutation({
      query: ({ slug, updatedSliderData }) => {
        return {
          url: `/slider/${slug}`,
          method: "PUT",
          body: updatedSliderData,
        };
      },
      invalidatesTags: ["Slider"],
    }),

    deleteSlider: builder.mutation({
      query: (slug) => ({
        url: `/slider/delete/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slider"],
    }),
  }),
});

export const {
  useGetSliderQuery,
  useGetAllSlidersQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApi;
