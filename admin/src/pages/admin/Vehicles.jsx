import { useState } from "react";
import {
  MdDirectionsCar,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdGpsFixed,
  MdBatteryFull,
  MdBattery60,
  MdBattery20,
  MdSpeed,
  MdPerson,
  MdLocationOn,
  MdClose,
  MdCheck,
  MdWarning,
  MdHistory,
  MdMyLocation,
  MdLocalShipping,
  MdTwoWheeler,
  MdAirportShuttle,
  MdDownload,
  MdRefresh,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Mock vehicle data (SOW-based fields) ────────────────────────────────── */
const VEHICLES_DATA = [
  {
    id: "VH-4821",
    name: "Truck Alpha",
    type: "truck",
    driver: "John Smith",
    phone: "+91 98765 43210",
    status: "active",
    speed: 62,
    battery: 87,
    lat: 13.0827,
    lng: 80.2707,
    location: "Chennai Highway, TN",
    lastSeen: "Just now",
    trips: 142,
    distance: "18,420 km",
    imei: "354678901234567",
    sim: "+91 98001 00001",
  },
  {
    id: "VH-0071",
    name: "Van Beta",
    type: "van",
    driver: "Priya Kumar",
    phone: "+91 91234 56789",
    status: "idle",
    speed: 0,
    battery: 45,
    lat: 12.9716,
    lng: 77.5946,
    location: "Bengaluru City, KA",
    lastSeen: "3m ago",
    trips: 89,
    distance: "11,200 km",
    imei: "354678901234568",
    sim: "+91 98001 00002",
  },
  {
    id: "VH-3310",
    name: "Bike Gamma",
    type: "bike",
    driver: "Sara Lee",
    phone: "+91 99887 76655",
    status: "active",
    speed: 94,
    battery: 72,
    lat: 19.076,
    lng: 72.8777,
    location: "Mumbai Western Express",
    lastSeen: "Just now",
    trips: 203,
    distance: "9,870 km",
    imei: "354678901234569",
    sim: "+91 98001 00003",
  },
  {
    id: "VH-2200",
    name: "Truck Delta",
    type: "truck",
    driver: "Carlos M.",
    phone: "+91 97654 32109",
    status: "active",
    speed: 28,
    battery: 61,
    lat: 28.6139,
    lng: 77.209,
    location: "Delhi Ring Road, DL",
    lastSeen: "Just now",
    trips: 98,
    distance: "22,100 km",
    imei: "354678901234570",
    sim: "+91 98001 00004",
  },
  {
    id: "DEV-093",
    name: "Van Epsilon",
    type: "van",
    driver: "Ali Hassan",
    phone: "+91 95432 10987",
    status: "offline",
    speed: 0,
    battery: 9,
    lat: 22.5726,
    lng: 88.3639,
    location: "Kolkata Port, WB",
    lastSeen: "47m ago",
    trips: 56,
    distance: "7,340 km",
    imei: "354678901234571",
    sim: "+91 98001 00005",
  },
  {
    id: "VH-5540",
    name: "Shuttle Zeta",
    type: "shuttle",
    driver: "Meena Raj",
    phone: "+91 96543 21098",
    status: "active",
    speed: 45,
    battery: 93,
    lat: 17.385,
    lng: 78.4867,
    location: "Hyderabad HITEC City, TS",
    lastSeen: "Just now",
    trips: 167,
    distance: "14,680 km",
    imei: "354678901234572",
    sim: "+91 98001 00006",
  },
  {
    id: "VH-1190",
    name: "Truck Eta",
    type: "truck",
    driver: "Ravi Shankar",
    phone: "+91 94321 09876",
    status: "idle",
    speed: 0,
    battery: 38,
    lat: 23.0225,
    lng: 72.5714,
    location: "Ahmedabad Industrial, GJ",
    lastSeen: "12m ago",
    trips: 74,
    distance: "19,050 km",
    imei: "354678901234573",
    sim: "+91 98001 00007",
  },
  {
    id: "VH-6670",
    name: "Van Theta",
    type: "van",
    driver: "Fatima N.",
    phone: "+91 93210 98765",
    status: "active",
    speed: 37,
    battery: 55,
    lat: 26.8467,
    lng: 80.9462,
    location: "Lucknow Bypass, UP",
    lastSeen: "Just now",
    trips: 121,
    distance: "13,200 km",
    imei: "354678901234574",
    sim: "+91 98001 00008",
  },
];

const STATUS_MAP = {
  active: { label: "Active", badge: "badge-active", dot: "bg-fleet-green" },
  idle: { label: "Idle", badge: "badge-idle", dot: "bg-fleet-yellow" },
  offline: { label: "Offline", badge: "badge-offline", dot: "bg-fleet-red" },
};

const TYPE_ICON = {
  truck: MdLocalShipping,
  van: MdAirportShuttle,
  bike: MdTwoWheeler,
  shuttle: MdDirectionsCar,
};

const TYPE_LABEL = {
  truck: "Truck",
  van: "Van",
  bike: "Bike",
  shuttle: "Shuttle",
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Vehicles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table | grid

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filtered = VEHICLES_DATA.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.id.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchType = typeFilter === "all" || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (sortBy === "id") return a.id.localeCompare(b.id);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "driver") return a.driver.localeCompare(b.driver);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    if (sortBy === "speed") return b.speed - a.speed;
    return 0;
  });

  /* ── Stat counts ────────────────────────────────────────────────────── */
  const counts = {
    total: VEHICLES_DATA.length,
    active: VEHICLES_DATA.filter((v) => v.status === "active").length,
    idle: VEHICLES_DATA.filter((v) => v.status === "idle").length,
    offline: VEHICLES_DATA.filter((v) => v.status === "offline").length,
  };

  return (
    <div className="min-h-screen bg-bg-base px-7 py-6 flex flex-col gap-8">
      {/* ── Breadcrumb + Title ─────────────────────────────────────────── */}
      <div className="page-heading">
        <nav className="page-breadcrumb">
          <span>FleetTrack Pro</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="text-text-secondary">Management</span>
          <span className="page-breadcrumb-sep">/</span>
          <span className="text-text-secondary">Vehicles</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="page-title">Vehicle Management</h1>
          <div className="flex items-center gap-2">
            <button className="fleet-btn-ghost text-xs" onClick={() => {}}>
              <MdDownload size={15} /> Export CSV
            </button>
            <button className="fleet-btn-ghost text-xs" onClick={() => {}}>
              <MdRefresh size={15} /> Refresh
            </button>
            <button
              className="fleet-btn-primary text-xs"
              onClick={() => setShowAddModal(true)}
            >
              <MdAdd size={16} /> Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          {
            label: "Total Vehicles",
            value: counts.total,
            color: "text-[var(--color-fleet-blue)]",
            bg: "bg-[rgba(13,110,253,0.1)]",
            border: "border-[rgba(13,110,253,0.2)]",
            icon: MdDirectionsCar,
          },
          {
            label: "Active",
            value: counts.active,
            color: "text-[var(--color-fleet-green)]",
            bg: "bg-[rgba(25,135,84,0.1)]",
            border: "border-[rgba(25,135,84,0.2)]",
            icon: MdGpsFixed,
          },
          {
            label: "Idle",
            value: counts.idle,
            color: "text-[var(--color-fleet-yellow)]",
            bg: "bg-[rgba(255,193,7,0.1)]",
            border: "border-[rgba(255,193,7,0.2)]",
            icon: MdSpeed,
          },
          {
            label: "Offline",
            value: counts.offline,
            color: "text-[var(--color-fleet-red)]",
            bg: "bg-[rgba(171,46,60,0.1)]",
            border: "border-[rgba(171,46,60,0.2)]",
            icon: MdWarning,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="fleet-card p-6 h-15 flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.bg} border ${card.border}`}
              >
                <Icon size={20} className={card.color} />
              </div>
              <div>
                <div
                  className={`text-2xl font-bold  leading-none ${card.color}`}
                >
                  {card.value}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {card.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters + Search bar ──────────────────────────────────────── */}
      <div className="fleet-card p-6 mt-2 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-50 h-10 px-3 rounded-lg bg-white/5 border border-white/8 focus-within:border-[rgba(175,23,99,0.45)] transition-colors">
          <MdSearch
            size={16}
            className="text-text-muted shrink-0"
          />
          <input
            type="text"
            placeholder="Search ID, name, driver, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted font-(--font-sans)"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-text-muted hover:text-text-primary"
            >
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/4 border border-white/6">
          {["all", "active", "idle", "offline"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-fleet-pink text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/4 border border-white/6">
          {["all", "truck", "van", "bike", "shuttle"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 h-5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                typeFilter === t
                  ? "bg-[var(--color-fleet-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-5 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-[var(--color-text-secondary)] outline-none cursor-pointer font-[var(--font-sans)]"
        >
          <option value="id">Sort: ID</option>
          <option value="name">Sort: Name</option>
          <option value="driver">Sort: Driver</option>
          <option value="status">Sort: Status</option>
          <option value="speed">Sort: Speed</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/4 border border-white/6 ml-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "table" ? "bg-white/10 text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === "grid" ? "bg-white/10 text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
          >
            Grid
          </button>
        </div>

        {/* Result count */}
        <span className="text-xs text-[var(--color-text-muted)] shrink-0">
          {filtered.length} of {VEHICLES_DATA.length} vehicles
        </span>
      </div>

      {/* ── Table View ────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="fleet-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/6 h-10">
                  {[
                    "Vehicle ID",
                    "Name & Type",
                    "Driver",
                    "Status",
                    "Speed",
                    "Battery",
                    "Location",
                    "Last Seen",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-16 text-[var(--color-text-muted)] text-sm"
                    >
                      No vehicles match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => {
                    const TypeIcon = TYPE_ICON[v.type];
                    const st = STATUS_MAP[v.status];
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-white/4 hover:bg-white/3 transition-colors cursor-pointer group h-10"
                        onClick={() => setSelectedVehicle(v)}
                      >
                        {/* ID */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-[var(--color-fleet-blue)] font-[var(--font-mono)]">
                            {v.id}
                          </span>
                        </td>

                        {/* Name & Type */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[rgba(13,110,253,0.1)] border border-[rgba(13,110,253,0.2)] flex items-center justify-center shrink-0">
                              <TypeIcon
                                size={15}
                                className="text-[var(--color-fleet-blue)]"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[var(--color-text-primary)] leading-none">
                                {v.name}
                              </div>
                              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                {TYPE_LABEL[v.type]}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Driver */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[rgba(175,23,99,0.2)] border border-[rgba(175,23,99,0.3)] flex items-center justify-center shrink-0">
                              <MdPerson
                                size={13}
                                className="text-[var(--color-fleet-pink)]"
                              />
                            </div>
                            <span className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                              {v.driver}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${st.dot} ${v.status === "active" ? "animate-pulse" : ""}`}
                            />
                            <span className={`badge ${st.badge}`}>
                              {st.label}
                            </span>
                          </div>
                        </td>

                        {/* Speed */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <MdSpeed
                              size={14}
                              className={
                                v.speed > 0
                                  ? "text-[var(--color-fleet-cyan)]"
                                  : "text-[var(--color-text-muted)]"
                              }
                            />
                            <span
                              className={`text-sm font-medium font-[var(--font-mono)] ${v.speed > 80 ? "text-[var(--color-fleet-yellow)]" : "text-[var(--color-text-secondary)]"}`}
                            >
                              {v.speed > 0 ? `${v.speed} km/h` : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Battery */}
                        <td className="px-4 py-4">
                          <BatteryCell value={v.battery} />
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4 max-w-[160px]">
                          <div className="flex items-start gap-1.5">
                            <MdLocationOn
                              size={13}
                              className="text-[var(--color-fleet-pink)] mt-0.5 shrink-0"
                            />
                            <span className="text-xs text-[var(--color-text-muted)] leading-tight line-clamp-2">
                              {v.location}
                            </span>
                          </div>
                        </td>

                        {/* Last seen */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <RiSignalTowerFill
                              size={12}
                              className={
                                v.status === "offline"
                                  ? "text-[var(--color-fleet-red)]"
                                  : "text-[var(--color-fleet-green)]"
                              }
                            />
                            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                              {v.lastSeen}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === v.id ? null : v.id)
                              }
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-white/8 hover:text-[var(--color-text-primary)] transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MdMoreVert size={17} />
                            </button>
                            {openMenu === v.id && (
                              <ActionMenu
                                vehicle={v}
                                onView={() => {
                                  setSelectedVehicle(v);
                                  setOpenMenu(null);
                                }}
                                onEdit={() => {
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

          {/* Table footer */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-white/6 mt-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              Showing {filtered.length} of {VEHICLES_DATA.length} vehicles
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                    p === 1
                      ? "bg-[var(--color-fleet-pink)] text-white"
                      : "text-[var(--color-text-muted)] hover:bg-white/6"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="px-2 h-7 rounded-md text-xs text-[var(--color-text-muted)] hover:bg-white/6 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid View ─────────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onClick={() => setSelectedVehicle(v)}
              onDelete={() => setShowDeleteModal(v)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 text-[var(--color-text-muted)]">
              <MdDirectionsCar size={40} className="opacity-30" />
              <span className="text-sm">No vehicles match your filters</span>
            </div>
          )}
        </div>
      )}

      {/* ── Vehicle Detail Drawer ─────────────────────────────────────── */}
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

      {/* ── Add Vehicle Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <AddVehicleModal onClose={() => setShowAddModal(false)} />
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteModal
          vehicle={showDeleteModal}
          onConfirm={() => setShowDeleteModal(null)}
          onCancel={() => setShowDeleteModal(null)}
        />
      )}

      {/* Close menus on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}

/* ── Battery Cell ─────────────────────────────────────────────────────────── */
function BatteryCell({ value }) {
  const color =
    value <= 20
      ? "text-[var(--color-fleet-red)]"
      : value <= 50
        ? "text-[var(--color-fleet-yellow)]"
        : "text-[var(--color-fleet-green)]";
  const BatIcon =
    value <= 20 ? MdBattery20 : value <= 60 ? MdBattery60 : MdBatteryFull;
  return (
    <div className="flex items-center gap-1.5">
      <BatIcon size={15} className={color} />
      <span className={`text-sm font-medium font-[var(--font-mono)] ${color}`}>
        {value}%
      </span>
    </div>
  );
}

/* ── Action Menu ──────────────────────────────────────────────────────────── */
function ActionMenu({ vehicle, onView, onEdit, onDelete, onClose }) {
  return (
    <div className="absolute right-0 top-8 z-30 w-44 rounded-xl overflow-hidden bg-[var(--color-bg-card2)] border border-white/8 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {[
        {
          icon: MdMyLocation,
          label: "View on Map",
          action: onView,
          color: "text-[var(--color-fleet-cyan)]",
        },
        {
          icon: MdHistory,
          label: "Trip History",
          action: onView,
          color: "text-[var(--color-fleet-blue)]",
        },
        {
          icon: MdEdit,
          label: "Edit Vehicle",
          action: onEdit,
          color: "text-[var(--color-text-secondary)]",
        },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-[var(--font-sans)] hover:bg-white/5 transition-colors text-left"
          >
            <Icon size={15} className={item.color} />
            <span className="text-[var(--color-text-secondary)]">
              {item.label}
            </span>
          </button>
        );
      })}
      <div className="h-px bg-white/6 my-0.5" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-[var(--font-sans)] hover:bg-[rgba(171,46,60,0.08)] transition-colors text-left"
      >
        <MdDelete size={15} className="text-[var(--color-fleet-red)]" />
        <span className="text-[var(--color-fleet-red)]">Delete Vehicle</span>
      </button>
    </div>
  );
}

/* ── Vehicle Grid Card ────────────────────────────────────────────────────── */
function VehicleCard({ vehicle: v, onClick, onDelete }) {
  const TypeIcon = TYPE_ICON[v.type];
  const st = STATUS_MAP[v.status];

  return (
    <div
      className="fleet-card p-6 cursor-pointer flex flex-col gap-3"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(13,110,253,0.1)] border border-[rgba(13,110,253,0.2)] flex items-center justify-center shrink-0">
            <TypeIcon size={20} className="text-[var(--color-fleet-blue)]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--color-text-primary)] leading-none">
              {v.name}
            </div>
            <div className="text-xs text-[var(--color-fleet-blue)] font-[var(--font-mono)] mt-0.5">
              {v.id}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${st.dot} ${v.status === "active" ? "animate-pulse" : ""}`}
          />
          <span className={`badge ${st.badge}`}>{st.label}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Driver */}
      <div className="flex items-center gap-2">
        <MdPerson
          size={14}
          className="text-[var(--color-text-muted)] shrink-0"
        />
        <span className="text-xs text-[var(--color-text-secondary)] truncate">
          {v.driver}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <MdLocationOn
          size={14}
          className="text-[var(--color-fleet-pink)] shrink-0 mt-0.5"
        />
        <span className="text-xs text-[var(--color-text-muted)] leading-tight line-clamp-2">
          {v.location}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        <div className="flex flex-col items-center p-2 rounded-lg bg-white/3 border border-white/5">
          <span
            className={`text-sm font-bold font-[var(--font-mono)] ${v.speed > 0 ? "text-[var(--color-fleet-cyan)]" : "text-[var(--color-text-muted)]"}`}
          >
            {v.speed > 0 ? v.speed : "—"}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            km/h
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-white/3 border border-white/5">
          <span
            className={`text-sm font-bold font-[var(--font-mono)] ${v.battery <= 20 ? "text-[var(--color-fleet-red)]" : v.battery <= 50 ? "text-[var(--color-fleet-yellow)]" : "text-[var(--color-fleet-green)]"}`}
          >
            {v.battery}%
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Battery
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-white/3 border border-white/5">
          <span className="text-sm font-bold font-[var(--font-mono)] text-[var(--color-text-secondary)]">
            {v.trips}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Trips
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2 border-t border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <RiSignalTowerFill
            size={11}
            className={
              v.status === "offline"
                ? "text-[var(--color-fleet-red)]"
                : "text-[var(--color-fleet-green)]"
            }
          />
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {v.lastSeen}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="fleet-btn-ghost text-[10px] py-1 px-2">
            <MdMyLocation size={12} /> Track
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[rgba(171,46,60,0.1)] hover:text-[var(--color-fleet-red)] transition-colors"
          >
            <MdDelete size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Vehicle Detail Drawer ────────────────────────────────────────────────── */
function VehicleDrawer({ vehicle: v, onClose, onDelete }) {
  const TypeIcon = TYPE_ICON[v.type];
  const st = STATUS_MAP[v.status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[var(--color-bg-card)] border-l border-white/8 z-50 flex flex-col shadow-[−4px_0_40px_rgba(0,0,0,0.5)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(13,110,253,0.1)] border border-[rgba(13,110,253,0.2)] flex items-center justify-center">
              <TypeIcon size={20} className="text-[var(--color-fleet-blue)]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] font-[var(--font-sora)]">
                {v.name}
              </div>
              <div className="text-xs text-[var(--color-fleet-blue)] font-[var(--font-mono)]">
                {v.id}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-white/8 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Status banner */}
        <div
          className={`mx-5 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${
            v.status === "active"
              ? "bg-[rgba(25,135,84,0.08)] border-[rgba(25,135,84,0.25)]"
              : v.status === "idle"
                ? "bg-[rgba(255,193,7,0.08)] border-[rgba(255,193,7,0.25)]"
                : "bg-[rgba(171,46,60,0.08)] border-[rgba(171,46,60,0.25)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${st.dot} ${v.status === "active" ? "animate-pulse" : ""}`}
            />
            <span
              className={`text-sm font-semibold ${
                v.status === "active"
                  ? "text-[var(--color-fleet-green)]"
                  : v.status === "idle"
                    ? "text-[var(--color-fleet-yellow)]"
                    : "text-[var(--color-fleet-red)]"
              }`}
            >
              {st.label}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Last seen: {v.lastSeen}
          </span>
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {[
            {
              label: "Speed",
              value: v.speed > 0 ? `${v.speed}` : "—",
              unit: "km/h",
              color: "text-[var(--color-fleet-cyan)]",
            },
            {
              label: "Battery",
              value: `${v.battery}`,
              unit: "%",
              color:
                v.battery <= 20
                  ? "text-[var(--color-fleet-red)]"
                  : v.battery <= 50
                    ? "text-[var(--color-fleet-yellow)]"
                    : "text-[var(--color-fleet-green)]",
            },
            {
              label: "Trips",
              value: `${v.trips}`,
              unit: "total",
              color: "text-[var(--color-fleet-blue)]",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center p-3 rounded-xl bg-white/3 border border-white/6"
            >
              <span
                className={`text-xl font-bold font-[var(--font-mono)] ${m.color}`}
              >
                {m.value}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {m.unit}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Details sections */}
        <div className="px-5 flex flex-col gap-4 pb-5">
          {/* Driver info */}
          <DrawerSection title="Driver Information" icon={MdPerson}>
            <DrawerRow label="Full Name" value={v.driver} />
            <DrawerRow label="Phone" value={v.phone} mono />
          </DrawerSection>

          {/* Location */}
          <DrawerSection title="Current Location" icon={MdLocationOn}>
            <DrawerRow label="Address" value={v.location} />
            <DrawerRow label="Latitude" value={v.lat.toFixed(4)} mono />
            <DrawerRow label="Longitude" value={v.lng.toFixed(4)} mono />
          </DrawerSection>

          {/* Vehicle info */}
          <DrawerSection title="Vehicle Details" icon={MdDirectionsCar}>
            <DrawerRow label="Type" value={TYPE_LABEL[v.type]} />
            <DrawerRow label="Total KM" value={v.distance} mono />
            <DrawerRow label="IMEI" value={v.imei} mono />
            <DrawerRow label="SIM" value={v.sim} mono />
          </DrawerSection>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 p-5 border-t border-white/8 shrink-0 mt-auto">
          <button className="fleet-btn-primary flex-1 justify-center text-sm">
            <MdMyLocation size={16} /> Live Track
          </button>
          <button className="fleet-btn-ghost flex-1 justify-center text-sm">
            <MdHistory size={16} /> Trip History
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-fleet-red)] bg-[rgba(171,46,60,0.1)] border border-[rgba(171,46,60,0.2)] hover:bg-[rgba(171,46,60,0.18)] transition-colors shrink-0"
          >
            <MdDelete size={17} />
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl bg-white/2 border border-white/6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 bg-white/2">
        <Icon size={14} className="text-[var(--color-fleet-pink)]" />
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function DrawerRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-[var(--color-text-muted)] shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-right text-[var(--color-text-secondary)] break-all ${mono ? "font-[var(--font-mono)]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Add Vehicle Modal ────────────────────────────────────────────────────── */
function AddVehicleModal({ onClose }) {
  const [form, setForm] = useState({
    vehicleId: "",
    name: "",
    type: "truck",
    driver: "",
    phone: "",
    imei: "",
    sim: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[var(--color-bg-card)] border border-white/8 rounded-2xl w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] font-[var(--font-sora)]">
                Add New Vehicle
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Register a new vehicle to the fleet
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-white/8 transition-colors"
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 grid grid-cols-2 gap-4">
            <ModalField
              label="Vehicle ID"
              placeholder="VH-0000"
              value={form.vehicleId}
              onChange={set("vehicleId")}
            />
            <ModalField
              label="Vehicle Name"
              placeholder="e.g. Truck Alpha"
              value={form.name}
              onChange={set("name")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold  text-text-secondary tracking-wide">
                Vehicle Type
              </label>
              <select
                value={form.type}
                onChange={set("type")}
                className="h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-sm text-text-primary outline-none font-(--font-sans) focus:border-[rgba(175,23,99,0.45)]"
              >
                {["truck", "van", "bike", "shuttle"].map((t) => (
                  <option key={t} value={t} className="bg-[#191C24]">
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            <ModalField
              label="Assigned Driver"
              placeholder="Driver full name"
              value={form.driver}
              onChange={set("driver")}
            />
            <ModalField
              label="Driver Phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={set("phone")}
            />
            <ModalField
              label="IMEI Number"
              placeholder="15-digit IMEI"
              value={form.imei}
              onChange={set("imei")}
              mono
            />
            <div className="col-span-2">
              <ModalField
                label="SIM Number"
                placeholder="+91 98001 00000"
                value={form.sim}
                onChange={set("sim")}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/8">
            <button className="fleet-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="fleet-btn-primary" onClick={onClose}>
              <MdCheck size={16} /> Register Vehicle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalField({ label, placeholder, value, onChange, mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary tracking-wide">
        {label}
      </label>
      <div
        className={`flex items-center h-9 px-3 rounded-lg bg-white/5 border transition-all ${focused ? "border-[rgba(175,23,99,0.45)] shadow-[0_0_0_3px_rgba(175,23,99,0.08)]" : "border-white/8"}`}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted ${mono ? `font-(--font-mono)` : `font-(--font-sans)`}`}
        />
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ─────────────────────────────────────────────────── */
function DeleteModal({ vehicle: v, onConfirm, onCancel }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-(--color-bg-card) border border-[rgba(171,46,60,0.3)] rounded-2xl w-full max-w-sm shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto">
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(171,46,60,0.12)] border border-[rgba(171,46,60,0.3)] flex items-center justify-center">
              <MdWarning size={28} className="text-fleet-red" />
            </div>
            <div>
              <h3 className="text-base  text-text-primary font-(--font-sora)">
                Delete Vehicle?
              </h3>
              <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="text-text-primary font-semibold">
                  {v.name}
                </span>{" "}
                (
                <span className=" font-(--font-mono) text-fleet-blue">
                  {v.id}
                </span>
                ) from the fleet? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-white/8">
            <button
              className="fleet-btn-ghost flex-1 justify-center"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="flex-1 justify-center h-9 rounded-lg text-sm font-semibold text-white bg-fleet-red border-none cursor-pointer flex items-center gap-2 hover:bg-[#8a2535] transition-colors"
              onClick={onConfirm}
            >
              <MdDelete size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
