import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getVehicles,
  createVehicle,
  deleteVehicle,
} from "../../Redux/Thunks/vehicle.thunks";
import VehicleDrawer from "../../modals/VehicleDrawer";
import AddVehicleModal from "../../modals/AddVehicleModal";
import DeleteVehicleModal from "../../modals/DeleteVehicleModal";
import { clearVehicleState } from "../../Redux/Slices/vehicle.slices";
import Pagination from "../../shared/Pagination";
import CustomDropdown from "../../shared/CustomDropdown";
import {
  MdChevronLeft,
  MdChevronRight,
  MdDirectionsCar,
  MdAdd,
  MdSearch,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdGpsFixed,
  MdBatteryFull,
  MdBattery60,
  MdBattery20,
  MdSpeed,
  MdClose,
  MdWarning,
  MdHistory,
  MdMyLocation,
  MdLocalShipping,
  MdTwoWheeler,
  MdAirportShuttle,
  MdDownload,
  MdRefresh,
  MdDirectionsBus,
  MdAgriculture,
  MdRvHookup,
  MdPrecisionManufacturing,
  MdMedicalServices,
  MdLocalFireDepartment,
  MdLocalPolice,
  MdDirectionsBoat,
  MdFlight,
  MdToys,
  MdElectricScooter,
} from "react-icons/md";

/* ── Status / type maps ──────────────────────────────────────────────────── */
const STATUS_MAP = {
  active: {
    label: "Active",
    dotCls: "bg-[#D4AF37]",
    pulseCls: "animate-pulse",
    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20",
  },
  idle: {
    label: "Idle",
    dotCls: "bg-amber-400",
    pulseCls: "",
    badgeCls: "bg-amber-500/10  text-amber-400  border border-amber-500/20",
  },
  offline: {
    label: "Offline",
    dotCls: "bg-red-400",
    pulseCls: "",
    badgeCls: "bg-red-500/10    text-red-400    border border-red-500/20",
  },
  occupied: {
    label: "Occupied",
    dotCls: "bg-blue-400",
    pulseCls: "",
    badgeCls: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  },
};

const TYPE_ICON = {
  truck: MdLocalShipping,
  van: MdAirportShuttle,
  bike: MdTwoWheeler,
  shuttle: MdAirportShuttle,
  car: MdDirectionsCar,
  bus: MdDirectionsBus,
  suv: MdDirectionsCar,
  motorcycle: MdTwoWheeler,
  pickup: MdLocalShipping,
  minivan: MdAirportShuttle,
  tractor: MdAgriculture,
  trailer: MdRvHookup,
  camper: MdRvHookup,
  forklift: MdPrecisionManufacturing,
  ambulance: MdMedicalServices,
  firetruck: MdLocalFireDepartment,
  police: MdLocalPolice,
  boat: MdDirectionsBoat,
  helicopter: MdFlight,
  airplane: MdFlight,
  drone: MdToys,
  scooter: MdElectricScooter,
  bicycle: MdTwoWheeler,
};
const TYPE_LABEL = {
  truck: "Truck",
  van: "Van",
  bike: "Bike",
  shuttle: "Shuttle",
  car: "Car",
  bus: "Bus",
  suv: "SUV",
  motorcycle: "Motorcycle",
  pickup: "Pickup Truck",
  minivan: "Minivan",
  tractor: "Tractor",
  trailer: "Trailer",
  camper: "Camper",
  forklift: "Forklift",
  ambulance: "Ambulance",
  firetruck: "Fire Truck",
  police: "Police Car",
  boat: "Boat",
  helicopter: "Helicopter",
  airplane: "Airplane",
  drone: "Drone",
  scooter: "Scooter",
  bicycle: "Bicycle",
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Vehicles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editVehicleData, setEditVehicleData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const { vehicles, loading, success, error } = useSelector(
    (state) => state.vehicle,
  );

  const tableContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [vehicles]);

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = 300;
      tableContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    dispatch(getVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowAddModal(false);
      setEditVehicleData(null);
      dispatch(clearVehicleState());
    }
  }, [success, dispatch]);

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (v.id || "").toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      (v.driverAssigned?.name || "").toLowerCase().includes(q) ||
      (v.location?.address || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchType = typeFilter === "all" || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  /* ── Stat counts ────────────────────────────────────────────────────── */
  const counts = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    idle: vehicles.filter((v) => v.status === "idle").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
    occupied: vehicles.filter((v) => v.status === "occupied").length,
  };

  /* ── Stat card config ───────────────────────────────────────────────── */
  const statCards = [
    {
      label: "Total Vehicles",
      value: counts.total,
      color: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/10",
      border: "border-[#D4AF37]/25",
      icon: MdDirectionsCar,
    },
    {
      label: "Active",
      value: counts.active,
      color: "text-[#D4AF37]",
      bg: "bg-[#D4AF37]/10",
      border: "border-[#D4AF37]/25",
      icon: MdGpsFixed,
    },
    {
      label: "Idle",
      value: counts.idle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      icon: MdSpeed,
    },
    {
      label: "Offline",
      value: counts.offline,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/25",
      icon: MdWarning,
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
          <span className="text-xs text-[#111827]/40">Vehicles</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">
            Vehicle Management
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all whitespace-nowrap">
              <MdDownload size={14} /> Export CSV
            </button>
            <button
              onClick={() => dispatch(getVehicles())}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdRefresh size={14} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-shadow whitespace-nowrap"
              onClick={() => setShowAddModal(true)}
            >
              <MdAdd size={15} /> Add Vehicle
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
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
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

      {/* ── Filters + Search ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md p-4 flex flex-col gap-4 relative z-20">
        {/* Top Row: Search */}
        <div className="flex items-center w-full gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0 h-9 px-3 rounded-lg bg-[#111827]/5 border border-[#111827]/8 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.06)] transition-all">
            <MdSearch size={15} className="text-[#111827]/30 shrink-0" />
            <input
              type="text"
              placeholder="Search ID, name, driver, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-[#111827] placeholder:text-[#111827]/25 min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[#111827]/30 hover:text-[#111827]/60 transition-colors shrink-0"
              >
                <MdClose size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Filters (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
          {/* Status filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#111827]/3 border border-[#111827]/6 shrink-0">
            {["all", "active", "idle", "offline", "occupied"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  statusFilter === s
                    ? "bg-[#D4AF37] text-white shadow-sm"
                    : "text-[#111827]/35 hover:text-[#111827]/60"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#111827]/3 border border-[#111827]/6 shrink-0">
            {["all", "truck", "van", "bike", "shuttle"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  typeFilter === t
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-[#111827]/35 hover:text-[#111827]/60"
                }`}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>

          {/* Count */}
          <span className="text-[11px] text-[#111827]/30 shrink-0 ml-auto whitespace-nowrap">
            {filtered.length} of {vehicles.length} vehicles
          </span>
        </div>

        {/* Bottom Row: Filters (Mobile Dropdowns) */}
        <div className="md:hidden flex flex-row items-center gap-3">
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            className="flex-1 h-9 z-50"
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "idle", label: "Idle" },
              { value: "offline", label: "Offline" },
              { value: "occupied", label: "Occupied" },
            ]}
          />

          <CustomDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            className="flex-1 h-9 z-40"
            options={[
              { value: "all", label: "All Types" },
              { value: "truck", label: "Truck" },
              { value: "van", label: "Van" },
              { value: "bike", label: "Bike" },
              { value: "shuttle", label: "Shuttle" },
            ]}
          />
        </div>
      </div>

      {/* ── Table View ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md overflow-hidden relative">
        {canScrollLeft && (
          <button
            onClick={() => scrollTable("left")}
            className="absolute left-0 top-0 h-[38px] z-10 w-12 flex items-center justify-start pl-2 bg-gradient-to-r from-white via-white/80 to-transparent"
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
              <MdChevronLeft size={16} />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scrollTable("right")}
            className="absolute right-0 top-0 h-[38px] z-10 w-12 flex items-center justify-end pr-2 bg-gradient-to-l from-white via-white/80 to-transparent"
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer">
              <MdChevronRight size={16} />
            </div>
          </button>
        )}
        <div
          className="overflow-x-auto pb-2"
          ref={tableContainerRef}
          onScroll={checkScroll}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#111827]/6">
                {[
                  "Vehicle ID",
                  "Name",
                  "Type",
                  "Vehicle Number",
                  "Chassis Number",
                  "Registration",
                  "RC Document",
                  "Insurance",
                  "Pollution",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold text-[#111827]/30 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-16 text-[#111827]/30 text-sm"
                  >
                    No vehicles match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((v) => {
                  const TypeIcon = TYPE_ICON[v.type] || MdDirectionsCar;
                  const st = STATUS_MAP[v.status];
                  return (
                    <tr
                      key={v.id}
                      className="border-b border-[#111827]/4 hover:bg-[#111827]/3 transition-colors cursor-pointer group"
                      onClick={() => setSelectedVehicle(v)}
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-bold text-[#D4AF37] font-mono">
                          {v.id || "—"}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                            <TypeIcon size={15} className="text-[#D4AF37]" />
                          </div>
                          <span className="text-[13px] font-semibold text-[#111827]">
                            {v.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-bold text-[#111827]/60 capitalize">
                          {TYPE_LABEL[v.type] || v.type || "Unknown"}
                        </span>
                      </td>

                      {/* Vehicle Number */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-bold text-[#D4AF37] font-mono">
                          {v.vehicleNumber || "—"}
                        </span>
                      </td>

                      {/* Chassis Number */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] text-[#111827]/60 font-mono">
                          {v.chassisNumber || "—"}
                        </span>
                      </td>

                      {/* Documents */}
                      <td className="px-4 py-3">
                        {v.registrationImage ? (
                          <a
                            href={v.registrationImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            <MdDownload size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#111827]/25 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {v.rcImage ? (
                          <a
                            href={v.rcImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            <MdDownload size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#111827]/25 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {v.insuranceImage ? (
                          <a
                            href={v.insuranceImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            <MdDownload size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#111827]/25 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {v.pollutionImage ? (
                          <a
                            href={v.pollutionImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            <MdDownload size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#111827]/25 italic">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative">
                          <button
                            id={`action-btn-${v.id}`}
                            onClick={(e) => {
                              setOpenMenu(openMenu === v.id ? null : v.id);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#111827]/35 hover:bg-[#111827]/8 hover:text-[#111827]/70 transition-colors"
                          >
                            <MdMoreVert size={16} />
                          </button>
                          {openMenu === v.id && (
                            <ActionMenu
                              vehicle={v}
                              onView={() => {
                                setSelectedVehicle(v);
                                setOpenMenu(null);
                              }}
                              onEdit={() => {
                                setEditVehicleData(v);
                                setShowAddModal(true);
                                setOpenMenu(null);
                              }}
                              onDelete={() => {
                                setShowDeleteModal(v);
                                setOpenMenu(null);
                              }}
                              onClose={() => setOpenMenu(null)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ── Vehicle Detail Drawer ───────────────────────────────────────── */}
      {selectedVehicle && (
        <VehicleDrawer
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onDelete={() => {
            setShowDeleteModal(selectedVehicle);
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => {
            setShowAddModal(false);
            setEditVehicleData(null);
          }}
          dispatch={dispatch}
          loading={loading}
          editData={editVehicleData}
        />
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteVehicleModal
          vehicle={showDeleteModal}
          onConfirm={() => {
            dispatch(deleteVehicle(showDeleteModal.id || showDeleteModal._id));
            setShowDeleteModal(null);
          }}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}
    </div>
  );
}

/* ── Battery Cell ─────────────────────────────────────────────────────────── */
function BatteryCell({ value }) {
  const colorCls =
    value <= 20
      ? "text-red-400"
      : value <= 50
        ? "text-amber-400"
        : "text-[#D4AF37]";
  const BatIcon =
    value <= 20 ? MdBattery20 : value <= 60 ? MdBattery60 : MdBatteryFull;
  return (
    <div className="flex items-center gap-1.5">
      <BatIcon size={15} className={colorCls} />
      <span className={`text-[12px] font-bold font-mono ${colorCls}`}>
        {value}%
      </span>
    </div>
  );
}

/* ── Action Menu ──────────────────────────────────────────────────────────── */
function ActionMenu({ vehicle, onView, onEdit, onDelete, onClose }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const btn = document.getElementById(`action-btn-${vehicle.id}`);
    if (!btn) return;

    const updatePosition = () => {
      setRect(btn.getBoundingClientRect());
    };

    updatePosition();

    // update on scroll and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [vehicle.id]);

  if (!rect) return null;

  const menuWidth = 176;
  const leftPos = rect.right - menuWidth;
  const topPos = rect.bottom + 4;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <div
        className="fixed z-[101] w-44 rounded-xl overflow-hidden bg-white/95 backdrop-blur-md border border-[#111827]/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        style={{ top: topPos, left: leftPos }}
      >
        {[
          {
            icon: MdMyLocation,
            label: "View on Map",
            action: onView,
            colorCls: "text-[#D4AF37]",
          },
          {
            icon: MdHistory,
            label: "Trip History",
            action: onView,
            colorCls: "text-[#D4AF37]",
          },
          {
            icon: MdEdit,
            label: "Edit Vehicle",
            action: onEdit,
            colorCls: "text-[#111827]/50",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-[#111827]/5 transition-colors text-left"
            >
              <Icon size={14} className={item.colorCls} />
              <span className="text-[#111827]/60">{item.label}</span>
            </button>
          );
        })}
        <div className="h-px bg-[#111827]/6 my-0.5" />
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-red-500/8 transition-colors text-left"
        >
          <MdDelete size={14} className="text-red-400" />
          <span className="text-red-400">Delete Vehicle</span>
        </button>
      </div>
    </>,
    document.body,
  );
}
