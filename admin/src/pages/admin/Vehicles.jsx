import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getVehicles, createVehicle, deleteVehicle } from "../../Redux/Thunks/vehicle.thunks";
import { clearVehicleState } from "../../Redux/Slices/vehicle.slices";
import {
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
  MdCloudUpload,
  MdPhone,
  MdFingerprint,
  MdInfoOutline,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Mock vehicle data ───────────────────────────────────────────────────── */
const VEHICLES_DATA = [
  { id: "VH-4821", name: "Truck Alpha",   type: "truck",   driver: "John Smith",    phone: "+91 98765 43210", status: "active",  speed: 62, battery: 87, lat: 13.0827, lng: 80.2707, location: "Chennai Highway, TN",         lastSeen: "Just now", trips: 142, distance: "18,420 km", imei: "354678901234567", sim: "+91 98001 00001" },
  { id: "VH-0071", name: "Van Beta",      type: "van",     driver: "Priya Kumar",   phone: "+91 91234 56789", status: "idle",    speed: 0,  battery: 45, lat: 12.9716, lng: 77.5946, location: "Bengaluru City, KA",          lastSeen: "3m ago",   trips: 89,  distance: "11,200 km", imei: "354678901234568", sim: "+91 98001 00002" },
  { id: "VH-3310", name: "Bike Gamma",    type: "bike",    driver: "Sara Lee",      phone: "+91 99887 76655", status: "active",  speed: 94, battery: 72, lat: 19.076,  lng: 72.8777, location: "Mumbai Western Express",      lastSeen: "Just now", trips: 203, distance: "9,870 km",  imei: "354678901234569", sim: "+91 98001 00003" },
  { id: "VH-2200", name: "Truck Delta",   type: "truck",   driver: "Carlos M.",     phone: "+91 97654 32109", status: "active",  speed: 28, battery: 61, lat: 28.6139, lng: 77.209,  location: "Delhi Ring Road, DL",         lastSeen: "Just now", trips: 98,  distance: "22,100 km", imei: "354678901234570", sim: "+91 98001 00004" },
  { id: "DEV-093", name: "Van Epsilon",   type: "van",     driver: "Ali Hassan",    phone: "+91 95432 10987", status: "offline", speed: 0,  battery: 9,  lat: 22.5726, lng: 88.3639, location: "Kolkata Port, WB",            lastSeen: "47m ago",  trips: 56,  distance: "7,340 km",  imei: "354678901234571", sim: "+91 98001 00005" },
  { id: "VH-5540", name: "Shuttle Zeta", type: "shuttle", driver: "Meena Raj",     phone: "+91 96543 21098", status: "active",  speed: 45, battery: 93, lat: 17.385,  lng: 78.4867, location: "Hyderabad HITEC City, TS",    lastSeen: "Just now", trips: 167, distance: "14,680 km", imei: "354678901234572", sim: "+91 98001 00006" },
  { id: "VH-1190", name: "Truck Eta",     type: "truck",   driver: "Ravi Shankar",  phone: "+91 94321 09876", status: "idle",    speed: 0,  battery: 38, lat: 23.0225, lng: 72.5714, location: "Ahmedabad Industrial, GJ",    lastSeen: "12m ago",  trips: 74,  distance: "19,050 km", imei: "354678901234573", sim: "+91 98001 00007" },
  { id: "VH-6670", name: "Van Theta",     type: "van",     driver: "Fatima N.",     phone: "+91 93210 98765", status: "active",  speed: 37, battery: 55, lat: 26.8467, lng: 80.9462, location: "Lucknow Bypass, UP",          lastSeen: "Just now", trips: 121, distance: "13,200 km", imei: "354678901234574", sim: "+91 98001 00008" },
];

/* ── Status / type maps ──────────────────────────────────────────────────── */
const STATUS_MAP = {
  active:  { label: "Active",  dotCls: "bg-emerald-400", pulseCls: "animate-pulse", badgeCls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  idle:    { label: "Idle",    dotCls: "bg-amber-400",   pulseCls: "",              badgeCls: "bg-amber-500/10  text-amber-400  border border-amber-500/20"  },
  offline: { label: "Offline", dotCls: "bg-red-400",     pulseCls: "",              badgeCls: "bg-red-500/10    text-red-400    border border-red-500/20"    },
};

const TYPE_ICON  = { truck: MdLocalShipping, van: MdAirportShuttle, bike: MdTwoWheeler, shuttle: MdDirectionsCar };
const TYPE_LABEL = { truck: "Truck", van: "Van", bike: "Bike", shuttle: "Shuttle" };

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Vehicles() {
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [typeFilter,      setTypeFilter]      = useState("all");
  const [sortBy,          setSortBy]          = useState("id");
  const [openMenu,        setOpenMenu]        = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [viewMode,        setViewMode]        = useState("table");

  const dispatch = useDispatch();
  const { vehicles, loading, success, error } = useSelector((state) => state.vehicle);

  useEffect(() => {
    dispatch(getVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowAddModal(false);
      dispatch(clearVehicleState());
    }
  }, [success, dispatch]);

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.vehicleId.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      (v.driverAssigned?.name || "").toLowerCase().includes(q) ||
      (v.location?.address || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchType   = typeFilter   === "all" || v.type   === typeFilter;
    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (sortBy === "id")     return a.vehicleId.localeCompare(b.vehicleId);
    if (sortBy === "name")   return a.name.localeCompare(b.name);
    if (sortBy === "driver") return (a.driverAssigned?.name || "").localeCompare(b.driverAssigned?.name || "");
    if (sortBy === "status") return a.status.localeCompare(b.status);
    if (sortBy === "speed")  return b.speed - a.speed;
    return 0;
  });

  /* ── Stat counts ────────────────────────────────────────────────────── */
  const counts = {
    total:   vehicles.length,
    active:  vehicles.filter((v) => v.status === "active").length,
    idle:    vehicles.filter((v) => v.status === "idle").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
  };

  /* ── Stat card config ───────────────────────────────────────────────── */
  const statCards = [
    { label: "Total Vehicles", value: counts.total,   color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    icon: MdDirectionsCar },
    { label: "Active",         value: counts.active,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", icon: MdGpsFixed      },
    { label: "Idle",           value: counts.idle,    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   icon: MdSpeed         },
    { label: "Offline",        value: counts.offline, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/25",     icon: MdWarning       },
  ];

  return (
    <div className="min-h-screen bg-[#060912] px-7 py-6 flex flex-col gap-6">

      {/* ── Breadcrumb + Title ──────────────────────────────────────────── */}
      <div>
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold text-cyan-400 tracking-wide">FleetTrack Pro</span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs text-white/40">Management</span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs text-white/40">Vehicles</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-white tracking-tight">Vehicle Management</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all">
              <MdDownload size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all">
              <MdRefresh size={14} /> Refresh
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
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
              className="group relative rounded-xl p-4 border border-white/[0.06] bg-[#0d1420] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${card.bg} ${card.border}`}>
                  <Icon size={18} className={card.color} />
                </div>
                <div>
                  <div className={`text-2xl font-black leading-none ${card.color}`}>{card.value}</div>
                  <div className="text-[11px] text-white/35 mt-0.5">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters + Search ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1420] p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 px-3 rounded-lg bg-white/5 border border-white/8 focus-within:border-cyan-500/40 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.06)] transition-all">
          <MdSearch size={15} className="text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search ID, name, driver, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-white/25"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/30 hover:text-white/60 transition-colors">
              <MdClose size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {["all", "active", "idle", "offline"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {["all", "truck", "van", "bike", "shuttle"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                typeFilter === t
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-white/35 hover:text-white/60"
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
          className="h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white/50 outline-none cursor-pointer"
        >
          <option value="id">Sort: ID</option>
          <option value="name">Sort: Name</option>
          <option value="driver">Sort: Driver</option>
          <option value="status">Sort: Status</option>
          <option value="speed">Sort: Speed</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] ml-auto">
          {["table", "grid"].map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                viewMode === v ? "bg-white/10 text-white" : "text-white/30"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-[11px] text-white/30 shrink-0">
          {filtered.length} of {vehicles.length} vehicles
        </span>
      </div>

      {/* ── Table View ──────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Vehicle ID", "Name & Type", "Driver", "Status", "Speed", "Battery", "Location", "Last Seen", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-white/30 text-sm">
                      No vehicles match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => {
                    const TypeIcon = TYPE_ICON[v.type];
                    const st = STATUS_MAP[v.status];
                    return (
                      <tr
                        key={v._id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        onClick={() => setSelectedVehicle(v)}
                      >
                        {/* ID */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold text-cyan-400 font-mono">{v.vehicleId}</span>
                        </td>

                        {/* Name & Type */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <TypeIcon size={15} className="text-cyan-400" />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-white leading-none">{v.name}</div>
                              <div className="text-[10px] text-white/35 mt-0.5">{TYPE_LABEL[v.type]}</div>
                            </div>
                          </div>
                        </td>

                        {/* Driver */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/25 flex items-center justify-center shrink-0">
                              <MdPerson size={13} className="text-fuchsia-400" />
                            </div>
                            <span className="text-[12px] text-white/60 whitespace-nowrap">{v.driverAssigned?.name || "Unassigned"}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dotCls} ${st.pulseCls}`} />
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${st.badgeCls}`}>
                              {st.label}
                            </span>
                          </div>
                        </td>

                        {/* Speed */}
                        <td className="px-4 py-3">
                          <span className={`text-[12px] font-bold font-mono ${v.speed > 80 ? "text-amber-400" : v.speed > 0 ? "text-cyan-400" : "text-white/25"}`}>
                            {v.speed > 0 ? `${v.speed} km/h` : "—"}
                          </span>
                        </td>

                        {/* Battery */}
                        <td className="px-4 py-3">
                          <BatteryCell value={v.battery} />
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 max-w-[160px]">
                          <div className="flex items-start gap-1.5">
                            <MdLocationOn size={13} className="text-fuchsia-400 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-white/40 leading-tight line-clamp-2">{v.location?.address || "No location"}</span>
                          </div>
                        </td>

                        {/* Last seen */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <RiSignalTowerFill size={11} className={v.status === "offline" ? "text-red-400" : "text-emerald-400"} />
                            <span className="text-[11px] text-white/35 whitespace-nowrap">{new Date(v.lastSeen).toLocaleTimeString()}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === v._id ? null : v._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:bg-white/8 hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MdMoreVert size={16} />
                            </button>
                            {openMenu === v._id && (
                              <ActionMenu
                                vehicle={v}
                                onView={() => { setSelectedVehicle(v); setOpenMenu(null); }}
                                onEdit={() => setOpenMenu(null)}
                                onDelete={() => { setShowDeleteModal(v); setOpenMenu(null); }}
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-[11px] text-white/30">
              Showing {filtered.length} of {vehicles.length} vehicles
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-md text-[11px] font-semibold transition-colors ${
                    p === 1
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "text-white/35 hover:bg-white/6"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="px-2 h-7 rounded-md text-[11px] text-white/35 hover:bg-white/6 transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid View ───────────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <VehicleCard
              key={v._id}
              vehicle={v}
              onClick={() => setSelectedVehicle(v)}
              onDelete={() => setShowDeleteModal(v)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 text-white/25">
              <MdDirectionsCar size={40} className="opacity-30" />
              <span className="text-sm">No vehicles match your filters</span>
            </div>
          )}
        </div>
      )}

      {/* ── Vehicle Detail Drawer ───────────────────────────────────────── */}
      {selectedVehicle && (
        <VehicleDrawer
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onDelete={() => { setShowDeleteModal(selectedVehicle); setSelectedVehicle(null); }}
        />
      )}

      {/* ── Add Vehicle Modal ───────────────────────────────────────────── */}
      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} dispatch={dispatch} loading={loading} />}

      {/* ── Delete Confirm Modal ────────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteModal
          vehicle={showDeleteModal}
          onConfirm={() => {
            dispatch(deleteVehicle(showDeleteModal._id));
            setShowDeleteModal(null);
          }}
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
  const colorCls = value <= 20 ? "text-red-400" : value <= 50 ? "text-amber-400" : "text-emerald-400";
  const BatIcon  = value <= 20 ? MdBattery20 : value <= 60 ? MdBattery60 : MdBatteryFull;
  return (
    <div className="flex items-center gap-1.5">
      <BatIcon size={15} className={colorCls} />
      <span className={`text-[12px] font-bold font-mono ${colorCls}`}>{value}%</span>
    </div>
  );
}

/* ── Action Menu ──────────────────────────────────────────────────────────── */
function ActionMenu({ vehicle, onView, onEdit, onDelete, onClose }) {
  return (
    <div className="absolute right-0 top-8 z-30 w-44 rounded-xl overflow-hidden bg-[#111827] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {[
        { icon: MdMyLocation, label: "View on Map",   action: onView, colorCls: "text-cyan-400"    },
        { icon: MdHistory,    label: "Trip History",  action: onView, colorCls: "text-blue-400"    },
        { icon: MdEdit,       label: "Edit Vehicle",  action: onEdit, colorCls: "text-white/50"    },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors text-left"
          >
            <Icon size={14} className={item.colorCls} />
            <span className="text-white/60">{item.label}</span>
          </button>
        );
      })}
      <div className="h-px bg-white/[0.06] my-0.5" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-red-500/8 transition-colors text-left"
      >
        <MdDelete size={14} className="text-red-400" />
        <span className="text-red-400">Delete Vehicle</span>
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
      className="group relative rounded-xl border border-white/[0.06] bg-[#0d1420] hover:border-cyan-500/25 hover:-translate-y-0.5 transition-all duration-200 p-5 cursor-pointer flex flex-col gap-3 overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <TypeIcon size={19} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white leading-none">{v.name}</div>
            <div className="text-[10px] font-bold text-cyan-400 font-mono mt-0.5">{v.vehicleId}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${st.dotCls} ${st.pulseCls}`} />
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${st.badgeCls}`}>{st.label}</span>
        </div>
      </div>

      <div className="h-px bg-white/[0.04]" />

      {/* Driver */}
      <div className="flex items-center gap-2">
        <MdPerson size={13} className="text-white/30 shrink-0" />
        <span className="text-[12px] text-white/55 truncate">{v.driverAssigned?.name || "Unassigned"}</span>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <MdLocationOn size={13} className="text-fuchsia-400 shrink-0 mt-0.5" />
        <span className="text-[11px] text-white/35 leading-tight line-clamp-2">{v.location?.address || "No location data"}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {[
          { label: "km/h",    value: v.speed > 0 ? v.speed : "—", colorCls: v.speed > 0 ? "text-cyan-400" : "text-white/25" },
          { label: "Battery", value: `${v.battery}%`,             colorCls: v.battery <= 20 ? "text-red-400" : v.battery <= 50 ? "text-amber-400" : "text-emerald-400" },
          { label: "Trips",   value: v.tripsCount || 0,           colorCls: "text-white/60" },
        ].map((m) => (
          <div key={m.label} className="flex flex-col items-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <span className={`text-[13px] font-bold font-mono ${m.colorCls}`}>{m.value}</span>
            <span className="text-[9px] text-white/30 mt-0.5">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2 border-t border-white/[0.04]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <RiSignalTowerFill size={11} className={v.status === "offline" ? "text-red-400" : "text-emerald-400"} />
          <span className="text-[10px] text-white/30">{new Date(v.lastSeen).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-[10px] font-semibold hover:bg-cyan-500/15 transition-colors">
            <MdMyLocation size={11} /> Track
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <MdDelete size={13} />
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

  const statusBannerCls = v.status === "active"
    ? "bg-emerald-500/8 border-emerald-500/25"
    : v.status === "idle"
    ? "bg-amber-500/8 border-amber-500/25"
    : "bg-red-500/8 border-red-500/25";

  const statusTextCls = v.status === "active" ? "text-emerald-400" : v.status === "idle" ? "text-amber-400" : "text-red-400";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0d1420] border-l border-white/8 z-50 flex flex-col shadow-[−4px_0_40px_rgba(0,0,0,0.5)] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TypeIcon size={20} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-[14px] font-black text-white">{v.name}</div>
              <div className="text-[11px] font-bold text-cyan-400 font-mono">{v.id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:bg-white/8 transition-colors"
          >
            <MdClose size={17} />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mx-5 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${statusBannerCls}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${st.dotCls} ${st.pulseCls}`} />
            <span className={`text-[13px] font-bold ${statusTextCls}`}>{st.label}</span>
          </div>
          <span className="text-[11px] text-white/35">Last seen: {v.lastSeen}</span>
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {[
            { label: "Speed",   value: v.speed > 0 ? `${v.speed}` : "—", unit: "km/h",  colorCls: "text-cyan-400" },
            { label: "Battery", value: `${v.battery}`,                    unit: "%",     colorCls: v.battery <= 20 ? "text-red-400" : v.battery <= 50 ? "text-amber-400" : "text-emerald-400" },
            { label: "Trips",   value: `${v.trips}`,                      unit: "total", colorCls: "text-blue-400" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className={`text-xl font-black font-mono ${m.colorCls}`}>{m.value}</span>
              <span className="text-[9px] text-white/30 mt-0.5">{m.unit}</span>
              <span className="text-[9px] text-white/30">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Detail sections */}
        <div className="px-5 flex flex-col gap-4 pb-5">
          <DrawerSection title="Driver Information" icon={MdPerson}>
            <DrawerRow label="Full Name" value={v.driver} />
            <DrawerRow label="Phone"     value={v.phone} mono />
          </DrawerSection>

          <DrawerSection title="Current Location" icon={MdLocationOn}>
            <DrawerRow label="Address"   value={v.location} />
            <DrawerRow label="Latitude"  value={v.lat.toFixed(4)} mono />
            <DrawerRow label="Longitude" value={v.lng.toFixed(4)} mono />
          </DrawerSection>

          <DrawerSection title="Vehicle Details" icon={MdDirectionsCar}>
            <DrawerRow label="Type"     value={TYPE_LABEL[v.type]} />
            <DrawerRow label="Total KM" value={v.distance} mono />
            <DrawerRow label="IMEI"     value={v.imei} mono />
            <DrawerRow label="SIM"      value={v.sim}  mono />
          </DrawerSection>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 p-5 border-t border-white/8 shrink-0 mt-auto">
          <button className="flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow">
            <MdMyLocation size={15} /> Live Track
          </button>
          <button className="flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all">
            <MdHistory size={15} /> Trip History
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/18 transition-colors shrink-0"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <Icon size={13} className="text-fuchsia-400" />
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function DrawerRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-white/30 shrink-0">{label}</span>
      <span className={`text-[11px] text-right text-white/60 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Add Vehicle Modal ────────────────────────────────────────────────────── */
function AddVehicleModal({ onClose, dispatch, loading }) {
  const [form, setForm] = useState({ vehicleId: "", name: "", type: "truck", driver: "", phone: "", imei: "", sim: "" });
  const [files, setFiles] = useState({ registrationImage: null, rcImage: null, insuranceImage: null, pollutionImage: null });
  
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] }));

  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    Object.keys(files).forEach((k) => {
      if (files[k]) formData.append(k, files[k]);
    });
    dispatch(createVehicle(formData));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="rounded-2xl w-full max-w-lg bg-[#0d1420] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div>
              <h3 className="text-[15px] font-black text-white">Add New Vehicle</h3>
              <p className="text-[11px] text-white/35 mt-0.5">Register a new vehicle to the fleet</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:bg-white/8 transition-colors">
              <MdClose size={17} />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 grid grid-cols-2 gap-4">
            <ModalField label="Vehicle ID"      placeholder="VH-0000"          value={form.vehicleId} onChange={set("vehicleId")} />
            <ModalField label="Vehicle Name"    placeholder="e.g. Truck Alpha"  value={form.name}      onChange={set("name")} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/45 uppercase tracking-wider">Vehicle Type</label>
              <select
                value={form.type}
                onChange={set("type")}
                className="h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-[13px] text-white outline-none focus:border-cyan-500/40 transition-colors"
              >
                {["truck", "van", "bike", "shuttle"].map((t) => (
                  <option key={t} value={t} className="bg-[#0d1420]">{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>

            <ModalField label="Assigned Driver" placeholder="Driver full name"   value={form.driver} onChange={set("driver")} />
            <ModalField label="Driver Phone"    placeholder="+91 98765 43210"    value={form.phone}  onChange={set("phone")} />
            <ModalField label="IMEI Number"     placeholder="15-digit IMEI"      value={form.imei}   onChange={set("imei")} mono />
            <ModalField label="SIM Number"      placeholder="+91 98001 00000"    value={form.sim}    onChange={set("sim")} />

            {/* Document Uploads */}
            <div className="col-span-2 mt-2">
              <h4 className="text-[12px] font-bold text-white/70 mb-2 border-b border-white/10 pb-1">Vehicle Documents</h4>
            </div>
            <ModalFileField label="Registration" onChange={setFile("registrationImage")} />
            <ModalFileField label="RC Document"  onChange={setFile("rcImage")} />
            <ModalFileField label="Insurance"    onChange={setFile("insuranceImage")} />
            <ModalFileField label="Pollution"    onChange={setFile("pollutionImage")} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow disabled:opacity-50">
              <MdCheck size={14} /> {loading ? "Registering..." : "Register Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalFileField({ label, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-white/45 uppercase tracking-wider">{label}</label>
      <div className="flex items-center h-9 px-3 rounded-lg bg-white/5 border border-white/8 transition-all hover:border-white/20">
        <input
          type="file"
          onChange={onChange}
          className="flex-1 bg-transparent border-none outline-none text-[11px] text-white/70 file:cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all"
        />
      </div>
    </div>
  );
}

function ModalField({ label, placeholder, value, onChange, mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-white/45 uppercase tracking-wider">{label}</label>
      <div className={`flex items-center h-9 px-3 rounded-lg bg-white/5 border transition-all ${focused ? "border-cyan-500/40 shadow-[0_0_0_3px_rgba(34,211,238,0.06)]" : "border-white/8"}`}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/25 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ─────────────────────────────────────────────────── */
function DeleteModal({ vehicle: v, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="rounded-2xl w-full max-w-sm bg-[#0d1420] border border-red-500/25 shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto">
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              <MdWarning size={28} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-white">Delete Vehicle?</h3>
              <p className="text-[12px] text-white/45 mt-2 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="text-white font-bold">{v.name}</span>{" "}
                (<span className="font-mono text-cyan-400">{v.id}</span>) from the fleet?
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-white/[0.06]">
            <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-[12px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <MdDelete size={15} /> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}