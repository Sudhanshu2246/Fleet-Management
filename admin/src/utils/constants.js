import {
  MdLocalShipping,
  MdAirportShuttle,
  MdDirectionsBike,
  MdDirectionsCar,
  MdDirectionsBus,
  MdTwoWheeler,
  MdAgriculture,
  MdRvHookup,
  MdPrecisionManufacturing,
  MdMedicalServices,
  MdLocalFireDepartment,
  MdDirectionsBoat,
  MdFlight,
  MdElectricScooter,
} from "react-icons/md";
import { TbCarSuv } from "react-icons/tb";
import { FaTruckPickup } from "react-icons/fa";
import { GiPoliceCar, GiHelicopter, GiDeliveryDrone } from "react-icons/gi";

export const TYPE_ICON = {
  truck: MdLocalShipping,
  van: MdAirportShuttle,
  bike: MdDirectionsBike,
  shuttle: MdAirportShuttle,
  car: MdDirectionsCar,
  bus: MdDirectionsBus,
  suv: TbCarSuv,
  motorcycle: MdTwoWheeler,
  pickup: FaTruckPickup,
  minivan: MdAirportShuttle,
  tractor: MdAgriculture,
  trailer: MdRvHookup,
  camper: MdRvHookup,
  forklift: MdPrecisionManufacturing,
  ambulance: MdMedicalServices,
  firetruck: MdLocalFireDepartment,
  police: GiPoliceCar,
  boat: MdDirectionsBoat,
  helicopter: GiHelicopter,
  airplane: MdFlight,
  drone: GiDeliveryDrone,
  scooter: MdElectricScooter,
  bicycle: MdDirectionsBike,
};

export const VEHICLE_TYPES = [
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "bike", label: "Bike" },
  { value: "shuttle", label: "Shuttle" },
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "suv", label: "SUV" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "pickup", label: "Pickup Truck" },
  { value: "minivan", label: "Minivan" },
  { value: "tractor", label: "Tractor" },
  { value: "trailer", label: "Trailer" },
  { value: "camper", label: "Camper" },
  { value: "forklift", label: "Forklift" },
  { value: "ambulance", label: "Ambulance" },
  { value: "firetruck", label: "Fire Truck" },
  { value: "police", label: "Police Car" },
  { value: "boat", label: "Boat" },
  { value: "helicopter", label: "Helicopter" },
  { value: "airplane", label: "Airplane" },
  { value: "drone", label: "Drone" },
  { value: "scooter", label: "Scooter" },
  { value: "bicycle", label: "Bicycle" },
];

export const TRIP_TYPES = [
  { value: "one-way", label: "One-Way" },
  { value: "round-trip", label: "Round-Trip" },
  { value: "multi-city", label: "Multi-City" },
];

export const LICENSE_TYPES = [
  { value: "LL", label: "Learner's License (LL)" },
  { value: "DL", label: "Driving License (DL)" },
  { value: "CDL", label: "Commercial Driving License (CDL)" },
  { value: "IDP", label: "International Driving Permit (IDP)" },
];

export const VEHICLE_CATEGORY_OPTIONS = [
  { value: "MC_50cc", label: "Motorcycle up to 50cc" },
  { value: "MCWOG", label: "Motorcycle Without Gear (MCWOG)" },
  { value: "MCWG", label: "Motorcycle With Gear (MCWG)" },
  { value: "LMV_NT", label: "Light Motor Vehicle - Non Transport (LMV-NT)" },
  { value: "LMV_TR", label: "Light Motor Vehicle - Transport (LMV-TR)" },
  { value: "HMV_HTV", label: "Heavy Motor/Transport Vehicle (HMV/HTV)" },
  { value: "MGV_MPV", label: "Medium Goods/Passenger Vehicle (MGV/MPV)" },
];

export const DRIVER_TYPE_OPTIONS = [
  { value: "driver", label: "Driver" },
  { value: "co_driver", label: "Co-Driver" },
];
