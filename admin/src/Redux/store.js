import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/auth.slices";
import vehicleReducer from "./Slices/vehicle.slices";
import driverReducer from "./Slices/driver.slices";

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicle: vehicleReducer,
    driver: driverReducer,
  },
});

export default store;