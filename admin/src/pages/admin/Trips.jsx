import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTrips, deleteTrip } from "../../Redux/Thunks/trip.thunks";
import { getVehicles } from "../../Redux/Thunks/vehicle.thunks";
import { getDrivers } from "../../Redux/Thunks/driver.thunks";
import {
  MdAdd,
  MdSearch,
  MdMoreVert,
  MdDelete,
  MdDirectionsCar,
  MdLocationOn,
  MdCalendarToday,
  MdAssignment,
  MdDownload,
  MdRefresh,
  MdCheckCircle,
  MdBlock,
  MdWarning,
  MdHistory,
  MdRoute,
  MdPerson,
  MdEdit,
  MdVisibility,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../../shared/Pagination";
import CustomDropdown from "../../shared/CustomDropdown";
import AddTripModal from "../../modals/AddTripModal";
import UpdateTripStatusModal from "../../modals/UpdateTripStatusModal";
import DeleteTripModal from "../../modals/DeleteTripModal";
import ViewTripModal from "../../modals/ViewTripModal";

const STATUS_MAP = {
  scheduled: {
    label: "Scheduled",
    badgeCls: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  },
  assigned: {
    label: "Assigned",
    badgeCls: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  },
  ongoing: {
    label: "Ongoing",
    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20",
  },
  completed: {
    label: "Completed",
    badgeCls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    badgeCls: "bg-red-500/10 text-red-500 border border-red-500/20",
  },
};

export default function Trips() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tripTypeFilter, setTripTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTripForStatus, setSelectedTripForStatus] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTripForView, setSelectedTripForView] = useState(null);
  const [showUpdateDetailsModal, setShowUpdateDetailsModal] = useState(false);
  const [selectedTripForDetails, setSelectedTripForDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTripForDelete, setSelectedTripForDelete] = useState(null);
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const { trips = [], loading } = useSelector((state) => state.trip || {});

  useEffect(() => {
    dispatch(getAllTrips());
    dispatch(getVehicles());
    dispatch(getDrivers());
  }, [dispatch]);

  const handleDeleteClick = (trip) => {
    setSelectedTripForDelete(trip);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedTripForDelete) {
      dispatch(deleteTrip(selectedTripForDelete.id));
      setShowDeleteModal(false);
      setSelectedTripForDelete(null);
    }
  };

  const handleExportCSV = () => {
    if (trips.length === 0) return;
    const headers = [
      "Trip ID",
      "Vehicle Number",
      "Vehicle Type",
      "Driver Name",
      "Source",
      "Destination",
      "Start Time",
      "Status",
      "Trip Type"
    ];
    
    const rows = mappedTrips.map(t => [
      t.displayId,
      t.vehicleNumber,
      t.vehicleType,
      t.driverName,
      `"${(t.sourceAddress || "").replace(/"/g, '""')}"`,
      `"${(t.destAddress || "").replace(/"/g, '""')}"`,
      new Date(t.startTime).toLocaleString(),
      t.status,
      t.tripType
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Trips_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mappedTrips = trips.map((t) => ({
    ...t, // Include all original fields
    id: t.id,
    displayId: t.tripId || t.id,
    vehicleType: t.Vehicle?.type || t.vehicleTypeRequired || "Any",
    vehicleNumber: t.Vehicle?.vehicleNumber || "Unassigned",
    driverName: t.User
      ? `${t.User.firstName} ${t.User.lastName}`
      : "Unassigned",
    sourceAddress: t.sourceAddress || "-",
    destAddress: t.destAddress || "-",
    startTime: t.startTime || t.createdAt,
    status: t.status || "scheduled",
    tripType: t.tripType || "one-way",
  }));

  const filtered = mappedTrips.filter((t) => {
    const q = (search || "").toLowerCase();
    const matchSearch =
      !q ||
      String(t.displayId || "").toLowerCase().includes(q) ||
      String(t.vehicleNumber || "").toLowerCase().includes(q) ||
      String(t.driverName || "").toLowerCase().includes(q) ||
      String(t.sourceAddress || "").toLowerCase().includes(q) ||
      String(t.destAddress || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchTripType = tripTypeFilter === "all" || t.tripType === tripTypeFilter;
    return matchSearch && matchStatus && matchTripType;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ── Table Scroll Logic ─────────────────────────────────────────────── */
  const tableContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [paginatedData]);

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      tableContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const counts = {
    total: filtered.length,
    scheduled: filtered.filter((t) => t.status === "scheduled").length,
    ongoing: filtered.filter((t) => t.status === "ongoing").length,
    completed: filtered.filter((t) => t.status === "completed").length,
  };

  const statCards = [
    {
      label: "Total Bookings",
      value: counts.total,
      color: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/10",
      border: "border-[#D4AF37]/25",
      icon: MdAssignment,
      via: "via-[#D4AF37]/40",
    },
    {
      label: "Scheduled",
      value: counts.scheduled,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      icon: MdCalendarToday,
      via: "via-blue-500/40",
    },
    {
      label: "Ongoing",
      value: counts.ongoing,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      icon: MdRoute,
      via: "via-amber-500/40",
    },
    {
      label: "Completed",
      value: counts.completed,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      icon: MdCheckCircle,
      via: "via-emerald-500/40",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-7 py-6 flex flex-col gap-6">
      {/* ── Breadcrumb + Title ──────────────────────────────────────────── */}
      <div>
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold text-[#D4AF37] tracking-wide">
            FleetTrack Pro
          </span>
          <span className="text-xs text-[#111827]/20">/</span>
          <span className="text-xs text-[#111827]/40">Management</span>
          <span className="text-xs text-[#111827]/20">/</span>
          <span className="text-xs text-[#111827]/40">Bookings</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">
            Trip Management
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all"
            >
              <MdDownload size={14} /> Export CSV
            </button>
            <button
              onClick={() => dispatch(getAllTrips())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all"
            >
              <MdRefresh size={14} /> Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-shadow"
            >
              <MdAdd size={15} /> Add Trip
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative rounded-xl p-4 border border-[#111827]/6 bg-white/65 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div
                className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent ${card.via} to-transparent`}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${card.bg} ${card.border}`}
                >
                  <Icon size={18} className={card.color} />
                </div>
                <div>
                  <div
                    className={`text-2xl font-black leading-none ${card.color}`}
                  >
                    {card.value}
                  </div>
                  <div className="text-[11px] text-[#111827]/35 mt-0.5">
                    {card.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters & List ──────────────────────────────────────────────── */}
      <div className="flex-1 bg-white/65 backdrop-blur-md rounded-2xl border border-[#111827]/10 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative">
        <div className="p-4 border-b border-[#111827]/5 flex flex-col gap-4 bg-white/40">
          {/* Top Row: Search */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0 h-9 px-3 rounded-lg bg-white border border-[#111827]/10 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/10 transition-all group">
              <MdSearch size={15} className="text-[#111827]/30 group-focus-within:text-[#D4AF37] shrink-0 transition-colors" />
              <input
                type="text"
                placeholder="Search trips, vehicles, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[#111827] placeholder:text-[#111827]/30 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#111827]/30 hover:text-[#111827]/60 transition-colors shrink-0">
                  <MdClose size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Status filter (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-[#111827]/5 rounded-xl border border-[#111827]/5 shrink-0 w-max overflow-x-auto [scrollbar-width:none]">
              {["all", "scheduled", "assigned", "ongoing", "completed", "cancelled"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 h-8 rounded-lg text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#111827]/50 hover:text-[#111827] hover:bg-white/50"
                    }`}
                  >
                    {st}
                  </button>
                ),
              )}
            </div>

            {/* Trip Type filter (Desktop) */}
            <div className="flex items-center gap-1.5 p-1 bg-[#111827]/5 rounded-xl border border-[#111827]/5 shrink-0 w-max overflow-x-auto [scrollbar-width:none]">
              {["all", "one-way", "round-trip", "multi-city"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setTripTypeFilter(type)}
                    className={`px-4 h-8 rounded-lg text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                      tripTypeFilter === type
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-[#111827]/50 hover:text-[#111827] hover:bg-white/50"
                    }`}
                  >
                    {type === "all" ? "All Types" : type.replace("-", " ")}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Filters (Mobile) */}
          <div className="md:hidden flex flex-row items-center gap-2 w-full">
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              className="flex-1 h-9 z-40 bg-white"
              options={[
                { value: "all", label: "All Status" },
                { value: "scheduled", label: "Scheduled" },
                { value: "assigned", label: "Assigned" },
                { value: "ongoing", label: "Ongoing" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            <CustomDropdown
              value={tripTypeFilter}
              onChange={setTripTypeFilter}
              className="flex-1 h-9 z-40 bg-white"
              options={[
                { value: "all", label: "All Types" },
                { value: "one-way", label: "One Way" },
                { value: "round-trip", label: "Round Trip" },
                { value: "multi-city", label: "Multi City" },
              ]}
            />
          </div>
        </div>

        <div className="relative flex-1 flex flex-col min-h-0">
          {canScrollLeft && (
            <button
              onClick={() => scrollTable("left")}
              className="absolute left-0 top-0 h-[48px] z-10 w-12 flex items-center justify-start pl-2 bg-gradient-to-r from-white via-white/80 to-transparent"
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
                <MdChevronLeft size={16} />
              </div>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollTable("right")}
              className="absolute right-0 top-0 h-[48px] z-10 w-12 flex items-center justify-end pr-2 bg-gradient-to-l from-white via-white/80 to-transparent"
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
                <MdChevronRight size={16} />
              </div>
            </button>
          )}
          <div 
            className="w-full overflow-x-auto hide-scrollbar flex-1"
            ref={tableContainerRef}
            onScroll={checkScroll}
          >
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-[#111827]/[0.02] border-b border-[#111827]/5">
                <th className="px-6 py-4 text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest whitespace-nowrap">
                  Trip Info
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest whitespace-nowrap">
                  Route
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest whitespace-nowrap">
                  Start Time
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#111827]/40">
                        <div className="w-8 h-8 border-4 border-[#111827]/10 border-t-[#D4AF37] rounded-full animate-spin"></div>
                        <p className="mt-4 text-[11px] font-bold uppercase tracking-widest">
                          Loading Trips
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#111827]/40">
                        <div className="w-12 h-12 rounded-full bg-[#111827]/5 flex items-center justify-center mb-3">
                          <MdRoute size={24} />
                        </div>
                        <p className="text-sm font-semibold text-[#111827]/60">
                          No trips found
                        </p>
                        <p className="text-[11px] font-medium mt-1">
                          Adjust filters or create a new trip booking
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((t, i) => {
                    const st = STATUS_MAP[t.status] || STATUS_MAP.scheduled;
                    return (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-[#111827]/5 hover:bg-white/40 transition-colors group relative ${openDropdownId === t.id ? 'z-[50]' : 'z-0'}`}
                      >
                        {/* 1. Trip Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#111827]/5 to-[#111827]/10 flex items-center justify-center border border-[#111827]/10 text-[#111827]/60 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition-colors">
                              <MdAssignment size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[13px] font-black text-[#111827]">
                                  {t.displayId}
                                </p>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest bg-[#111827]/5 text-[#111827]/50 border border-[#111827]/5">
                                  {t.tripType.replace("-", " ")}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border ${t.vehicleNumber === "Unassigned" ? "bg-red-50 text-red-500 border-red-100" : "bg-[#111827]/5 text-[#111827]/50 border-[#111827]/5"}`}
                                >
                                  {t.vehicleNumber === "Unassigned"
                                    ? "Needs " + t.vehicleType
                                    : t.vehicleNumber}
                                </span>
                              </div>
                              <p
                                className={`text-[11px] font-bold mt-0.5 flex items-center gap-1 ${t.driverName === "Unassigned" ? "text-red-400" : "text-[#111827]/50"}`}
                              >
                                <MdPerson size={12} />{" "}
                                {t.driverName === "Unassigned"
                                  ? "No Driver"
                                  : t.driverName}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Route */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-2 h-2 rounded-full border-2 border-emerald-500 bg-white" />
                              <div className="w-px h-3 bg-gray-300" />
                              <div className="w-2 h-2 rounded-full border-2 border-red-500 bg-white" />
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs font-bold text-[#111827]/70">
                              <span
                                className="max-w-[350px] whitespace-normal"
                                title={t.sourceAddress}
                              >
                                {t.sourceAddress}
                              </span>
                              <span
                                className="max-w-[350px] whitespace-normal"
                                title={t.destAddress}
                              >
                                {t.destAddress}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Start Time */}
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-[#111827]">
                            {new Date(t.startTime).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                          {t.status !== "scheduled" && (
                            <p className="text-[11px] text-[#111827]/40 font-bold mt-0.5">
                              {new Date(t.startTime).toLocaleTimeString()}
                            </p>
                          )}
                        </td>

                        {/* 4. Status */}
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${st.badgeCls}`}
                          >
                            {st.label}
                          </div>
                        </td>

                        {/* 5. Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="relative flex justify-end">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === t.id ? null : t.id);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#111827]/5 text-[#111827]/40 hover:text-[#111827] transition-colors"
                            >
                              <MdMoreVert size={16} />
                            </button>
                            
                            <AnimatePresence>
                              {openDropdownId === t.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#111827]/10 overflow-hidden z-[50]"
                                >
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTripForView(t);
                                      setShowViewModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] flex items-center gap-2 transition-colors"
                                  >
                                    <MdVisibility size={14} /> See Details
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTripForStatus(t);
                                      setShowStatusModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] flex items-center gap-2 transition-colors"
                                  >
                                    <MdEdit size={14} /> Update Status
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTripForDetails(t);
                                      setShowUpdateDetailsModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] flex items-center gap-2 transition-colors"
                                  >
                                    <MdEdit size={14} /> Update Details
                                  </button>
                                  <div className="w-full h-px bg-[#111827]/5" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(t);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                                  >
                                    <MdDelete size={14} /> Delete Trip
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination Footer */}
        <div className="shrink-0 p-4 border-t border-[#111827]/5 bg-white/40">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <AddTripModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <ViewTripModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTripForView(null);
        }}
        tripId={selectedTripForView?.id}
      />

      <UpdateTripStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedTripForStatus(null);
        }}
        trip={selectedTripForStatus}
      />

      <AddTripModal
        isOpen={showUpdateDetailsModal}
        onClose={() => {
          setShowUpdateDetailsModal(false);
          setSelectedTripForDetails(null);
        }}
        editData={selectedTripForDetails}
      />

      {showDeleteModal && (
        <DeleteTripModal
          trip={selectedTripForDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedTripForDelete(null);
          }}
        />
      )}
    </div>
  );
}
