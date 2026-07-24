import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MdAssignment,
  MdClose,
  MdLocalShipping,
  MdDirectionsCar,
  MdLocationOn,
  MdCalendarToday,
  MdPerson,
  MdCheckCircle,
  MdGroup,
} from "react-icons/md";
import CustomDropdown from "../shared/CustomDropdown";
import CustomCalendar from "../shared/CustomCalendar";
import LocationInput from "../shared/LocationInput";

export default function AddAssignmentModal({
  onClose,
  onSave,
  drivers = [],
  vehicles = [],
  trips = [],
  editData = null,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tripId: "",
    vehicleType: "truck",
    vehicleNumber: "",
    tripFrom: null,
    tripTo: null,
    tripStartDate: "",
    driverName: "",
    driverPhone: "",
    coDriverName: "",
    coDriverPhone: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        tripId: editData.tripId || "",
        vehicleType: editData.vehicleType || "truck",
        vehicleNumber: editData.vehicleNumber || "",
        tripFrom: editData.tripFrom || "",
        tripTo: editData.tripTo || "",
        tripStartDate: editData.tripStartDate ? new Date(editData.tripStartDate).toISOString().slice(0, 16) : "",
        driverName: editData.driverName || "",
        driverPhone: editData.driverPhone || "",
        coDriverName: editData.coDriverName || "",
        coDriverPhone: editData.coDriverPhone || "",
      });
    }
  }, [editData]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const isEditMode = !!editData;

  const handleContinue = () => {
    if (
      !form.vehicleType ||
      !form.vehicleNumber ||
      !form.tripFrom ||
      !form.tripTo ||
      !form.tripStartDate
    ) {
      toast.error("Please fill all vehicle and route details.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.driverName || !form.driverPhone) {
      toast.error("A driver must be assigned.");
      return;
    }

    const payload = { ...form };

    // Handle tripFrom object
    if (form.tripFrom && typeof form.tripFrom === "object") {
      payload.tripFrom = form.tripFrom.address;
      payload.tripFromLat = form.tripFrom.lat;
      payload.tripFromLng = form.tripFrom.lng;
    } else {
      payload.tripFromLat = null;
      payload.tripFromLng = null;
    }

    // Handle tripTo object
    if (form.tripTo && typeof form.tripTo === "object") {
      payload.tripTo = form.tripTo.address;
      payload.tripToLat = form.tripTo.lat;
      payload.tripToLng = form.tripTo.lng;
    } else {
      payload.tripToLat = null;
      payload.tripToLng = null;
    }

    onSave(payload);
  };

  const steps = [
    { id: 1, label: "Vehicle & Route", icon: MdLocalShipping },
    { id: 2, label: "Personnel", icon: MdGroup },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#111827]/80 backdrop-blur-md z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="rounded-3xl w-full max-w-5xl bg-white backdrop-blur-none border border-[#111827]/10 shadow-[0_24px_80px_rgba(0,0,0,0.15)] pointer-events-auto overflow-y-auto md:overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]"
        >
          {/* Left Side: Steps & Summary */}
          <div className="w-full md:w-80 bg-white border-r border-[#111827]/5 p-8 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black text-[#111827] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <MdAssignment size={18} className="text-[#D4AF37]" />
                  </div>
                  {isEditMode ? "Edit Assignment" : "Assign Vehicle"}
                </h3>
                <button
                  onClick={onClose}
                  className="md:hidden text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <p className="text-xs text-[#111827]/40 leading-relaxed">
                {isEditMode
                  ? "Update the details for this assignment."
                  : "Complete the steps to assign a vehicle and dispatch it on a route."}
              </p>

              <div className="mt-10 flex flex-col gap-6">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const active = step >= s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-4 group">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "border-[#111827]/10"}`}
                      >
                        {active && step > s.id ? (
                          <MdCheckCircle size={16} className="text-white" />
                        ) : (
                          <Icon
                            size={14}
                            className={
                              active ? "text-white" : "text-[#111827]/20"
                            }
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-[#D4AF37]" : "text-[#111827]/20"}`}
                        >
                          Step 0{s.id}
                        </span>
                        <span
                          className={`text-xs font-bold ${active ? "text-[#111827]" : "text-[#111827]/30"}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="relative group hidden md:block">
              <div className="absolute -inset-1 bg-[#D4AF37] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-2xl p-4 border border-[#111827]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-[#D4AF37] flex items-center justify-center text-sm font-black text-white">
                    <MdLocalShipping size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827] truncate w-32 uppercase">
                      {form.vehicleNumber || "NO VEHICLE"}
                    </div>
                    <div className="text-[10px] text-[#D4AF37]/70 font-mono capitalize">
                      {form.vehicleType || "Type"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#111827]/30 uppercase tracking-tighter">
                    <MdLocationOn size={12} className="text-[#D4AF37]" />
                    <span className="truncate">
                      {typeof form.tripFrom === "object" && form.tripFrom
                        ? form.tripFrom.address
                        : form.tripFrom || "Origin"}
                    </span>
                    <span>→</span>
                    <span className="truncate">
                      {typeof form.tripTo === "object" && form.tripTo
                        ? form.tripTo.address
                        : form.tripTo || "Destination"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-[#111827]/30 uppercase tracking-tighter pt-2 mt-2 border-t border-[#111827]/5">
                    <span>
                      {form.driverName
                        ? form.driverName.split(" ")[0]
                        : "Driver"}
                    </span>
                    <span>
                      {form.coDriverName
                        ? "+ " + form.coDriverName.split(" ")[0]
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex-1 flex flex-col md:overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors z-10 hidden md:block"
            >
              <MdClose size={24} />
            </button>
            <div className="flex-1 p-8 md:overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-5 pt-4 md:pt-8"
                  >
                    <div className="col-span-2 mb-2">
                      <h4 className="text-lg font-bold text-[#111827]">
                        Vehicle & Route
                      </h4>
                      <p className="text-xs text-[#111827]/40">
                        Specify the vehicle and destination details for this
                        assignment.
                      </p>
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Select Trip (Optional)
                      </label>
                      <CustomDropdown
                        value={form.tripId}
                        onChange={(val) => {
                          const trip = trips.find(
                            (t) => t.tripId === val || t.id === val,
                          );
                          if (trip) {
                            setForm({
                              ...form,
                              tripId: val,
                              vehicleType:
                                trip.vehicleTypeRequired || form.vehicleType,
                              tripFrom: {
                                address: trip.sourceAddress,
                                lat: trip.sourceLat,
                                lng: trip.sourceLng,
                              },
                              tripTo: {
                                address: trip.destAddress,
                                lat: trip.destLat,
                                lng: trip.destLng,
                              },
                              tripStartDate: trip.startTime
                                ? trip.startTime.split("T")[0]
                                : "",
                            });
                          } else {
                            setForm({ ...form, tripId: "" });
                          }
                        }}
                        options={[
                          { value: "", label: "Manual Entry" },
                          ...trips
                            .filter(t => !t.vehicleId && !t.driverId && t.status !== 'assigned')
                            .map((t) => ({
                              value: t.tripId || t.id,
                              label: `${t.tripId || t.id} - ${t.sourceAddress || "Unknown"} to ${t.destAddress || "Unknown"}`,
                            })),
                        ]}
                        icon={MdAssignment}
                        className="h-11 bg-white"
                        dropdownClassName="max-h-48 overflow-y-auto"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Vehicle Type{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <CustomDropdown
                        value={form.vehicleType}
                        onChange={(val) =>
                          setForm({
                            ...form,
                            vehicleType: val,
                            vehicleNumber: "",
                          })
                        }
                        disabled={!!form.tripId}
                        options={[
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
                        ]}
                        icon={MdLocalShipping}
                        className="h-11"
                        dropdownClassName="max-h-48 overflow-y-auto"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Vehicle Number{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <CustomDropdown
                        value={form.vehicleNumber}
                        onChange={(val) =>
                          setForm({ ...form, vehicleNumber: val })
                        }
                        options={[
                          { value: "", label: "Select a vehicle" },
                          ...vehicles
                            .filter((v) => v.type === form.vehicleType && v.status !== "occupied")
                            .map((v) => ({
                              value: v.vehicleNumber,
                              label: `${v.vehicleNumber} (${v.name})`,
                            })),
                        ]}
                        icon={MdDirectionsCar}
                        className="h-11 bg-white"
                        dropdownClassName="max-h-48 overflow-y-auto"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <LocationInput
                        label="Trip From"
                        icon={MdLocationOn}
                        placeholder="Search city (e.g., Mumbai)"
                        value={
                          typeof form.tripFrom === "object" && form.tripFrom
                            ? form.tripFrom.address
                            : form.tripFrom
                        }
                        onChange={(val) => setForm({ ...form, tripFrom: val })}
                        required
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <LocationInput
                        label="Trip To"
                        icon={MdLocationOn}
                        placeholder="Search city (e.g., Pune)"
                        value={
                          typeof form.tripTo === "object" && form.tripTo
                            ? form.tripTo.address
                            : form.tripTo
                        }
                        onChange={(val) => setForm({ ...form, tripTo: val })}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <CustomCalendar
                        label="Trip Start Date"
                        icon={MdCalendarToday}
                        placeholder="YYYY-MM-DD"
                        value={form.tripStartDate}
                        onChange={(val) =>
                          setForm({ ...form, tripStartDate: val })
                        }
                        required
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-5 pt-4 md:pt-8"
                  >
                    <div className="col-span-2 mb-2">
                      <h4 className="text-lg font-bold text-[#111827]">
                        Personnel Assignment
                      </h4>
                      <p className="text-xs text-[#111827]/40">
                        Select the primary driver and an optional co-driver.
                      </p>
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Primary Driver{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <CustomDropdown
                        value={form.driverPhone}
                        onChange={(val) => {
                          const drv = drivers.find((d) => d.phone === val);
                          if (drv) {
                            setForm({
                              ...form,
                              driverPhone: val,
                              driverName: `${drv.firstName} ${drv.lastName}`,
                            });
                          } else {
                            setForm({
                              ...form,
                              driverPhone: "",
                              driverName: "",
                            });
                          }
                        }}
                        options={[
                          { value: "", label: "Select a driver" },
                          ...drivers
                            .filter(
                              (d) =>
                                (!d.Driver || d.Driver.driverType !== "co_driver") &&
                                (!d.Driver || d.Driver.occupiedStatus !== "occupied")
                            )
                            .map((d) => ({
                              value: d.phone,
                              label: `${d.firstName} ${d.lastName} (${d.phone})`,
                            })),
                        ]}
                        icon={MdPerson}
                        className="h-11 bg-white"
                        dropdownClassName="max-h-48 overflow-y-auto"
                      />
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Co-Driver
                      </label>
                      <CustomDropdown
                        value={form.coDriverPhone}
                        onChange={(val) => {
                          const drv = drivers.find((d) => d.phone === val);
                          if (drv) {
                            setForm({
                              ...form,
                              coDriverPhone: val,
                              coDriverName: `${drv.firstName} ${drv.lastName}`,
                            });
                          } else {
                            setForm({
                              ...form,
                              coDriverPhone: "",
                              coDriverName: "",
                            });
                          }
                        }}
                        options={[
                          { value: "", label: "Select a co-driver" },
                          ...drivers
                            .filter(
                              (d) =>
                                d.Driver && d.Driver.driverType === "co_driver" &&
                                d.Driver.occupiedStatus !== "occupied"
                            )
                            .map((d) => ({
                              value: d.phone,
                              label: `${d.firstName} ${d.lastName} (${d.phone})`,
                            })),
                        ]}
                        icon={MdGroup}
                        className="h-11 bg-white"
                        dropdownClassName="max-h-48 overflow-y-auto"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="p-8 border-t border-[#111827]/5 flex items-center justify-between bg-white">
              <button
                onClick={() => {
                  if (step === 1) onClose();
                  else setStep(step - 1);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#111827]/40 hover:text-[#111827] hover:bg-[#111827]/5 transition-all"
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {step < 2 ? (
                <button
                  onClick={handleContinue}
                  className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all shadow-lg"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-all"
                >
                  {isEditMode ? "Update Assignment" : "Assign Vehicle"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ModalField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div
        className={`flex items-center h-11 px-4 rounded-xl bg-white border transition-all duration-300 ${focused ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "border-gray-200 hover:border-gray-300"}`}
      >
        <Icon
          size={16}
          className={`mr-3 transition-colors ${focused ? "text-[#D4AF37]" : "text-gray-400"}`}
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-gray-800 placeholder:text-gray-400 w-full`}
        />
      </div>
    </div>
  );
}
