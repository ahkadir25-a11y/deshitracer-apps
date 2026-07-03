// services/settingsApi.ts
import baseApi from "../baseApi";

const settings = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to fetch the settings
    getSettings: builder.query({
      query: () => "/settings", // Adjust the endpoint path if needed
      providesTags: ["Settings"], // Use relevant tags
    }),

    // Endpoint to create new settings
    createSettings: builder.mutation({
      query: (settingsData) => ({
        url: "/settings", // Adjust the endpoint path if needed
        method: "POST",
        body: settingsData,
      }),
      // Automatically refetch the settings data after creation
      invalidatesTags: ["Settings"],
    }),

    // Endpoint to update existing settings
    updateSettings: builder.mutation({
      query: (settingsData) => ({
        url: "/settings", // Adjust the endpoint path if needed
        method: "PUT",
        body: settingsData,
      }),
      // Automatically refetch the settings data after update
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
} = settings;
