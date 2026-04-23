import baseApi from "../baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
      }),
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: emailData,
      }),
    }),

    // resetPassword: builder.mutation({
    //   query: ({ token, newPassword }) => ({
    //     url: `/auth/reset-password/${token}`,
    //     method: "POST",
    //     body: { newPassword: newPassword },
    //   }),
    // }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => {
        console.log("Reset Password Payload:", { token, newPassword }); // 👈 Logging here
        return {
          url: `/auth/reset-password/${token}`,
          method: "POST",
          body: { newPassword },
        };
      },
    }),
    getUserById: builder.query({
      query: (userId: string) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
    }),

  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUserByIdQuery
} = authApi;

export default authApi;
