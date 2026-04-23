import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookie";

const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_API}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const accessToken = getCookie("desiTrackerToken");
      if (accessToken) headers.set("authorization", accessToken);

      // headers.set("Content-Type", "application/json");

      // if (!(headers.get("Content-Type") === "multipart/form-data")) {
      //   headers.set("Content-Type", "application/json");
      // }
      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "Business",
    "Category",
    "SubCategory",
    "Upload",
    "Slider",
    "Business_Reviews",
    "SiteReviews",
    "Analytics",
    "Settings",
    "Product",
    "Fridges",
    "DayOffer",
    "RotaRole",
    "RotaEmployee",
    "RotaShift",
    "TemperatureRecords",
    "ProductOption",
    "Order"
  ],
  endpoints: () => ({}),
});

export default baseApi;
