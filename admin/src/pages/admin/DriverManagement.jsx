import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDrivers, createDriver, updateDriverStatus } from "../../Redux/Thunks/driver.thunks";
import { clearDriverState } from "../../Redux/Slices/driver.slices";
import {
  MdPersonAdd,
  MdSearch,
  MdMoreVert,
  MdDelete,
  MdClose,
  MdCheck,
  MdWarning,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdDirectionsCar,
  MdDownload,
  MdRefresh,
  MdBlock,
  MdCheckCircle,
  MdVisibility,
  MdEdit,
  MdStar,
  MdLocalShipping,
  MdTwoWheeler,
  MdAirportShuttle,
  MdRoute,
  MdTimer,
  MdCalendarToday,
  MdShield,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/* ── Mock Drivers Data ───────────────────────────────────────────────────── */
const DRIVERS_DATA = [
  { id: "DRV-001", name: "John Smith",    email: "john.smith@fleet.com",    phone: "+91 98765 43210", avatar: "JS", status: "active",    assignedVehicle: "VH-4821", vehicleName: "Truck Alpha",   vehicleType: "truck",   joinDate: "12 Jan 2023", trips: 142, rating: 4.8, totalKm: "18,420 km", location: "Chennai, TN",          licenseNo: "TN-2019-0012345" },
  { id: "DRV-002", name: "Priya Kumar",   email: "priya.kumar@fleet.com",   phone: "+91 91234 56789", avatar: "PK", status: "active",    assignedVehicle: "VH-0071", vehicleName: "Van Beta",      vehicleType: "van",     joinDate: "04 Mar 2023", trips: 89,  rating: 4.6, totalKm: "11,200 km", location: "Bengaluru, KA",        licenseNo: "KA-2020-0054321" },
  { id: "DRV-003", name: "Sara Lee",      email: "sara.lee@fleet.com",      phone: "+91 99887 76655", avatar: "SL", status: "active",    assignedVehicle: "VH-3310", vehicleName: "Bike Gamma",    vehicleType: "bike",    joinDate: "22 Jun 2022", trips: 203, rating: 4.9, totalKm: "9,870 km",  location: "Mumbai, MH",           licenseNo: "MH-2018-0067890" },
  { id: "DRV-004", name: "Carlos M.",     email: "carlos.m@fleet.com",      phone: "+91 97654 32109", avatar: "CM", status: "active",    assignedVehicle: "VH-2200", vehicleName: "Truck Delta",   vehicleType: "truck",   joinDate: "09 Sep 2022", trips: 98,  rating: 4.5, totalKm: "22,100 km", location: "Delhi, DL",            licenseNo: "DL-2019-0098765" },
  { id: "DRV-005", name: "Ali Hassan",    email: "ali.hassan@fleet.com",    phone: "+91 95432 10987", avatar: "AH", status: "suspended", assignedVehicle: "DEV-093", vehicleName: "Van Epsilon",   vehicleType: "van",     joinDate: "17 Nov 2022", trips: 56,  rating: 3.9, totalKm: "7,340 km",  location: "Kolkata, WB",          licenseNo: "WB-2021-0043210" },
  { id: "DRV-006", name: "Meena Raj",     email: "meena.raj@fleet.com",     phone: "+91 96543 21098", avatar: "MR", status: "active",    assignedVehicle: "VH-5540", vehicleName: "Shuttle Zeta",  vehicleType: "shuttle", joinDate: "01 Feb 2023", trips: 167, rating: 4.7, totalKm: "14,680 km", location: "Hyderabad, TS",        licenseNo: "TS-2020-0021987" },
  { id: "DRV-007", name: "Ravi Shankar",  email: "ravi.s@fleet.com",        phone: "+91 94321 09876", avatar: "RS", status: "inactive",  assignedVehicle: "VH-1190", vehicleName: "Truck Eta",     vehicleType: "truck",   joinDate: "28 Apr 2022", trips: 74,  rating: 4.2, totalKm: "19,050 km", location: "Ahmedabad, GJ",        licenseNo: "GJ-2018-0076543" },
  { id: "DRV-008", name: "Fatima N.",     email: "fatima.n@fleet.com",      phone: "+91 93210 98765", avatar: "FN", status: "active",    assignedVehicle: "VH-6670", vehicleName: "Van Theta",     vehicleType: "van",     joinDate: "15 Jul 2023", trips: 121, rating: 4.6, totalKm: "13,200 km", location: "Lucknow, UP",          licenseNo: "UP-2022-0065432" },
  { id: "DRV-009", name: "Dev Patel",     email: "dev.patel@fleet.com",     phone: "+91 92109 87654", avatar: "DP", status: "active",    assignedVehicle: "VH-7780", vehicleName: "Shuttle Iota",  vehicleType: "shuttle", joinDate: "03 Oct 2023", trips: 45,  rating: 4.4, totalKm: "5,630 km",  location: "Pune, MH",             licenseNo: "MH-2023-0011234" },
  { id: "DRV-010", name: "Anjali Verma",  email: "anjali.v@fleet.com",      phone: "+91 90987 65432", avatar: "AV", status: "suspended", assignedVehicle: "—",       vehicleName: "Unassigned",    vehicleType: null,      joinDate: "20 Dec 2022", trips: 33,  rating: 3.7, totalKm: "4,120 km",  location: "Jaipur, RJ",           licenseNo: "RJ-2021-0087654" },
  { id: "DRV-011", name: "Kiran Bose",    email: "kiran.b@fleet.com",       phone: "+91 89876 54321", avatar: "KB", status: "active",    assignedVehicle: "VH-8890", vehicleName: "Truck Kappa",   vehicleType: "truck",   joinDate: "11 May 2023", trips: 88,  rating: 4.3, totalKm: "16,780 km", location: "Bhopal, MP",           licenseNo: "MP-2020-0032109" },
  { id: "DRV-012", name: "Nadia Qureshi", email: "nadia.q@fleet.com",       phone: "+91 88765 43210", avatar: "NQ", status: "inactive",  assignedVehicle: "—",       vehicleName: "Unassigned",    vehicleType: null,      joinDate: "07 Aug 2021", trips: 212, rating: 4.1, totalKm: "28,340 km", location: "Surat, GJ",            licenseNo: "GJ-2017-0054678" },
];

const STATUS_MAP = {
  active:    { label: "Active",    badgeCls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dotCls: "bg-emerald-400", pulseCls: "animate-pulse" },
  suspended: { label: "Suspended", badgeCls: "bg-amber-500/10  text-amber-400  border border-amber-500/20",  dotCls: "bg-amber-400",   pulseCls: "" },
  inactive:  { label: "Inactive",  badgeCls: "bg-red-500/10    text-red-400    border border-red-500/20",    dotCls: "bg-red-400",     pulseCls: "" },
};

const VEHICLE_TYPE_ICON = { truck: MdLocalShipping, van: MdAirportShuttle, bike: MdTwoWheeler, shuttle: MdDirectionsCar };

const AVATAR_COLORS = [
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-indigo-600",
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function DriverManagement() {
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [sortBy,         setSortBy]         = useState("id");
  const [openMenu,       setOpenMenu]       = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [deleteModal,    setDeleteModal]    = useState(null);
  const [blockModal,     setBlockModal]     = useState(null);   // { driver, action: 'suspend'|'activate' }

  const dispatch = useDispatch();
  const { drivers, loading, success, error } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(getDrivers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowAddModal(false);
      setBlockModal(null);
      dispatch(clearDriverState());
    }
  }, [success, dispatch]);

  const formattedDrivers = drivers.map((d) => ({
    id: d._id,
    name: d.name,
    email: d.email,
    phone: d.phone || "—",
    avatar: d.name.substring(0, 2).toUpperCase(),
    status: d.isActive ? "active" : "suspended",
    assignedVehicle: d.vehicleAssigned?.vehicleId || "—",
    vehicleName: d.vehicleAssigned?.name || "Unassigned",
    vehicleType: d.vehicleAssigned?.type || null,
    joinDate: new Date(d.createdAt).toLocaleDateString(),
    trips: d.tripsCount || 0,
    rating: 4.5,
    totalKm: "0 km",
    location: "—",
    licenseNo: d.licenseNumber || "—"
  }));

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filtered = formattedDrivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.assignedVehicle.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "id")     return a.id.localeCompare(b.id);
    if (sortBy === "name")   return a.name.localeCompare(b.name);
    if (sortBy === "trips")  return b.trips - a.trips;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  /* ── Counts ─────────────────────────────────────────────────────────── */
  const counts = {
    total:     formattedDrivers.length,
    active:    formattedDrivers.filter((d) => d.status === "active").length,
    suspended: formattedDrivers.filter((d) => d.status === "suspended").length,
    inactive:  formattedDrivers.filter((d) => d.status === "inactive").length,
  };

  const statCards = [
    { label: "Total Drivers",    value: counts.total,     color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    icon: MdPerson,       via: "via-cyan-400/40"    },
    { label: "Active",           value: counts.active,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", icon: MdCheckCircle,  via: "via-emerald-400/40" },
    { label: "Suspended",        value: counts.suspended, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   icon: MdBlock,        via: "via-amber-400/40"   },
    { label: "Inactive",         value: counts.inactive,  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/25",     icon: MdWarning,      via: "via-red-400/40"     },
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
          <span className="text-xs text-white/40">Users</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all">
              <MdDownload size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all">
              <MdRefresh size={14} /> Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
            >
              <MdPersonAdd size={15} /> Add Driver
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
              <div className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent ${card.via} to-transparent`} />
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
            placeholder="Search name, ID, email, vehicle…"
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
          {["all", "active", "suspended", "inactive"].map((s) => (
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

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white/50 outline-none cursor-pointer"
        >
          <option value="id">Sort: ID</option>
          <option value="name">Sort: Name</option>
          <option value="trips">Sort: Trips</option>
          <option value="rating">Sort: Rating</option>
          <option value="status">Sort: Status</option>
        </select>

        {/* Count */}
        <span className="text-[11px] text-white/30 shrink-0 ml-auto">
          {filtered.length} of {formattedDrivers.length} drivers
        </span>
      </div>

      {/* ── Drivers Table ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Driver", "Contact", "Assigned Vehicle", "Status", "Trips", "Rating", "Total KM", "Joined", ""].map((h) => (
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
                    No drivers match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => {
                  const st = STATUS_MAP[d.status];
                  const VehicleIcon = d.vehicleType ? VEHICLE_TYPE_ICON[d.vehicleType] : MdDirectionsCar;
                  const avatarGrad  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group"
                      onClick={() => setSelectedDriver(d)}
                    >
                      {/* Driver */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg`}>
                            {d.avatar}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-white leading-none">{d.name}</div>
                            <div className="text-[10px] font-bold text-cyan-400 font-mono mt-0.5">{d.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <MdEmail size={11} className="text-white/30 shrink-0" />
                            <span className="text-[11px] text-white/50 truncate max-w-[160px]">{d.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MdPhone size={11} className="text-white/30 shrink-0" />
                            <span className="text-[11px] text-white/50 font-mono">{d.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Vehicle */}
                      <td className="px-4 py-3">
                        {d.vehicleType ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <VehicleIcon size={13} className="text-cyan-400" />
                            </div>
                            <div>
                              <div className="text-[12px] font-semibold text-white leading-none">{d.vehicleName}</div>
                              <div className="text-[10px] font-bold text-cyan-400 font-mono mt-0.5">{d.assignedVehicle}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-white/25 italic">Unassigned</span>
                        )}
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

                      {/* Trips */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MdRoute size={13} className="text-blue-400/70" />
                          <span className="text-[12px] font-bold font-mono text-white/60">{d.trips}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MdStar size={13} className={d.rating >= 4.5 ? "text-amber-400" : d.rating >= 4.0 ? "text-amber-400/70" : "text-white/30"} />
                          <span className={`text-[12px] font-bold font-mono ${d.rating >= 4.5 ? "text-amber-400" : d.rating >= 4.0 ? "text-white/60" : "text-red-400/80"}`}>
                            {d.rating}
                          </span>
                        </div>
                      </td>

                      {/* Total KM */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-mono text-white/50">{d.totalKm}</span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MdCalendarToday size={11} className="text-white/25" />
                          <span className="text-[11px] text-white/35 whitespace-nowrap">{d.joinDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:bg-white/8 hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MdMoreVert size={16} />
                          </button>
                          {openMenu === d.id && (
                            <DriverActionMenu
                              driver={d}
                              onView={() => { setSelectedDriver(d); setOpenMenu(null); }}
                              onToggleStatus={() => {
                                setBlockModal({ driver: d, action: d.status === "active" ? "suspend" : "activate" });
                                setOpenMenu(null);
                              }}
                              onDelete={() => { setDeleteModal(d); setOpenMenu(null); }}
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
            Showing {filtered.length} of {formattedDrivers.length} drivers
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-md text-[11px] font-semibold transition-colors ${
                  p === 1 ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-white/35 hover:bg-white/6"
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

      {/* ── Driver Detail Drawer ─────────────────────────────────────────── */}
      {selectedDriver && (
        <DriverDrawer
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onDelete={() => { setDeleteModal(selectedDriver); setSelectedDriver(null); }}
          onToggleStatus={() => {
            setBlockModal({
              driver: selectedDriver,
              action: selectedDriver.status === "active" ? "suspend" : "activate",
            });
            setSelectedDriver(null);
          }}
        />
      )}

      {/* ── Add Driver Modal ─────────────────────────────────────────────── */}
      {showAddModal && <AddDriverModal onClose={() => setShowAddModal(false)} dispatch={dispatch} loading={loading} />}

      {/* ── Block / Activate Modal ───────────────────────────────────────── */}
      {blockModal && (
        <BlockModal
          driver={blockModal.driver}
          action={blockModal.action}
          onConfirm={() => {
            dispatch(updateDriverStatus({ id: blockModal.driver.id, isActive: blockModal.action === "activate" }));
          }}
          onCancel={() => setBlockModal(null)}
          loading={loading}
        />
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deleteModal && (
        <DeleteModal
          driver={deleteModal}
          onConfirm={() => setDeleteModal(null)}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Close menus on outside click */}
      {openMenu && <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}

/* ── Driver Action Menu ───────────────────────────────────────────────────── */
function DriverActionMenu({ driver, onView, onToggleStatus, onDelete }) {
  const isSuspended = driver.status !== "active";
  return (
    <div className="absolute right-0 top-8 z-30 w-48 rounded-xl overflow-hidden bg-[#111827] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      <button
        onClick={onView}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors text-left"
      >
        <MdVisibility size={14} className="text-cyan-400" />
        <span className="text-white/60">View Profile</span>
      </button>

      <button
        onClick={onToggleStatus}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-white/5 transition-colors text-left"
      >
        {isSuspended ? (
          <>
            <MdCheckCircle size={14} className="text-emerald-400" />
            <span className="text-white/60">Activate Driver</span>
          </>
        ) : (
          <>
            <MdBlock size={14} className="text-amber-400" />
            <span className="text-white/60">Suspend Driver</span>
          </>
        )}
      </button>

      <div className="h-px bg-white/[0.06] my-0.5" />

      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-red-500/8 transition-colors text-left"
      >
        <MdBlock size={14} className="text-red-400" />
        <span className="text-red-400">Block Driver</span>
      </button>
    </div>
  );
}

/* ── Driver Detail Drawer ─────────────────────────────────────────────────── */
function DriverDrawer({ driver: d, onClose, onDelete, onToggleStatus }) {
  const st = STATUS_MAP[d.status];
  const VehicleIcon = d.vehicleType ? VEHICLE_TYPE_ICON[d.vehicleType] : MdDirectionsCar;
  const idx = DRIVERS_DATA.findIndex((dr) => dr.id === d.id);
  const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];

  const statusBannerCls =
    d.status === "active"    ? "bg-emerald-500/8 border-emerald-500/25" :
    d.status === "suspended" ? "bg-amber-500/8  border-amber-500/25"  :
                               "bg-red-500/8    border-red-500/25";
  const statusTextCls =
    d.status === "active"    ? "text-emerald-400" :
    d.status === "suspended" ? "text-amber-400"   : "text-red-400";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0d1420] border-l border-white/8 z-50 flex flex-col overflow-y-auto shadow-[−4px_0_40px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-[14px] font-black text-white shadow-lg`}>
              {d.avatar}
            </div>
            <div>
              <div className="text-[14px] font-black text-white">{d.name}</div>
              <div className="text-[11px] font-bold text-cyan-400 font-mono">{d.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:bg-white/8 transition-colors">
            <MdClose size={17} />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mx-5 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${statusBannerCls}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${st.dotCls} ${st.pulseCls}`} />
            <span className={`text-[13px] font-bold ${statusTextCls}`}>{st.label}</span>
          </div>
          <span className="text-[11px] text-white/35">Joined {d.joinDate}</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {[
            { label: "Trips",   value: d.trips,   unit: "total",  colorCls: "text-blue-400"  },
            { label: "Rating",  value: d.rating,  unit: "/ 5.0",  colorCls: d.rating >= 4.5 ? "text-amber-400" : "text-white/60" },
            { label: "Distance",value: d.totalKm, unit: "driven", colorCls: "text-cyan-400"  },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className={`text-lg font-black font-mono leading-none ${m.colorCls}`}>{m.value}</span>
              <span className="text-[9px] text-white/30 mt-0.5">{m.unit}</span>
              <span className="text-[9px] text-white/30">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="px-5 flex flex-col gap-4 pb-5">
          <DrawerSection title="Contact Details" icon={MdPerson}>
            <DrawerRow label="Email"    value={d.email} />
            <DrawerRow label="Phone"    value={d.phone} mono />
            <DrawerRow label="Location" value={d.location} />
          </DrawerSection>

          <DrawerSection title="Assigned Vehicle" icon={MdDirectionsCar}>
            {d.vehicleType ? (
              <>
                <DrawerRow label="Vehicle"  value={d.vehicleName} />
                <DrawerRow label="ID"       value={d.assignedVehicle} mono />
              </>
            ) : (
              <p className="text-[11px] text-white/30 italic">No vehicle assigned</p>
            )}
          </DrawerSection>

          <DrawerSection title="License & Compliance" icon={MdShield}>
            <DrawerRow label="License No." value={d.licenseNo} mono />
            <DrawerRow label="Joined"      value={d.joinDate} />
          </DrawerSection>
        </div>

        {/* CTA */}
        <div className="flex gap-3 p-5 border-t border-white/8 shrink-0 mt-auto flex-wrap">
          <button
            onClick={onToggleStatus}
            className={`flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-bold transition-all ${
              d.status === "active"
                ? "bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/18"
                                : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/18"
            }`}
          >
            {d.status === "active" ? <><MdBlock size={14} /> Suspend</> : <><MdCheckCircle size={14} /> Activate</>}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/18 transition-colors"
          >
            <MdBlock size={14} /> Block
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

/* ── Add Driver Modal ─────────────────────────────────────────────────────── */
function AddDriverModal({ onClose, dispatch, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", licenseNumber: "", password: "", experience: "", city: "" });
  const [files, setFiles] = useState({ licenseImage: null, aadhaarCard: null, panCard: null });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    Object.keys(files).forEach((k) => {
      if (files[k]) formData.append(k, files[k]);
    });
    dispatch(createDriver(formData));
    toast.success("Registering driver...");
  };

  const steps = [
    { id: 1, label: "Profile Info", icon: MdPerson },
    { id: 2, label: "Documents", icon: MdShield },
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50" 
        onClick={onClose} 
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="rounded-3xl w-full max-w-4xl bg-[#0d1420] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden flex flex-col md:flex-row h-[600px]"
        >
          {/* Left Side: Preview & Progress */}
          <div className="w-full md:w-80 bg-gradient-to-b from-[#111827] to-[#0d1420] border-r border-white/5 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <MdPersonAdd size={18} className="text-cyan-400" />
                </div>
                Onboarding
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">Complete the steps to register a new driver into the system.</p>

              <div className="mt-10 flex flex-col gap-6">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const active = step >= s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-4 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-cyan-500 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "border-white/10"}`}>
                        {active && step > s.id ? <MdCheckCircle size={16} className="text-white" /> : <Icon size={14} className={active ? "text-white" : "text-white/20"} />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-cyan-400" : "text-white/20"}`}>Step 0{s.id}</span>
                        <span className={`text-xs font-bold ${active ? "text-white" : "text-white/30"}`}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#1a2234] rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-black text-white">
                    {form.name ? form.name.substring(0, 2).toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate w-32">{form.name || "Driver Name"}</div>
                    <div className="text-[10px] text-cyan-400/70 font-mono">ID: PENDING</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-1/3" />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                    <span>Exp: {form.experience || "0"}yr</span>
                    <span>{form.city || "Location"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-5"
                  >
                    <div className="col-span-2 mb-2">
                      <h4 className="text-lg font-bold text-white">Personal Information</h4>
                      <p className="text-xs text-white/40">Enter the basic identification details for the driver.</p>
                    </div>
                    <div className="col-span-2">
                      <ModalField label="Full Name" icon={MdPerson} placeholder="e.g. Rahul Sharma" value={form.name} onChange={set("name")} />
                    </div>
                    <ModalField label="Email Address" icon={MdEmail} placeholder="rahul@fleet.com" value={form.email} onChange={set("email")} />
                    <ModalField label="Phone Number" icon={MdPhone} placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} mono />
                    <ModalField label="Password" icon={MdShield} placeholder="Enter a secure password" value={form.password} onChange={set("password")} type="password" />
                    <ModalField label="City" icon={MdLocationOn} placeholder="e.g. New Delhi" value={form.city} onChange={set("city")} />
                    <ModalField label="Driving Exp." icon={MdTimer} placeholder="Years of experience" value={form.experience} onChange={set("experience")} />
                    <ModalField label="License No." icon={MdDirectionsCar} placeholder="DL-1234567890" value={form.licenseNumber} onChange={set("licenseNumber")} mono />
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="mb-2">
                      <h4 className="text-lg font-bold text-white">Document Verification</h4>
                      <p className="text-xs text-white/40">Upload high-quality scans of required legal documents.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <ModalFileField label="Driving License" icon={MdDirectionsCar} file={files.licenseImage} onChange={setFile("licenseImage")} />
                      <ModalFileField label="Aadhaar Card (ID)" icon={MdPerson} file={files.aadhaarCard} onChange={setFile("aadhaarCard")} />
                      <ModalFileField label="PAN Card" icon={MdShield} file={files.panCard} onChange={setFile("panCard")} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-[#111827]/50 flex items-center justify-between">
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
              >
                Close
              </button>
              <div className="flex gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white/60 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-cyan-400 transition-all shadow-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    disabled={loading} 
                    onClick={handleSubmit} 
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ModalFileField({ label, icon: Icon, file, onChange }) {
  return (
    <div className="group">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">{label}</label>
      <div className={`relative h-20 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center px-6 gap-4 ${file ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 hover:border-white/10 bg-white/[0.01]"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? "bg-emerald-500/20" : "bg-white/5"}`}>
          <Icon size={18} className={file ? "text-emerald-400" : "text-white/20"} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold ${file ? "text-emerald-400" : "text-white/60"}`}>
            {file ? file.name : `Upload ${label}`}
          </p>
          <p className="text-[10px] text-white/20 mt-0.5">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, JPG, PNG"}</p>
        </div>
        <input
          type="file"
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {file && <MdCheckCircle size={20} className="text-emerald-400" />}
      </div>
    </div>
  );
}

function ModalField({ label, icon: Icon, placeholder, value, onChange, mono, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>
      <div className={`flex items-center h-11 px-4 rounded-xl bg-white/[0.03] border transition-all duration-300 ${focused ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "border-white/5"}`}>
        <Icon size={16} className={`mr-3 transition-colors ${focused ? "text-cyan-400" : "text-white/20"}`} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/10 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}

/* ── Block / Activate Modal ───────────────────────────────────────────────── */
function BlockModal({ driver: d, action, onConfirm, onCancel, loading }) {
  const isSuspend = action === "suspend";
  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className={`rounded-2xl w-full max-w-sm bg-[#0d1420] border shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto ${isSuspend ? "border-amber-500/25" : "border-emerald-500/25"}`}>
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSuspend ? "bg-amber-500/10 border border-amber-500/25" : "bg-emerald-500/10 border border-emerald-500/25"}`}>
              {isSuspend
                ? <MdBlock size={28} className="text-amber-400" />
                : <MdCheckCircle size={28} className="text-emerald-400" />
              }
            </div>
            <div>
              <h3 className="text-[15px] font-black text-white">
                {isSuspend ? "Suspend Driver?" : "Activate Driver?"}
              </h3>
              <p className="text-[12px] text-white/45 mt-2 leading-relaxed">
                {isSuspend
                  ? <>Are you sure you want to suspend <span className="text-white font-bold">{d.name}</span>? They will lose access until reactivated.</>
                  : <>Reactivate <span className="text-white font-bold">{d.name}</span>? They will regain full access to the fleet.</>
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-white/[0.06]">
            <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-[12px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center">
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              className={`flex-1 h-9 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                isSuspend ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isSuspend ? <><MdBlock size={14} /> Suspend</> : <><MdCheckCircle size={14} /> Activate</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Delete / Block Modal ─────────────────────────────────────────────────── */
function DeleteModal({ driver: d, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="rounded-2xl w-full max-w-sm bg-[#0d1420] border border-red-500/25 shadow-[0_24px_64px_rgba(0,0,0,0.6)] pointer-events-auto">
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              <MdBlock size={28} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-white">Block Driver?</h3>
              <p className="text-[12px] text-white/45 mt-2 leading-relaxed">
                Permanently block <span className="text-white font-bold">{d.name}</span>{" "}
                (<span className="font-mono text-cyan-400">{d.id}</span>) from the fleet?
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-white/[0.06]">
            <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-[12px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <MdBlock size={14} /> Block Driver
            </button>
          </div>
        </div>
      </div>
    </>
  );
}