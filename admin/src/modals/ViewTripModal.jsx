import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdLocationOn, MdPerson, MdDirectionsCar, MdAccessTime, MdInfo, MdMap } from "react-icons/md";
import { getTripById } from "../Redux/Thunks/trip.thunks";

const STATUS_MAP = {
  scheduled: { label: "Scheduled", color: "text-blue-500", bg: "bg-blue-50" },
  ongoing: { label: "Ongoing", color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  completed: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-50" },
  cancelled: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50" },
};

export default function ViewTripModal({ isOpen, onClose, tripId }) {
  const dispatch = useDispatch();
  const { singleTrip, singleTripLoading, error } = useSelector((state) => state.trip);

  useEffect(() => {
    if (isOpen && tripId) {
      dispatch(getTripById(tripId));
    }
  }, [isOpen, tripId, dispatch]);

  if (!isOpen) return null;

  const st = singleTrip ? (STATUS_MAP[singleTrip.status] || STATUS_MAP.scheduled) : STATUS_MAP.scheduled;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0C0D0D]/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#F8FAFC] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-[#111827]/10 pointer-events-auto h-[600px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white border-b border-[#111827]/5 shrink-0">
            <div>
              <h2 className="text-xl font-black text-[#111827] flex items-center gap-3">
                Trip Details
                {singleTrip && (
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                )}
              </h2>
              {singleTrip && (
                <p className="text-xs text-[#111827]/50 mt-1 font-mono">
                  ID: {singleTrip.tripId}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111827]/5 text-[#111827]/40 hover:bg-[#111827]/10 hover:text-[#111827] transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {singleTripLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-[#111827]/40">
                <div className="w-10 h-10 border-4 border-[#111827]/10 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Fetching Trip Info...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-red-400">
                <MdInfo size={40} className="mb-4 text-red-300" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            ) : singleTrip ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-max">
                
                {/* Route Info */}
                <div className="bg-white rounded-2xl p-6 border border-[#111827]/5 flex flex-col h-max">
                  <h3 className="text-sm font-black text-[#111827] flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                      <MdMap size={16} className="text-[#D4AF37]" />
                    </div>
                    Route Details
                  </h3>
                  
                  <div className="relative pl-4 flex-1">
                    <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200"></div>
                    
                    <div className="relative mb-8">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                      <p className="text-xs font-bold text-[#111827]/40 uppercase tracking-wider mb-1">Pick Up</p>
                      <p className="text-sm font-medium text-[#111827]">{singleTrip.sourceAddress || "Not specified"}</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-white bg-red-500 shadow-sm" />
                      <p className="text-xs font-bold text-[#111827]/40 uppercase tracking-wider mb-1">Drop Off</p>
                      <p className="text-sm font-medium text-[#111827]">{singleTrip.destAddress || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6 flex flex-col">
                  
                  {/* Schedule */}
                  <div className="bg-white rounded-2xl p-6 border border-[#111827]/5">
                    <h3 className="text-sm font-black text-[#111827] flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MdAccessTime size={16} className="text-blue-500" />
                      </div>
                      Schedule
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-wider mb-1">Start Time</p>
                        <p className="text-sm font-bold text-[#111827]">
                          {singleTrip.startTime ? new Date(singleTrip.startTime).toLocaleString("en-GB") : "-"}
                        </p>
                      </div>
                      {(singleTrip.endTime || singleTrip.returnDate) && (
                        <div>
                          <p className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-wider mb-1">
                            {singleTrip.endTime ? "End Time" : "Return Date"}
                          </p>
                          <p className="text-sm font-bold text-[#111827]">
                            {singleTrip.endTime 
                              ? new Date(singleTrip.endTime).toLocaleString("en-GB") 
                              : new Date(singleTrip.returnDate).toLocaleString("en-GB")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="bg-white rounded-2xl p-6 border border-[#111827]/5">
                    <h3 className="text-sm font-black text-[#111827] flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <MdPerson size={16} className="text-indigo-500" />
                      </div>
                      Assignments
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                      {/* Driver */}
                      <div className="flex items-center gap-3 bg-[#111827]/[0.02] p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#111827]/10 flex items-center justify-center text-[#111827]/40">
                          <MdPerson size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-wider">Assigned Driver</p>
                          <p className="text-sm font-bold text-[#111827]">
                            {singleTrip.User ? `${singleTrip.User.firstName} ${singleTrip.User.lastName}` : "Unassigned"}
                          </p>
                          {singleTrip.User && (
                            <p className="text-[10px] text-[#111827]/50 mt-0.5">{singleTrip.User.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Vehicle */}
                      <div className="flex items-center gap-3 bg-[#111827]/[0.02] p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#111827]/10 flex items-center justify-center text-[#111827]/40">
                          <MdDirectionsCar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#111827]/40 uppercase tracking-wider">Assigned Vehicle</p>
                          <p className="text-sm font-bold text-[#111827]">
                            {singleTrip.Vehicle ? singleTrip.Vehicle.name : (singleTrip.vehicleTypeRequired || "Unassigned")}
                          </p>
                          {singleTrip.Vehicle && (
                            <p className="text-[10px] text-[#111827]/50 mt-0.5 font-mono">
                              {singleTrip.Vehicle.vehicleNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
