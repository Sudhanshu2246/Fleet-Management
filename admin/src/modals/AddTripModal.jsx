import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  createAdminTrip,
  updateTripDetails,
} from "../Redux/Thunks/trip.thunks";
import {
  MdAssignment,
  MdLocationOn,
  MdCalendarToday,
  MdDirectionsCar,
  MdAdd,
  MdDelete,
  MdClose,
} from "react-icons/md";
import CustomDropdown from "../shared/CustomDropdown";
import LocationInput from "../shared/LocationInput";
import CustomCalendar from "../shared/CustomCalendar";
import { TRIP_TYPES, VEHICLE_TYPES, TYPE_ICON } from "../utils/constants";

export default function AddTripModal({ isOpen, onClose, editData }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    tripType: "one-way",
    vehicleTypeRequired: "",
    sourceAddress: null, // will be object { address, lat, lng }
    destAddress: null, // will be object { address, lat, lng }
    startTime: "",
    returnDate: "",
    multiCityLegs: [
      { from: null, to: null, date: "" },
      { from: null, to: null, date: "" },
    ],
  });

  const [loading, setLoading] = useState(false);

  // Auto-fill or reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          tripType: editData.tripType || "one-way",
          vehicleTypeRequired:
            editData.vehicleTypeRequired || editData.vehicleType || "",
          sourceAddress: editData.sourceAddress
            ? {
                address: editData.sourceAddress,
                lat: editData.sourceLat,
                lng: editData.sourceLng,
              }
            : null,
          destAddress: editData.destAddress
            ? {
                address: editData.destAddress,
                lat: editData.destLat,
                lng: editData.destLng,
              }
            : null,
          startTime: editData.startTime || "",
          returnDate: editData.returnDate || "",
          multiCityLegs: editData.multiCityLegs || [
            { from: null, to: null, date: "" },
            { from: null, to: null, date: "" },
          ],
        });
      } else {
        setForm({
          tripType: "one-way",
          vehicleTypeRequired: "",
          sourceAddress: null,
          destAddress: null,
          startTime: "",
          returnDate: "",
          multiCityLegs: [
            { from: null, to: null, date: "" },
            { from: null, to: null, date: "" },
          ],
        });
      }
    } else {
      setTimeout(() => {
        setForm({
          tripType: "one-way",
          vehicleTypeRequired: "",
          sourceAddress: null,
          destAddress: null,
          startTime: "",
          returnDate: "",
          multiCityLegs: [
            { from: null, to: null, date: "" },
            { from: null, to: null, date: "" },
          ],
        });
      }, 300);
    }
  }, [isOpen, editData]);

  const handleContinue = async () => {
    // Validation
    if (!form.vehicleTypeRequired) {
      toast.error("Please select a required vehicle type");
      return;
    }

    if (form.tripType === "one-way") {
      if (!form.sourceAddress || !form.destAddress || !form.startTime) {
        toast.error("Please fill all routing fields for the one-way trip");
        return;
      }
    } else if (form.tripType === "round-trip") {
      if (
        !form.sourceAddress ||
        !form.destAddress ||
        !form.startTime ||
        !form.returnDate
      ) {
        toast.error(
          "Please fill all routing and date fields for the round-trip",
        );
        return;
      }
      if (new Date(form.returnDate) < new Date(form.startTime)) {
        toast.error("Return date cannot be earlier than the start date");
        return;
      }
    } else if (form.tripType === "multi-city") {
      for (let i = 0; i < form.multiCityLegs.length; i++) {
        const leg = form.multiCityLegs[i];
        if (!leg.from || !leg.to || !leg.date) {
          toast.error(`Please fill all fields for Leg ${i + 1}`);
          return;
        }
        if (i > 0) {
          const prevLeg = form.multiCityLegs[i - 1];
          if (new Date(leg.date) < new Date(prevLeg.date)) {
            toast.error(
              `Date for Leg ${i + 1} cannot be earlier than Leg ${i}`,
            );
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      const payload = { ...form };

      // Flatten the objects for the top-level route (API expects sourceAddress, sourceLat, etc.)
      if (form.tripType === "multi-city") {
        payload.sourceAddress = form.multiCityLegs[0].from?.address || "";
        payload.sourceLat = form.multiCityLegs[0].from?.lat || null;
        payload.sourceLng = form.multiCityLegs[0].from?.lng || null;

        payload.destAddress =
          form.multiCityLegs[form.multiCityLegs.length - 1].to?.address || "";
        payload.destLat =
          form.multiCityLegs[form.multiCityLegs.length - 1].to?.lat || null;
        payload.destLng =
          form.multiCityLegs[form.multiCityLegs.length - 1].to?.lng || null;

        payload.startTime = form.multiCityLegs[0].date;
      } else {
        payload.sourceAddress = form.sourceAddress?.address || "";
        payload.sourceLat = form.sourceAddress?.lat || null;
        payload.sourceLng = form.sourceAddress?.lng || null;

        payload.destAddress = form.destAddress?.address || "";
        payload.destLat = form.destAddress?.lat || null;
        payload.destLng = form.destAddress?.lng || null;
      }

      let res;
      if (editData) {
        res = await dispatch(
          updateTripDetails({
            id: editData.id || editData._id,
            details: payload,
          }),
        ).unwrap();
      } else {
        res = await dispatch(createAdminTrip(payload)).unwrap();
      }

      if (res.success) {
        toast.success(
          editData
            ? "Trip details updated successfully"
            : "Trip booking created successfully",
        );
        onClose();
      }
    } catch (error) {
      toast.error(
        error.message ||
          (editData
            ? "Failed to update trip details"
            : "Failed to create trip booking"),
      );
    } finally {
      setLoading(false);
    }
  };

  const updateLeg = (index, field, value) => {
    const newLegs = [...form.multiCityLegs];
    newLegs[index][field] = value;
    setForm({ ...form, multiCityLegs: newLegs });
  };

  const addLeg = () => {
    setForm({
      ...form,
      multiCityLegs: [
        ...form.multiCityLegs,
        { from: null, to: null, date: "" },
      ],
    });
  };

  const removeLeg = (index) => {
    if (form.multiCityLegs.length <= 2) return;
    const newLegs = form.multiCityLegs.filter((_, i) => i !== index);
    setForm({ ...form, multiCityLegs: newLegs });
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0C0D0D]/60 backdrop-blur-sm"
        />

        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="rounded-3xl w-full max-w-4xl bg-white backdrop-blur-none border border-[#111827]/10 shadow-[0_24px_80px_rgba(0,0,0,0.15)] pointer-events-auto overflow-y-auto md:overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]"
          >
            {/* Left Side: Summary Card */}
            <div className="hidden md:flex w-80 bg-white border-r border-[#111827]/5 p-8 flex-col justify-between relative">
              <div>
                <h3 className="text-xl font-black text-[#111827] flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                    <MdAssignment size={18} className="text-[#D4AF37]" />
                  </div>
                  {editData ? "Update Booking" : "New Booking"}
                </h3>
                <p className="text-xs text-[#111827]/40 leading-relaxed">
                  {editData
                    ? "Modify the trip requirements and dates."
                    : "Provide the basic trip requirements. Vehicles and drivers will be assigned later."}
                </p>
              </div>

              {/* Live Card Preview */}
              <div className="relative group mt-10">
                <div className="absolute -inset-1 bg-[#D4AF37] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white rounded-2xl p-4 border border-[#111827]/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-[#D4AF37] flex items-center justify-center text-sm font-black text-white">
                      T
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111827] truncate w-32 uppercase">
                        {form.tripType.replace("-", " ")}
                      </div>
                      <div className="text-[10px] text-[#D4AF37]/70 font-mono">
                        {form.vehicleTypeRequired || "ANY VEHICLE"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 w-full bg-[#111827]/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37] w-full" />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-[#111827]/30 uppercase tracking-tighter">
                      <span>
                        {form.tripType === "multi-city"
                          ? `${form.multiCityLegs.length} Legs`
                          : editData
                            ? "Ongoing..."
                            : "Pending..."}
                      </span>
                      {!editData && <span>Unassigned</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC] md:overflow-hidden">
              {/* Header inside right side for mobile close */}
              <div className="md:hidden flex justify-end p-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-100 text-gray-500"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <div className="flex-1 p-8 md:overflow-y-auto [scrollbar-width:thin]">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-[#111827]">
                      {editData ? "Trip Details" : "Trip Requirements"}
                    </h4>
                    {!editData && (
                      <p className="text-xs text-[#111827]/50 mt-1">
                        Define the type of trip and required vehicle.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Trip Type <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <CustomDropdown
                        value={form.tripType}
                        onChange={(val) => setForm({ ...form, tripType: val })}
                        options={TRIP_TYPES}
                        icon={MdAssignment}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Req. Vehicle Type{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <CustomDropdown
                        value={form.vehicleTypeRequired}
                        onChange={(val) =>
                          setForm({ ...form, vehicleTypeRequired: val })
                        }
                        options={[
                          { value: "", label: "Select Type" },
                          ...VEHICLE_TYPES,
                        ]}
                        icon={
                          TYPE_ICON[form.vehicleTypeRequired] || MdDirectionsCar
                        }
                        dropdownClassName="max-h-60 overflow-y-auto"
                      />
                    </div>
                  </div>

                  <hr className="border-[#111827]/5 my-6" />

                  {/* Routing Section based on Trip Type */}
                  {(form.tripType === "one-way" ||
                    form.tripType === "round-trip") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-5">
                        <LocationInput
                          label="From"
                          icon={MdLocationOn}
                          placeholder="e.g., Mumbai"
                          value={form.sourceAddress}
                          onChange={(val) =>
                            setForm({ ...form, sourceAddress: val })
                          }
                          initialLocation={
                            form.sourceAddress
                              ? {
                                  address:
                                    form.sourceAddress.address ||
                                    form.sourceAddress,
                                  lat: form.sourceAddress.lat,
                                  lng: form.sourceAddress.lng,
                                }
                              : null
                          }
                          required
                        />
                        <LocationInput
                          label="To"
                          icon={MdLocationOn}
                          placeholder="e.g., Pune"
                          value={form.destAddress}
                          onChange={(val) =>
                            setForm({ ...form, destAddress: val })
                          }
                          initialLocation={
                            form.destAddress
                              ? {
                                  address:
                                    form.destAddress.address ||
                                    form.destAddress,
                                  lat: form.destAddress.lat,
                                  lng: form.destAddress.lng,
                                }
                              : null
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <CustomCalendar
                          label="Start Date"
                          icon={MdCalendarToday}
                          placeholder="YYYY-MM-DD"
                          value={form.startTime}
                          onChange={(val) =>
                            setForm({ ...form, startTime: val })
                          }
                          required
                        />
                        {form.tripType === "round-trip" && (
                          <CustomCalendar
                            label="Return Date"
                            icon={MdCalendarToday}
                            placeholder="DD/MM/YYYY"
                            value={form.returnDate}
                            onChange={(val) =>
                              setForm({ ...form, returnDate: val })
                            }
                            minDate={form.startTime}
                            required
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {form.tripType === "multi-city" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {form.multiCityLegs.map((leg, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border border-[#111827]/5 rounded-xl space-y-4 shadow-sm relative"
                        >
                          <h5 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                            Leg {index + 1}
                          </h5>
                          {form.multiCityLegs.length > 2 && (
                            <button
                              onClick={() => removeLeg(index)}
                              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <LocationInput
                              label="From"
                              icon={MdLocationOn}
                              placeholder="City"
                              value={leg.from}
                              onChange={(val) => updateLeg(index, "from", val)}
                              initialLocation={
                                leg.from
                                  ? {
                                      address: leg.from.address || leg.from,
                                      lat: leg.from.lat,
                                      lng: leg.from.lng,
                                    }
                                  : null
                              }
                              required
                            />
                            <LocationInput
                              label="To"
                              icon={MdLocationOn}
                              placeholder="City"
                              value={leg.to}
                              onChange={(val) => updateLeg(index, "to", val)}
                              initialLocation={
                                leg.to
                                  ? {
                                      address: leg.to.address || leg.to,
                                      lat: leg.to.lat,
                                      lng: leg.to.lng,
                                    }
                                  : null
                              }
                              required
                            />
                          </div>
                          <div>
                            <CustomCalendar
                              label="Date"
                              icon={MdCalendarToday}
                              placeholder="DD/MM/YYYY"
                              value={leg.date}
                              onChange={(val) => updateLeg(index, "date", val)}
                              minDate={
                                index > 0
                                  ? form.multiCityLegs[index - 1].date
                                  : undefined
                              }
                              required
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addLeg}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D4AF37]/50 text-[#D4AF37] rounded-lg text-xs font-bold hover:bg-[#D4AF37]/5 transition-colors"
                      >
                        <MdAdd size={16} /> Add Leg
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="shrink-0 p-6 bg-white border-t border-[#111827]/5 flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#111827]/50 hover:bg-[#111827]/5 hover:text-[#111827] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold text-[#111827] bg-[#D4AF37] hover:bg-[#C4A030] transition-all shadow-[0_4px_14px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.6)] flex items-center justify-center min-w-[140px] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#111827]/30 border-t-[#111827] rounded-full animate-spin" />
                  ) : editData ? (
                    "Update Booking"
                  ) : (
                    "Save Booking"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
