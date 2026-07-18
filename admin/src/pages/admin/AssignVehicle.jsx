import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAssignedVehicles, assignVehicle } from "../../Redux/Thunks/vehicle.thunks";
import { getDrivers } from "../../Redux/Thunks/driver.thunks";
import {
  MdAdd,
  MdSearch,
  MdMoreVert,
  MdDelete,
  MdClose,
  MdDirectionsCar,
  MdLocationOn,
  MdPerson,
  MdDownload,
  MdLocalShipping,
  MdCalendarToday,
  MdAssignment,
  MdVisibility,
  MdEdit,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Pagination from "../../shared/Pagination";
import AddAssignmentModal from "../../modals/AddAssignmentModal";
import AssignmentDetailsModal from "../../modals/AssignmentDetailsModal";

const STATUS_MAP = {
  active:    { label: "Active",    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20" },
  completed: { label: "Completed", badgeCls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  scheduled: { label: "Scheduled", badgeCls: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
};

export default function AssignVehicle() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const dispatch = useDispatch();
  const { assignments = [], loading } = useSelector((state) => state.vehicle);
  const { drivers = [] } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(getAssignedVehicles());
    dispatch(getDrivers());
  }, [dispatch]);

  const mappedAssignments = assignments.map(a => ({
    id: `ASG-${a.id}`,
    vehicleType: a.Vehicle?.type || "unknown",
    vehicleNumber: a.Vehicle?.vehicleNumber || "N/A",
    tripFrom: a.tripFrom || "-",
    tripTo: a.tripTo || "-",
    tripStartDate: a.tripStartDate || a.createdAt,
    driverName: a.User ? `${a.User.firstName} ${a.User.lastName}` : "Unknown",
    driverPhone: a.User?.phone || "N/A",
    coDriverName: a.coDriverName || "-",
    coDriverPhone: a.coDriverPhone || "-",
    status: a.status || "active",
  }));

  /* ── Filter & Pagination ─────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = mappedAssignments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.vehicleNumber.toLowerCase().includes(q) ||
      a.driverName.toLowerCase().includes(q) ||
      a.tripFrom.toLowerCase().includes(q) ||
      a.tripTo.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ── Counts ─────────────────────────────────────────────────────────── */
  const counts = {
    total: filtered.length,
    active: filtered.filter((a) => a.status === "active").length,
    scheduled: filtered.filter((a) => a.status === "scheduled").length,
  };

  const statCards = [
    { label: "Total Assignments", value: counts.total, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10", border: "border-[#D4AF37]/25", icon: MdAssignment },
    { label: "Active Trips", value: counts.active, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/25", icon: MdDirectionsCar },
    { label: "Scheduled", value: counts.scheduled, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/25", icon: MdCalendarToday },
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
          <span className="text-xs text-[#111827]/40">Assign Vehicle</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Assign Vehicle</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/80 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all">
              <MdDownload size={14} /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-shadow"
            >
              <MdAdd size={15} /> New Assignment
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative rounded-xl p-4 border border-[#111827]/6 bg-white/65 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
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
      <div className="rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 px-3 rounded-lg bg-[#111827]/5 border border-[#111827]/8 focus-within:border-[#D4AF37]/40 transition-all">
          <MdSearch size={15} className="text-[#111827]/30 shrink-0" />
          <input
            type="text"
            placeholder="Search vehicle, driver, route..."
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
          {["all", "active", "scheduled", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-[#D4AF37] text-white shadow-sm"
                  : "text-[#111827]/35 hover:text-[#111827]/60"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Assignments Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#111827]/6">
                <th className="px-5 py-4 text-left text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Assignment ID</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Vehicle</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Route</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Driver</th>
                <th className="px-5 py-4 text-left text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Status</th>
                <th className="px-5 py-4 text-center text-[10px] font-bold text-[#111827]/40 uppercase tracking-widest bg-[#111827]/[0.02]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((a) => (
                <tr key={a.id} className="border-b border-[#111827]/6 hover:bg-[#111827]/[0.02] transition-colors group">
                  <td className="px-5 py-4 align-middle">
                    <p className="text-xs font-bold text-[#111827]">{a.id}</p>
                    <p className="text-[10px] text-[#111827]/40 mt-0.5">{new Date(a.tripStartDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0 border border-[#D4AF37]/20">
                        <MdLocalShipping size={14} className="text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">{a.vehicleNumber}</p>
                        <p className="text-[10px] text-[#111827]/40 capitalize mt-0.5">{a.vehicleType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <p className="text-xs font-semibold text-[#111827]/70 flex items-center gap-1.5">
                      <MdLocationOn size={14} className="text-[#D4AF37]" />
                      {a.tripFrom} <span className="text-[#111827]/30 mx-1">→</span> {a.tripTo}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111827]/5 border border-[#111827]/10 flex items-center justify-center text-[10px] font-bold text-[#111827]/60">
                        {a.driverName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">{a.driverName}</p>
                        <p className="text-[10px] text-[#111827]/40 mt-0.5">{a.driverPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide capitalize ${STATUS_MAP[a.status]?.badgeCls}`}>
                      {STATUS_MAP[a.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle text-center">
                    <button id={`action-btn-${a.id}`} className="hidden" />
                    <ActionMenu assignment={a} onView={() => setSelectedAssignment(a)} />
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-[#111827]/40">No assignments found.</p>
                  </td>
                </tr>
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddAssignmentModal
            drivers={drivers}
            onClose={() => setShowAddModal(false)}
            onSave={async (data) => {
              const res = await dispatch(assignVehicle(data));
              if (res.meta.requestStatus === "fulfilled") {
                setShowAddModal(false);
                toast.success("Vehicle assigned successfully!");
                dispatch(getAssignedVehicles()); // refresh list
              } else {
                toast.error(res.payload?.message || "Failed to assign vehicle");
              }
            }}
          />
        )}
        {selectedAssignment && (
          <AssignmentDetailsModal 
            assignment={selectedAssignment}
            onClose={() => setSelectedAssignment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function ActionMenu({ assignment, onView }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (menuRef.current) {
      const buttonRect = menuRef.current.getBoundingClientRect();
      setRect(buttonRect);
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const menuWidth = 144; // w-36 = 9rem = 144px
  const topPos = rect ? rect.bottom + 4 : 0;
  const leftPos = rect ? rect.right - menuWidth : 0;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto hover:bg-[#111827]/5 text-[#111827]/40 hover:text-[#111827] transition-colors cursor-pointer"
      >
        <MdMoreVert size={18} />
      </button>
      {open && rect && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ top: topPos, left: leftPos }}
            className="fixed w-36 bg-white border border-[#111827]/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden py-1 z-[60]"
          >
            <button 
              onClick={() => {
                setOpen(false);
                if (onView) onView();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] transition-colors cursor-pointer"
            >
              <MdVisibility size={14} className="text-[#D4AF37]" /> See Details
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] transition-colors cursor-pointer">
              <MdLocationOn size={14} className="text-[#D4AF37]" /> Track Trip
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#111827]/70 hover:bg-[#111827]/5 hover:text-[#111827] transition-colors cursor-pointer">
              <MdEdit size={14} className="text-[#111827]/50" /> Edit Trip
            </button>
            <div className="h-px bg-[#111827]/5 my-1" />
            <button className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
              <MdDelete size={14} className="text-red-400" /> Delete
            </button>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}


