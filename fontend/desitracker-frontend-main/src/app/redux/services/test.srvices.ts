import baseApi from "../baseApi";

const testApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBestProjects: builder.query({
      query: ({ page, limit, totalPage, total }) => ({
        url: "/api/projects", // Your REST endpoint
        method: "GET",
        params: {
          page,
          limit,
          totalPage, // Optional, depends on how you calculate pages
          total, // Optional, for calculating total pages
        },
      }),
      transformResponse: (response) => response, // Transform the response if needed
    }),
  }),
});

export const { useGetBestProjectsQuery } = testApi;
