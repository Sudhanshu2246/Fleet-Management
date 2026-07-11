import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/api/v1', // Update with actual IP for real device
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Trip', 'User', 'Vehicle'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/driver-login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getHistory: builder.query({
      query: (page) => `/trips/history?page=${page}`,
      providesTags: ['Trip'],
    }),
    startTrip: builder.mutation({
      query: (tripData) => ({
        url: '/trips/start',
        method: 'POST',
        body: tripData,
      }),
      invalidatesTags: ['Trip'],
    }),
    endTrip: builder.mutation({
      query: (tripData) => ({
        url: '/trips/end',
        method: 'POST',
        body: tripData,
      }),
      invalidatesTags: ['Trip'],
    }),
    getTripDetails: builder.query({
      query: (id) => `/trips/${id}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useGetHistoryQuery,
  useStartTripMutation,
  useEndTripMutation,
  useGetTripDetailsQuery,
} = apiSlice;
