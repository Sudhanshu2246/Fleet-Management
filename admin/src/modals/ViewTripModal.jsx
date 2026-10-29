import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdLocationOn, MdPerson, MdDirectionsCar, MdAccessTime, MdInfo, MdMap, MdTimer } from "react-icons/md";
import { getTripById } from "../Redux/Thunks/trip.thunks";
import { getTripStops } from "../Redux/Thunks/tracking.thunks";
import TripRouteMap from "../components/map/TripRouteMap";

const STATUS_MAP = {
  scheduled: { label: "Scheduled", color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
  ongoing: { label: "Ongoing", color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10 border border-[#D4AF37]/20" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10 border border-red-500/20" },
};

export default function ViewTripModal({ isOpen, onClose, tripId }) {
  const dispatch = useDispatch();
  const { singleTrip, singleTripLoading, error } = useSelector((state) => state.trip);
  const { tripStops } = useSelector((state) => state.tracking);

  useEffect(() => {
    if (isOpen && tripId) {
      dispatch(getTripById(tripId));
      dispatch(getTripStops(tripId));
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
          className="absolute inset-0 bg-[#0C0D0D]/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#151D2C] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-800 pointer-events-auto h-[600px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-[#151D2C] border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                Trip Details
                {singleTrip && (
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                )}
              </h2>
              {singleTrip && (
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  ID: {singleTrip.tripId}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0B0F17]/50">
            {singleTripLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching Trip Info...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-red-400">
                <MdInfo size={40} className="mb-4 text-red-400" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            ) : singleTrip ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-max">
                
                {/* Route Info */}
                <div className="bg-[#151D2C] rounded-2xl p-6 border border-slate-700/60 shadow-sm flex flex-col h-max">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center">
                      <MdMap size={16} className="text-[#D4AF37]" />
                    </div>
                    Route Details
                  </h3>
                  
                  <div className="relative pl-4 flex-1">
                    <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-700"></div>
                    
                    <div className="relative mb-8">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-[#151D2C] bg-emerald-500 shadow-sm" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pick Up</p>
                      <p className="text-sm font-medium text-white">{singleTrip.sourceAddress || "Not specified"}</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-[#151D2C] bg-red-500 shadow-sm" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Drop Off</p>
                      <p className="text-sm font-medium text-white">{singleTrip.destAddress || "Not specified"}</p>
                    </div>
                  </div>

                  {/* Route Map Preview */}
                  <div className="mt-5">
                    <TripRouteMap
                      sourceLat={singleTrip.sourceLat}
                      sourceLng={singleTrip.sourceLng}
                      sourceAddress={singleTrip.sourceAddress}
                      destLat={singleTrip.destLat}
                      destLng={singleTrip.destLng}
                      destAddress={singleTrip.destAddress}
                      height="180px"
                    />
                  </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6 flex flex-col">
                  
                  {/* Schedule */}
                  <div className="bg-[#151D2C] rounded-2xl p-6 border border-slate-700/60 shadow-sm">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <MdAccessTime size={16} className="text-blue-400" />
                      </div>
                      Schedule
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Time</p>
                        <p className="text-sm font-bold text-white">
                          {singleTrip.startTime ? new Date(singleTrip.startTime).toLocaleString("en-GB") : "-"}
                        </p>
                      </div>
                      {(singleTrip.endTime || singleTrip.returnDate) && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {singleTrip.endTime ? "End Time" : "Return Date"}
                          </p>
                          <p className="text-sm font-bold text-white">
                            {singleTrip.endTime 
                              ? new Date(singleTrip.endTime).toLocaleString("en-GB") 
                              : new Date(singleTrip.returnDate).toLocaleString("en-GB")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="bg-[#151D2C] rounded-2xl p-6 border border-slate-700/60 shadow-sm">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <MdPerson size={16} className="text-indigo-400" />
                      </div>
                      Assignments
                    </h3>
                    
                    <div className="flex flex-col gap-4">
                      {/* Driver */}
                      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                          <MdPerson size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Driver</p>
                          <p className="text-sm font-bold text-white">
                            {singleTrip.User ? `${singleTrip.User.firstName} ${singleTrip.User.lastName}` : "Unassigned"}
                          </p>
                          {singleTrip.User && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{singleTrip.User.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Vehicle */}
                      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                          <MdDirectionsCar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Vehicle</p>
                          <p className="text-sm font-bold text-white">
                            {singleTrip.Vehicle ? singleTrip.Vehicle.name : (singleTrip.vehicleTypeRequired || "Unassigned")}
                          </p>
                          {singleTrip.Vehicle && (
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              {singleTrip.Vehicle.vehicleNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stoppage Intelligence */}
                  <div className="bg-[#151D2C] rounded-2xl p-6 border border-slate-700/60 shadow-sm">
                    <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <MdTimer size={16} className="text-amber-400" />
                      </div>
                      Stoppage Telematics (&gt;60s)
                    </h3>
                    {(() => {
                      const allStops = Array.isArray(singleTrip.stops) && singleTrip.stops.length > 0
                        ? singleTrip.stops
                        : (Array.isArray(tripStops) ? tripStops : []);
                      const totalSec = singleTrip.totalStopTime || allStops.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
                      const durFormatted = totalSec > 0
                        ? `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`
                        : "0s";

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <span className="text-slate-400 font-semibold">Total Stoppages:</span>
                            <span className="font-mono font-bold text-amber-400">{allStops.length} stops ({durFormatted})</span>
                          </div>
                          {allStops.length > 0 ? (
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                              {allStops.map((st, i) => (
                                <div key={i} className="text-[11px] p-2 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                                  <span className="text-slate-300 font-mono">Stop #{i + 1}: {Math.floor((st.durationSeconds || 0) / 60)}m {(st.durationSeconds || 0) % 60}s</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {st.stoppedAt ? new Date(st.stoppedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Vehicle operated continuously without stoppage exceeding 60 seconds.
                            </p>
                          )}
                        </div>
                      );
                    })()}
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
