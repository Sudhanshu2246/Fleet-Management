import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDrivers, updateDriverStatus, deleteDriver } from "../../Redux/Thunks/driver.thunks";
import { clearDriverState } from "../../Redux/Slices/driver.slices";
import DriverDetailsModal from "../../modals/DriverDetailsModal";
import AddDriverModal from "../../modals/AddDriverModal";
import BlockDriverModal from "../../modals/BlockDriverModal";
import DeleteDriverModal from "../../modals/DeleteDriverModal";
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
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Pagination from "../../shared/Pagination";
import CustomDropdown from "../../shared/CustomDropdown";


const STATUS_MAP = {
  active:    { label: "Active",    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20", dotCls: "bg-[#D4AF37]", pulseCls: "animate-pulse" },
  suspended: { label: "Suspended", badgeCls: "bg-amber-500/10  text-amber-400  border border-amber-500/20",  dotCls: "bg-amber-400",   pulseCls: "" },
  inactive:  { label: "Inactive",  badgeCls: "bg-red-500/10    text-red-400    border border-red-500/20",    dotCls: "bg-red-400",     pulseCls: "" },
};

const VEHICLE_TYPE_ICON = { truck: MdLocalShipping, van: MdAirportShuttle, bike: MdTwoWheeler, shuttle: MdDirectionsCar };

const AVATAR_COLORS = [
  "bg-[#D4AF37]",
  "from-fuchsia-500 to-purple-600",
  "bg-[#D4AF37]",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-indigo-600",
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function DriverManagement() {
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [typeFilter,     setTypeFilter]     = useState("all");
  const [sortBy,         setSortBy]         = useState("id");
  const [openMenu,       setOpenMenu]       = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editDriverData, setEditDriverData] = useState(null);
  const [deleteModal,    setDeleteModal]    = useState(null);
  const [blockModal,     setBlockModal]     = useState(null);   // { driver, action: 'suspend'|'activate' }
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const { drivers, loading, success, error } = useSelector((state) => state.driver);

  const tableContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [drivers]);

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
    dispatch(getDrivers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setShowAddModal(false);
      setEditDriverData(null);
      setBlockModal(null);
      dispatch(clearDriverState());
    }
  }, [success, dispatch]);

  const formattedDrivers = drivers.map((d) => {
    const driverDetails = d.Driver || {};
    return {
      id: d.id || d._id,
      name: `${d.firstName || ""} ${d.lastName || ""}`.trim(),
      email: d.email,
      phone: d.phone || "—",
      avatar: (d.firstName || d.name || "?").substring(0, 2).toUpperCase(),
      status: driverDetails.isActive ? "active" : "suspended",
      driverType: driverDetails.driverType || "driver",
      licenseNo: driverDetails.licenseNumber || "—",
      licenseType: driverDetails.licenseType || "—",
      vehicleCategories: driverDetails.vehicleCategories || "—",
      licenseExpiryDate: driverDetails.licenseExpiryDate || "—",
      aadhaarCard: driverDetails.aadhaarCard || "—",
      panCard: driverDetails.panCard || "—",
      isVerified: driverDetails.isVerified || false,
      occupiedStatus: driverDetails.occupiedStatus || "available",
      joinDate: new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      raw: d,
    };
  });

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filtered = formattedDrivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (d.id && d.id.toString().toLowerCase().includes(q)) ||
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.email && d.email.toLowerCase().includes(q)) ||
      (d.phone && d.phone.includes(q));
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchType = typeFilter === "all" || d.driverType === typeFilter;
    return matchSearch && matchStatus && matchType;
  }).sort((a, b) => {
    if (sortBy === "id")     return (a.id?.toString() || "").localeCompare(b.id?.toString() || "");
    if (sortBy === "name")   return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
    return 0;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ── Counts ─────────────────────────────────────────────────────────── */
  const counts = {
    total:     formattedDrivers.length,
    active:    formattedDrivers.filter((d) => d.status === "active").length,
    suspended: formattedDrivers.filter((d) => d.status === "suspended").length,
    inactive:  formattedDrivers.filter((d) => d.status === "inactive").length,
  };

  const statCards = [
    { label: "Total Drivers",    value: counts.total,     color: "text-[#D4AF37]",    bg: "bg-[#D4AF37]/10",    border: "border-[#D4AF37]/25",    icon: MdPerson,       via: "via-[#D4AF37]/40"    },
    { label: "Active",           value: counts.active,    color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/25", icon: MdCheckCircle,  via: "via-[#D4AF37]/40" },
    { label: "Suspended",        value: counts.suspended, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   icon: MdBlock,        via: "via-amber-400/40"   },
    { label: "Inactive",         value: counts.inactive,  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/25",     icon: MdWarning,      via: "via-red-400/40"     },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-7 py-6 flex flex-col gap-6">

      {/* ── Breadcrumb + Title ──────────────────────────────────────────── */}
      <div>
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold text-[#D4AF37] tracking-wide">FleetTrack Pro</span>
          <span className="text-xs text-[#111827]/20">/</span>
          <span className="text-xs text-[#111827]/40">Management</span>
          <span className="text-xs text-[#111827]/20">/</span>
          <span className="text-xs text-[#111827]/40">Users</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">User Management</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all">
              <MdDownload size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all">
              <MdRefresh size={14} /> Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-shadow"
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
              className="group relative rounded-xl p-4 border border-[#111827]/6 bg-white/65 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent ${card.via} to-transparent`} />
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${card.bg} ${card.border}`}>
                  <Icon size={18} className={card.color} />
                </div>
                <div>
                  <div className={`text-2xl font-black leading-none ${card.color}`}>{card.value}</div>
                  <div className="text-[11px] text-[#111827]/35 mt-0.5">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters + Search ────────────────────────────────────────────── */}
      <div className="relative z-40 rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 px-3 rounded-lg bg-[#111827]/5 border border-[#111827]/8 focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,0.06)] transition-all">
          <MdSearch size={15} className="text-[#111827]/30 shrink-0" />
          <input
            type="text"
            placeholder="Search name, ID, email, vehicle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#111827] placeholder:text-[#111827]/25"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#111827]/30 hover:text-[#111827]/60 transition-colors">
              <MdClose size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#111827]/3 border border-[#111827]/6">
          {["all", "active", "suspended", "inactive"].map((s) => (
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

        {/* Sort */}
        <div className="w-[130px] h-9">
          <CustomDropdown
            value={sortBy}
            onChange={setSortBy}
            options={[
              { label: "Sort: ID", value: "id" },
              { label: "Sort: Name", value: "name" },
              { label: "Sort: Status", value: "status" },
            ]}
            className="h-full"
          />
        </div>

        {/* Driver Type Filter */}
        <div className="w-[130px] h-9">
          <CustomDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All Types", value: "all" },
              { label: "Driver", value: "driver" },
              { label: "Co-Driver", value: "co_driver" },
            ]}
            className="h-full"
          />
        </div>

        {/* Count */}
        <span className="text-[11px] text-[#111827]/30 shrink-0 ml-auto">
          {filtered.length} of {formattedDrivers.length} drivers
        </span>
      </div>

      {/* ── Drivers Table ───────────────────────────────────────────────── */}
      <div className="relative z-30 rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md pb-16 overflow-hidden">
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
          className="w-full overflow-x-auto hide-scrollbar"
          ref={tableContainerRef}
          onScroll={checkScroll}
        >
          <table className="w-full border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-[#111827]/6">
                {["ID & Driver", "Contact", "License Info", "Identity", "Status", "Occupied", "Joined", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#111827]/30 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#111827]/30 text-sm">
                    No drivers match your filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((d, idx) => {
                  const st = STATUS_MAP[d.status];
                  const avatarGrad  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr
                      key={d.id}
                      className={`border-b border-[#111827]/4 hover:bg-[#111827]/2.5 transition-colors group relative ${openMenu === d.id ? "z-50" : "z-0"}`}
                    >
                      {/* Driver */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg`}>
                            {d.avatar}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#111827] leading-none">{d.name}</div>
                            <div className={`text-[10px] font-bold font-mono mt-0.5 ${d.driverType === 'co_driver' ? 'text-indigo-500' : 'text-[#D4AF37]'}`}>
                              ID: {d.id} • <span className="uppercase">{d.driverType.replace("_", " ")}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <MdEmail size={11} className="text-[#111827]/30 shrink-0" />
                            <span className="text-[11px] text-[#111827]/50 truncate max-w-[160px]">{d.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MdPhone size={11} className="text-[#111827]/30 shrink-0" />
                            <span className="text-[11px] text-[#111827]/50 font-mono">{d.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* License Info */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                           <div className="text-[11px] font-mono text-[#111827]/70 font-semibold">{d.licenseNo}</div>
                           <div className="text-[10px] text-[#111827]/40 uppercase tracking-wider">{d.licenseType} • {d.vehicleCategories}</div>
                           <div className="text-[10px] text-amber-500/70">Exp: {d.licenseExpiryDate}</div>
                        </div>
                      </td>

                      {/* Identity */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 text-[10px] font-mono text-[#111827]/50">
                          <div><span className="text-[#111827]/30">AADHAAR:</span> {d.aadhaarCard}</div>
                          <div><span className="text-[#111827]/30">PAN:</span> {d.panCard}</div>
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

                      {/* Occupied Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          d.occupiedStatus === "occupied" 
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {d.occupiedStatus}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-1.5 mt-1">
                          <MdCalendarToday size={11} className="text-[#111827]/25" />
                          <span className="text-[11px] text-[#111827]/35 whitespace-nowrap">{d.joinDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className={`relative ${openMenu === d.id ? 'z-50' : ''}`}>
                          <button
                            onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#111827]/35 hover:bg-[#111827]/8 hover:text-[#111827]/70 transition-colors"
                          >
                            <MdMoreVert size={16} />
                          </button>
                          {openMenu === d.id && (
                            <DriverActionMenu
                              driver={d}
                              onView={() => { 
                                setSelectedDriver(d); 
                                setOpenMenu(null); 
                              }}
                              onEdit={() => {
                                setEditDriverData(d);
                                setShowAddModal(true);
                                setOpenMenu(null);
                              }}
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

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ── Driver Detail Modal ─────────────────────────────────────────── */}
      {selectedDriver && (
        <DriverDetailsModal
          driverId={selectedDriver.id}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {/* ── Add Driver Modal ─────────────────────────────────────────────── */}
      {showAddModal && <AddDriverModal onClose={() => { setShowAddModal(false); setEditDriverData(null); }} dispatch={dispatch} loading={loading} editDriverData={editDriverData} />}

      {/* ── Block / Activate Modal ───────────────────────────────────────── */}
      {blockModal && (
        <BlockDriverModal
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
        <DeleteDriverModal
          driver={deleteModal}
          onConfirm={() => {
            dispatch(deleteDriver(deleteModal.id));
            setDeleteModal(null);
          }}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Close menus on outside click */}
      {openMenu && <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}

/* ── Driver Action Menu ───────────────────────────────────────────────────── */
function DriverActionMenu({ driver, onView, onEdit, onToggleStatus, onDelete }) {
  const isSuspended = driver.status !== "active";
  return (
    <div className="absolute right-0 top-8 z-30 w-48 rounded-xl overflow-hidden bg-white/65 backdrop-blur-md border border-[#111827]/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
      <button
        onMouseDown={onEdit}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-[#111827]/5 transition-colors text-left"
      >
        <MdEdit size={14} className="text-[#D4AF37]" />
        <span className="text-[#111827]/60">Edit Driver</span>
      </button>

      <button
        onMouseDown={onView}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-[#111827]/5 transition-colors text-left"
      >
        <MdVisibility size={14} className="text-[#D4AF37]" />
        <span className="text-[#111827]/60">View Details</span>
      </button>

      <button
        onMouseDown={onToggleStatus}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-[#111827]/5 transition-colors text-left"
      >
        {isSuspended ? (
          <>
            <MdCheckCircle size={14} className="text-[#D4AF37]" />
            <span className="text-[#111827]/60">Activate Driver</span>
          </>
        ) : (
          <>
            <MdBlock size={14} className="text-amber-400" />
            <span className="text-[#111827]/60">Suspend Driver</span>
          </>
        )}
      </button>

      <div className="h-px bg-[#111827]/6 my-0.5" />

      <button
        onMouseDown={onDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-red-500/8 transition-colors text-left"
      >
        <MdDelete size={14} className="text-red-400" />
        <span className="text-red-400">Delete Driver</span>
      </button>
    </div>
  );
}



