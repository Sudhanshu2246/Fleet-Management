import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardDataThunk } from '../thunks/dashboardThunks';

export interface BookingItem {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  pickupTime: string;
  dropLocation: string;
  dropTime: string;
  cargoType: string;
  weight: string;
  payout: string;
  status: 'ASSIGNED' | 'EN_ROUTE' | 'LOADING' | 'COMPLETED' | 'SCHEDULED' | 'CANCELLED';
}

interface DashboardState {
  assignment: any | null;
  vehicle: any | null;
  trip: any | null;
  recentBookings: BookingItem[];
  loading: boolean;
  error: string | null;
}

const DEFAULT_BOOKINGS: BookingItem[] = [
  {
    id: 'BK-9842',
    bookingNumber: '#BK-9842',
    customerName: 'Apex Logistics Ltd',
    customerPhone: '+1 (555) 234-5678',
    pickupLocation: 'Central Logistics Depot, Gate 4',
    pickupTime: 'Today, 10:30 AM',
    dropLocation: 'Metro Distribution Center, Dock 12',
    dropTime: 'Today, 03:45 PM',
    cargoType: 'Industrial Equipment',
    weight: '14.2 Tons',
    payout: '$480.00',
    status: 'EN_ROUTE',
  },
  {
    id: 'BK-9840',
    bookingNumber: '#BK-9840',
    customerName: 'Global Freight Systems',
    customerPhone: '+1 (555) 876-5432',
    pickupLocation: 'Eastside Storage Hub, Bldg B',
    pickupTime: 'Yesterday, 08:00 AM',
    dropLocation: 'Harbor Freight Yard, Pier 5',
    dropTime: 'Yesterday, 01:15 PM',
    cargoType: 'Consumer Electronics',
    weight: '8.5 Tons',
    payout: '$350.00',
    status: 'COMPLETED',
  },
  {
    id: 'BK-9845',
    bookingNumber: '#BK-9845',
    customerName: 'FastTrack Cargo Corp',
    customerPhone: '+1 (555) 432-1098',
    pickupLocation: 'West Coast Terminal, Gate 2',
    pickupTime: 'Tomorrow, 09:00 AM',
    dropLocation: 'Airport Freight Complex, Hangar 4',
    dropTime: 'Tomorrow, 02:30 PM',
    cargoType: 'Perishable Goods',
    weight: '10.0 Tons',
    payout: '$520.00',
    status: 'SCHEDULED',
  },
];

const DEFAULT_ASSIGNMENT = {
  status: 'EN_ROUTE',
  tripFrom: 'Central Logistics Depot, Gate 4',
  tripTo: 'Metro Distribution Center, Dock 12',
  tripFromLat: 28.6139,
  tripFromLng: 77.2090,
  tripToLat: 28.4595,
  tripToLng: 77.0266,
};

const DEFAULT_TRIP = {
  bookingId: 'BK-9842',
  bookingNumber: '#BK-9842',
  customerName: 'Apex Logistics Ltd',
  customerPhone: '+1 (555) 234-5678',
  cargoType: 'Industrial Equipment',
  weight: '14.2 Tons',
  payout: '$480.00',
  pickupTime: '10:30 AM',
  dropTime: '03:45 PM',
  status: 'EN_ROUTE',
  sourceLat: 28.6139,
  sourceLng: 77.2090,
  destLat: 28.4595,
  destLng: 77.0266,
  distanceTravelled: 32.5,
};

const DEFAULT_VEHICLE = {
  vehicleNumber: 'TRK-4089',
  name: 'Volvo FH16 Heavy Duty',
  type: 'truck',
};

const initialState: DashboardState = {
  assignment: DEFAULT_ASSIGNMENT,
  vehicle: DEFAULT_VEHICLE,
  trip: DEFAULT_TRIP,
  recentBookings: DEFAULT_BOOKINGS,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateBookingStatus: (state, action) => {
      if (state.trip) {
        state.trip.status = action.payload;
      }
      if (state.assignment) {
        state.assignment.status = action.payload;
      }
      const activeBooking = state.recentBookings.find(b => b.id === 'BK-9842');
      if (activeBooking) {
        activeBooking.status = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.assignment) state.assignment = action.payload.assignment;
        if (action.payload?.vehicle) state.vehicle = action.payload.vehicle;
        if (action.payload?.trip) state.trip = action.payload.trip;
        if (action.payload?.recentBookings) state.recentBookings = action.payload.recentBookings;
      })
      .addCase(fetchDashboardDataThunk.rejected, (state) => {
        state.loading = false;
        // Maintain fallback booking data on error
      });
  },
});

export const { updateBookingStatus } = dashboardSlice.actions;
export default dashboardSlice.reducer;
