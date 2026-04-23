import baseApi from "../baseApi";

/** ---------- Common API response types (match your backend style) ---------- */
export type ApiMeta = { page: number; limit: number; total: number };

export type ApiListResponse<T> = {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: T[];
};

export type ApiSingleResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** ---------- Rota domain types ---------- */
export type ShiftStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface RotaRole {
  _id: string;
  business: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RotaEmployeeAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface RotaEmployee {
  _id: string;
  business: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: RotaEmployeeAddress;

  // backend populates role, so it can be object or id
  role: RotaRole | string;

  status: EmployeeStatus;
  user?: string;
  notes?: string;

  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RotaShift {
  _id: string;
  business: string;

  // backend populates employee + role, so they can be object or id
  employee?: RotaEmployee | string | null;
  role: RotaRole | string;

  startAt: string; // ISO
  endAt: string;   // ISO
  breakMinutes?: number;
  location?: string;
  notes?: string;

  status: ShiftStatus;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

/** ---------- DTOs ---------- */
export type CreateRoleDTO = {
  business: string;
  name: string;
  description?: string;
  isActive?: boolean;
};
export type UpdateRoleDTO = Partial<Omit<CreateRoleDTO, "business">>;

export type CreateEmployeeDTO = {
  business: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: RotaEmployeeAddress;
  role: string; // roleId
  status?: EmployeeStatus;
  user?: string;
  notes?: string;
};
export type UpdateEmployeeDTO = Partial<Omit<CreateEmployeeDTO, "business">>;

export type CreateShiftDTO = {
  business: string;
  employee?: string | null; // employeeId or null for unassigned
  role: string;             // roleId
  startAt: string;          // ISO
  endAt: string;            // ISO
  breakMinutes?: number;
  location?: string;
  notes?: string;
  status?: ShiftStatus;
};
export type UpdateShiftDTO = Partial<Omit<CreateShiftDTO, "business">>;

/** ---------- Query params ---------- */
export type ListRoleParams = {
  business: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ListEmployeeParams = {
  business: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: EmployeeStatus;
  role?: string; // roleId
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ListShiftParams = {
  business: string;
  from?: string; // ISO
  to?: string;   // ISO
  employee?: string; // employeeId
  role?: string;     // roleId
  status?: ShiftStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/** ---------- API ---------- */
export const rotaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** ---------------- Roles ---------------- */
    getRotaRoles: builder.query<ApiListResponse<RotaRole>, ListRoleParams>({
      query: (params) => ({
        url: "/rota/roles",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "RotaRole", id: "LIST" },
              ...result.data.map((r) => ({ type: "RotaRole" as const, id: r._id })),
            ]
          : [{ type: "RotaRole", id: "LIST" }],
    }),

    getRotaRoleById: builder.query<ApiSingleResponse<RotaRole>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/roles/${id}`,
        method: "GET",
        params: { business },
      }),
      providesTags: (_res, _err, arg) => [{ type: "RotaRole", id: arg.id }],
    }),

    createRotaRole: builder.mutation<ApiSingleResponse<RotaRole>, CreateRoleDTO>({
      query: (body) => ({
        url: "/rota/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RotaRole", id: "LIST" }],
    }),

    updateRotaRole: builder.mutation<
      ApiSingleResponse<RotaRole>,
      { id: string; business: string; body: UpdateRoleDTO }
    >({
      query: ({ id, business, body }) => ({
        url: `/rota/roles/${id}`,
        method: "PATCH",
        params: { business },
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaRole", id: "LIST" },
        { type: "RotaRole", id: arg.id },
      ],
    }),

    deleteRotaRole: builder.mutation<ApiSingleResponse<RotaRole>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/roles/${id}`,
        method: "DELETE",
        params: { business },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaRole", id: "LIST" },
        { type: "RotaRole", id: arg.id },
      ],
    }),

    /** ---------------- Employees ---------------- */
    getRotaEmployees: builder.query<ApiListResponse<RotaEmployee>, ListEmployeeParams>({
      query: (params) => ({
        url: "/rota/employees",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "RotaEmployee", id: "LIST" },
              ...result.data.map((e) => ({ type: "RotaEmployee" as const, id: e._id })),
            ]
          : [{ type: "RotaEmployee", id: "LIST" }],
    }),

    getRotaEmployeeById: builder.query<ApiSingleResponse<RotaEmployee>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/employees/${id}`,
        method: "GET",
        params: { business },
      }),
      providesTags: (_res, _err, arg) => [{ type: "RotaEmployee", id: arg.id }],
    }),

    createRotaEmployee: builder.mutation<ApiSingleResponse<RotaEmployee>, CreateEmployeeDTO>({
      query: (body) => ({
        url: "/rota/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RotaEmployee", id: "LIST" }],
    }),

    updateRotaEmployee: builder.mutation<
      ApiSingleResponse<RotaEmployee>,
      { id: string; business: string; body: UpdateEmployeeDTO }
    >({
      query: ({ id, business, body }) => ({
        url: `/rota/employees/${id}`,
        method: "PATCH",
        params: { business },
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaEmployee", id: "LIST" },
        { type: "RotaEmployee", id: arg.id },
      ],
    }),

    deleteRotaEmployee: builder.mutation<ApiSingleResponse<RotaEmployee>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/employees/${id}`,
        method: "DELETE",
        params: { business },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaEmployee", id: "LIST" },
        { type: "RotaEmployee", id: arg.id },
      ],
    }),

    /** ---------------- Shifts ---------------- */
    getRotaShifts: builder.query<ApiListResponse<RotaShift>, ListShiftParams>({
      query: (params) => ({
        url: "/rota/shifts",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "RotaShift", id: "LIST" },
              ...result.data.map((s) => ({ type: "RotaShift" as const, id: s._id })),
            ]
          : [{ type: "RotaShift", id: "LIST" }],
    }),

    getRotaShiftById: builder.query<ApiSingleResponse<RotaShift>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/shifts/${id}`,
        method: "GET",
        params: { business },
      }),
      providesTags: (_res, _err, arg) => [{ type: "RotaShift", id: arg.id }],
    }),

    createRotaShift: builder.mutation<ApiSingleResponse<RotaShift>, CreateShiftDTO>({
      query: (body) => ({
        url: "/rota/shifts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RotaShift", id: "LIST" }],
    }),

    updateRotaShift: builder.mutation<
      ApiSingleResponse<RotaShift>,
      { id: string; business: string; body: UpdateShiftDTO }
    >({
      query: ({ id, business, body }) => ({
        url: `/rota/shifts/${id}`,
        method: "PATCH",
        params: { business },
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaShift", id: "LIST" },
        { type: "RotaShift", id: arg.id },
      ],
    }),

    deleteRotaShift: builder.mutation<ApiSingleResponse<RotaShift>, { id: string; business: string }>({
      query: ({ id, business }) => ({
        url: `/rota/shifts/${id}`,
        method: "DELETE",
        params: { business },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "RotaShift", id: "LIST" },
        { type: "RotaShift", id: arg.id },
      ],
    }),
  }),
  overrideExisting: false,
});

/** ---------- Hooks ---------- */
export const {
  // roles
  useGetRotaRolesQuery,
  useGetRotaRoleByIdQuery,
  useCreateRotaRoleMutation,
  useUpdateRotaRoleMutation,
  useDeleteRotaRoleMutation,

  // employees
  useGetRotaEmployeesQuery,
  useGetRotaEmployeeByIdQuery,
  useCreateRotaEmployeeMutation,
  useUpdateRotaEmployeeMutation,
  useDeleteRotaEmployeeMutation,

  // shifts
  useGetRotaShiftsQuery,
  useGetRotaShiftByIdQuery,
  useCreateRotaShiftMutation,
  useUpdateRotaShiftMutation,
  useDeleteRotaShiftMutation,
} = rotaApi;
