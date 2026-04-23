import baseApi from "../baseApi";

// Define the types for the API response
interface MonthlyData {
  month: string;
  userCount: number;
  businessCount: number;
}

interface AnalyticsData {
  totalBusinessCount: number;
  totalUserCount: number;
  monthlyData: MonthlyData[];
  averageRatting: number;
  uniqueCountries: number;
  newRegistrations : number;
  userReviews : number
}

interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    data: AnalyticsData;
  };
}


// Injecting the analytics API with the correct types
const siteAnylatics = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSiteAnalytics: builder.query<AnalyticsData, void>({
      query: () => ({
        url: '/analytics',
        method: 'GET',
      }),
      transformResponse: (response: AnalyticsResponse) => response.data.data, // Access the `data` field
      providesTags: ['Analytics'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSiteAnalyticsQuery,
} = siteAnylatics;
