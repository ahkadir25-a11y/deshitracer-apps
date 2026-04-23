import baseApi from "../baseApi";

/** ---------- Types ---------- */
export interface TemperatureRecordDTO {
  _id?: string; // if backend returns it
  date: string; // ISO string
  minTemperature: number;
  maxTemperature: number;
  status?: string;
}

export interface FridgeDTO {
  _id: string;
  fridgeName: string;
  fridgeLocation: string;
}

/** ---------- Helpers ---------- */
const toISO = (date: string) => {
  // Accepts "YYYY-MM-DD" or ISO. Always returns ISO.
  if (!date) return undefined;
  const d = new Date(date.length === 10 ? `${date}T00:00:00.000Z` : date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

/** ---------- Fridge API Service ---------- */
const fridgeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Get all fridges for a specific user */
    getFridges: build.query<FridgeDTO[], string>({
      query: (userId) => ({
        url: `/fridges/${userId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "Fridges", id: "LIST" },
            ...result.map((f) => ({ type: "Fridges" as const, id: f._id })),
          ]
          : [{ type: "Fridges", id: "LIST" }],
    }),

    /** Create a fridge for a user */
    createFridge: build.mutation<
      FridgeDTO,
      { userId: string; fridgeName: string; fridgeLocation: string }
    >({
      query: (body) => ({
        url: "/fridges/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Fridges", id: "LIST" }],
    }),

    /** Add a temperature record for a specific fridge */
    addTemperatureRecord: build.mutation<
      TemperatureRecordDTO,
      { fridgeId: string; minTemperature: number; maxTemperature: number; date: string }
    >({
      query: ({ fridgeId, minTemperature, maxTemperature, date }) => ({
        url: "/fridges/add-record",
        method: "POST",
        body: {
          fridgeId,
          minTemperature,
          maxTemperature,
          date: toISO(date), // ✅ make sure backend gets a valid ISO date
        },
      }),
      invalidatesTags: (result, error, { fridgeId }) => [
        { type: "TemperatureRecords", id: fridgeId },
      ],
    }),

    /** Edit a temperature record for a specific fridge */
    editTemperatureRecord: build.mutation<
      TemperatureRecordDTO,
      { fridgeId: string; recordId: string; minTemperature: number; maxTemperature: number }
    >({
      query: (data) => ({
        url: "/fridges/edit-record",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { fridgeId }) => [
        { type: "TemperatureRecords", id: fridgeId },
      ],
    }),

    /** Fetch temperature records for a specific fridge */
    getTemperatureRecords: build.query<
      TemperatureRecordDTO[],
      {
        fridgeId: string;
        date?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ fridgeId, date, startDate, endDate }) => ({
        url: `/fridges/records/${fridgeId}`,
        method: "GET",
        params: {
          ...(date ? { date } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }),
      providesTags: (result, error, { fridgeId }) => [
        { type: "TemperatureRecords", id: fridgeId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFridgesQuery,
  useCreateFridgeMutation,
  useAddTemperatureRecordMutation,
  useEditTemperatureRecordMutation,
  useGetTemperatureRecordsQuery,
} = fridgeApi;

export default fridgeApi;
