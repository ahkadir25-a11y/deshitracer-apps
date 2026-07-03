import baseApi from "../baseApi";

const siteContactUs = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (contactData) => ({
        url: "contact", // POST route for your Contact Us API
        method: "POST",
        body: contactData, // Send the contact form data as the request body
      }),
    }),
  }),
  overrideExisting: false, // Optionally, prevent overriding existing endpoints
});

export const {
  useSendContactMessageMutation, // Auto-generated hook for mutation
} = siteContactUs;

export default siteContactUs;
