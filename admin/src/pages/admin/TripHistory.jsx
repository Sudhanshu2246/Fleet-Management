import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdRefresh,
  MdHistory,
  MdSpeed,
  MdLocationOn,
  MdDirectionsCar,
  MdPerson,
  MdAccessTime,
  MdArrowForward,
  MdOpenInNew,
  MdClose,
  MdTimer,
  MdFileDownload,
  MdInfo,
  MdNavigation,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { getTripHistory } from "../../Redux/Thunks/tracking.thunks";
import Pagination from "../../shared/Pagination";
import TripRouteMap from "../../components/map/TripRouteMap";
import { getGoogleMapsUrl } from "../../utils/mapUtils";

export default function TripHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tripHistory, tripHistoryLoading } = useSelector(
    (state) => state.tracking
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getTripHistory({ limit: 50 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getTripHistory({ limit: 50 }));
  };

  const rows = tripHistory?.rows || [];

  // Filter and search
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch =
        (row.tripId && row.tripId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.Driver?.User &&
          `${row.Driver.User.firstName} ${row.Driver.User.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (row.Vehicle &&
          row.Vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.sourceAddress &&
          row.sourceAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.destAddress &&
          row.destAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (filterMode === "with-stops") {
        return Array.isArray(row.stops) && row.stops.length > 0;
      }
      if (filterMode === "high-speed") {
        return Number(row.maxSpeed) > 75;
      }
      return true;
    });
  }, [rows, searchTerm, filterMode]);

  // Aggregate Stats
  const totalRecorded = rows.length;
  const highestMaxSpeed = rows.reduce(
    (max, r) => Math.max(max, Number(r.maxSpeed) || 0),
    0
  );
  const fleetAvgSpeed =
    totalRecorded > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + (Number(r.avgSpeed) || 0), 0) /
            totalRecorded
        )
      : 0;
  const totalFleetStopTimeSec = rows.reduce(
    (sum, r) => sum + (Number(r.totalStopTimeSeconds) || 0),
    0
  );

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const handleOpenDetails = (trip) => {
    setSelectedTrip(trip);
    setIsDetailModalOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = [
      "Trip ID",
      "Driver",
      "Vehicle Plate",
      "Origin",
      "Destination",
      "Max Speed (km/h)",
      "Avg Speed (km/h)",
      "Distance (km)",
      "Stops Count",
      "Total Stop Time",
      "Recorded At",
    ];

    const csvData = filteredRows.map((r) => {
      const driverName = r.Driver?.User
        ? `${r.Driver.User.firstName} ${r.Driver.User.lastName}`
        : "Unassigned";
      return [
        r.tripId,
        `"${driverName}"`,
        r.Vehicle?.vehicleNumber || "—",
        `"${(r.sourceAddress || "").replace(/"/g, '""')}"`,
        `"${(r.destAddress || "").replace(/"/g, '""')}"`,
        r.maxSpeed || 0,
        r.avgSpeed || 0,
        r.totalDistanceKm || 0,
        Array.isArray(r.stops) ? r.stops.length : 0,
        formatDuration(r.totalStopTimeSeconds),
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "—",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvData.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_trip_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] px-4 sm:px-6 py-6 text-slate-100 flex flex-col">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">
              Fleetiq
            </span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs text-slate-400">Telematics</span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs text-slate-400">Trip History & Stoppages</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              <MdHistory className="text-[#D4AF37]" />
              <span>Trip History & Speed Analytics</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              PERSISTENT REPLAY
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <MdFileDownload size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <MdRefresh
              size={15}
              className={tripHistoryLoading ? "animate-spin text-[#D4AF37]" : ""}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/fleet-map")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/35 transition-all cursor-pointer"
          >
            Live Fleet Map →
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Trips Logged</span>
            <span className="text-base">📋</span>
          </div>
          <div className="text-2xl font-black text-white">{totalRecorded}</div>
          <div className="text-[10px] text-[#D4AF37] font-semibold mt-1">
            MySQL + Redis Synced
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Peak Speed Recorded</span>
            <span className="text-base text-red-400">⚡</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {highestMaxSpeed} <span className="text-xs text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Fleet Max Velocity
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Fleet Average Speed</span>
            <span className="text-base text-emerald-400">🏎️</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {fleetAvgSpeed} <span className="text-xs text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            Cruising Metric
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Stoppage Time</span>
            <span className="text-base text-amber-400">🛑</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatDuration(totalFleetStopTimeSec)}
          </div>
          <div className="text-[10px] text-amber-400 font-semibold mt-1">
            &gt;60s Stoppage Engine
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ─────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search Trip ID, Driver, Vehicle, Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/70"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <MdClose size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 self-start md:self-auto">
          {[
            { id: "all", label: "All Trips" },
            { id: "with-stops", label: "With Stops (>60s)" },
            { id: "high-speed", label: "High Speed (>75 km/h)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === tab.id
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Data Table ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Trip ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Driver & Vehicle
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Route Corridor
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Speed Telemetry
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Distance & Stops
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tripHistoryLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-slate-700 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-xs font-semibold">
                      Loading persistent trip history from database...
                    </span>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="text-sm font-bold text-white mb-1">
                      No Trip Histories Found
                    </div>
                    <div className="text-xs text-slate-500">
                      Trips completed by logged-in drivers are permanently stored with speed & stoppage metrics.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const driverUser = row.Driver?.User;
                  const driverName = driverUser
                    ? `${driverUser.firstName} ${driverUser.lastName}`
                    : `Driver #${row.driverId}`;
                  const vehicleNumber = row.Vehicle?.vehicleNumber || "—";
                  const stopsCount = Array.isArray(row.stops) ? row.stops.length : 0;
                  const stopDuration = formatDuration(row.totalStopTimeSeconds);

                  return (
                    <tr
                      key={row.id || row.tripId}
                      className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Trip ID */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-sm text-[#D4AF37]">
                          {row.tripId}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-mono text-slate-500">
                          ID: #{row.id}
                        </span>
                      </td>

                      {/* Driver & Vehicle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                            {driverName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {driverName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                              <MdDirectionsCar size={12} className="text-[#D4AF37]" />
                              <span>{vehicleNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <div className="text-xs text-slate-200 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="truncate">{row.sourceAddress || "Warehouse Origin"}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="truncate">{row.destAddress || "Destination Facility"}</span>
                        </div>
                      </td>

                      {/* Speed Metrics */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                            Max: {Math.round(row.maxSpeed || 0)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Avg: {Math.round(row.avgSpeed || 0)}
                          </span>
                          <span className="text-[10px] text-slate-500">km/h</span>
                        </div>
                      </td>

                      {/* Distance & Stops */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {row.totalDistanceKm ? `${Number(row.totalDistanceKm).toFixed(1)} km` : "—"}
                        </div>
                        <div className="mt-1">
                          {stopsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                              🛑 {stopsCount} {stopsCount === 1 ? "stop" : "stops"} ({stopDuration})
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              No stops recorded
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-4 py-3.5 text-xs text-slate-300 font-mono">
                        <div>
                          {row.startTime
                            ? new Date(row.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                          {" → "}
                          {row.endTime
                            ? new Date(row.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Completed"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetails(row)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm"
                        >
                          View Replay
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRows.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── Stoppage & Trip Replay Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isDetailModalOpen && selectedTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-[#0C0D0D]/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#151D2C] rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-slate-800 pointer-events-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#151D2C] shrink-0">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <MdHistory className="text-[#D4AF37]" />
                    <span>Trip Replay &amp; Stoppage Audit</span>
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/25">
                      {selectedTrip.tripId}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Logged Driver:{" "}
                    {selectedTrip.Driver?.User
                      ? `${selectedTrip.Driver.User.firstName} ${selectedTrip.Driver.User.lastName}`
                      : `Driver #${selectedTrip.driverId}`}{" "}
                    • Vehicle: {selectedTrip.Vehicle?.vehicleNumber || "Assigned Unit"}
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <MdClose size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarWidth: "thin" }}>
                {/* Speed & Stoppage Scorecards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Max Speed
                    </div>
                    <div className="text-xl font-black text-red-400 font-mono mt-0.5">
                      {Math.round(selectedTrip.maxSpeed || 0)}{" "}
                      <span className="text-[10px] text-slate-400">km/h</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Avg Speed
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                      {Math.round(selectedTrip.avgSpeed || 0)}{" "}
                      <span className="text-[10px] text-slate-400">km/h</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Total Stops
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                      {Array.isArray(selectedTrip.stops) ? selectedTrip.stops.length : 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Total Stop Duration
                    </div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {formatDuration(selectedTrip.totalStopTimeSeconds)}
                    </div>
                  </div>
                </div>

                {/* Stoppage Breakdown Section */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#D4AF37] mb-3 flex items-center gap-1.5">
                    <MdTimer size={16} />
                    <span>Recorded Stoppages (&gt;60s Rule Active Detection)</span>
                  </h3>

                  {Array.isArray(selectedTrip.stops) && selectedTrip.stops.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTrip.stops.map((stop, idx) => {
                        const dur = formatDuration(stop.durationSeconds);
                        const lat = stop.stopLatitude || stop.latitude;
                        const lng = stop.stopLongitude || stop.longitude;

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#151D2C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  <span>Stopped at GPS: {lat?.toFixed(5)}, {lng?.toFixed(5)}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400">
                                    {dur}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  Start: {stop.stoppedAt ? new Date(stop.stoppedAt).toLocaleTimeString() : "—"}{" "}
                                  • Resumed: {stop.resumedAt ? new Date(stop.resumedAt).toLocaleTimeString() : "Ongoing"}
                                </div>
                              </div>
                            </div>

                            {lat && lng && (
                              <a
                                href={getGoogleMapsUrl(lat, lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-all self-end sm:self-center"
                              >
                                <MdNavigation size={12} />
                                <span>Inspect Pin</span>
                                <MdOpenInNew size={10} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No stops over 60 seconds were detected during this trip. The vehicle maintained steady transit.
                    </div>
                  )}
                </div>

                {/* Route Map Preview */}
                <div className="rounded-2xl overflow-hidden border border-slate-800">
                  <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300">
                    Route Map Corridor
                  </div>
                  <TripRouteMap
                    sourceLat={selectedTrip.sourceLat}
                    sourceLng={selectedTrip.sourceLng}
                    sourceAddress={selectedTrip.sourceAddress}
                    destLat={selectedTrip.destLat}
                    destLng={selectedTrip.destLng}
                    destAddress={selectedTrip.destAddress}
                    height="240px"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
