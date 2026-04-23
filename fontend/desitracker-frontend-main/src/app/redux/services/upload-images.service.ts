import baseApi from "../baseApi";

const uploadImagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImages: builder.mutation({
      query: ({ formData, name }) => ({
        url: `/upload-images/${name}`,
        method: "POST",
        body: formData, // directly pass the formData object, not an array
      }),
      invalidatesTags: ["Upload"],
    }),
  }),
});
export const { useUploadImagesMutation } = uploadImagesApi;
