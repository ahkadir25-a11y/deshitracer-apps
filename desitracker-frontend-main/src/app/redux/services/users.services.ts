import baseApi from "../baseApi";

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `/users?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    getUserById: builder.query({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: ({ userId, userData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
export default usersApi;
