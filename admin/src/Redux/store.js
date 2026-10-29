import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/auth.slices";
import vehicleReducer from "./Slices/vehicle.slices";
import driverReducer from "./Slices/driver.slices";
import tripReducer from "./Slices/trip.slices";
import trackingReducer from "./Slices/tracking.slices";

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicle: vehicleReducer,
    driver: driverReducer,
    trip: tripReducer,
    tracking: trackingReducer,
  },
});

export default store;