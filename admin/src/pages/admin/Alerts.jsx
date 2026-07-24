import { useState } from "react";
import { 
  MdWarning, 
  MdGpsOff, 
  MdBatteryAlert, 
  MdCheckCircle,
  MdSearch,
  MdFilterList,
  MdNotificationsActive
} from "react-icons/md";
import CustomDropdown from "../../shared/CustomDropdown";
import Pagination from "../../shared/Pagination";

const ALERTS_DATA = [
  {
    id: 1,
    type: "sos",
    title: "SOS Alert",
    message: "Vehicle VH-4821 triggered SOS — Chennai Highway",
    time: "2m ago",
    date: "2026-07-14",
    status: "Active",
    priority: "High",
    colorCls: "text-[#FF5C5C]",
    bgCls: "bg-[#FF5C5C]/10 border-[#FF5C5C]/20",
    icon: MdWarning,
  },
  {
    id: 2,
    type: "geofence",
    title: "Geofence Exit",
    message: "Driver UID-2291 exited Zone B perimeter",
    time: "8m ago",
    date: "2026-07-14",
    status: "Active",
    priority: "Medium",
    colorCls: "text-amber-500",
    bgCls: "bg-amber-500/10 border-amber-500/20",
    icon: MdGpsOff,
  },
  {
    id: 3,
    type: "battery",
    title: "Low Battery",
    message: "Device DEV-0093 battery at 9% — may go offline",
    time: "14m ago",
    date: "2026-07-14",
    status: "Active",
    priority: "Medium",
    colorCls: "text-amber-500",
    bgCls: "bg-amber-500/10 border-amber-500/20",
    icon: MdBatteryAlert,
  },
  {
    id: 4,
    type: "system",
    title: "System Healthy",
    message: "All 4 microservices running. WebSocket latency 48ms",
    time: "1h ago",
    date: "2026-07-14",
    status: "Resolved",
    priority: "Low",
    colorCls: "text-[#D4AF37]",
    bgCls: "bg-[#D4AF37]/10 border-[#D4AF37]/20",
    icon: MdCheckCircle,
  },
  {
    id: 5,
    type: "speed",
    title: "Overspeeding",
    message: "Vehicle VH-3310 exceeded 80km/h limit (92km/h)",
    time: "3h ago",
    date: "2026-07-14",
    status: "Resolved",
    priority: "High",
    colorCls: "text-[#FF5C5C]",
    bgCls: "bg-[#FF5C5C]/10 border-[#FF5C5C]/20",
    icon: MdWarning,
  }
];

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredAlerts = ALERTS_DATA.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || alert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] px-6 py-6">
      {/* ── Page Heading ────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">Fleetiq</span>
            <span className="text-xs text-[#111827]/20">/</span>
            <span className="text-xs text-[#111827]/40">Alerts Dashboard</span>
          </nav>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight leading-tight">
            System Alerts & Notifications
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37] transition-colors w-64 text-[#111827]"
            />
          </div>
          
          <div className="relative w-44 h-10">
            <CustomDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              icon={MdFilterList}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Resolved", value: "Resolved" }
              ]}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]/60 mb-1">Total Alerts</p>
            <h3 className="text-2xl font-black text-[#111827]">{ALERTS_DATA.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#111827]/5 flex items-center justify-center">
            <MdFilterList className="text-[#111827]/50" size={24} />
          </div>
        </div>

        <div className="bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]/60 mb-1">Active Alerts</p>
            <h3 className="text-2xl font-black text-[#111827]">{ALERTS_DATA.filter(a => a.status === 'Active').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 flex items-center justify-center">
            <MdNotificationsActive className="text-[#FF5C5C]" size={24} />
          </div>
        </div>

        <div className="bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]/60 mb-1">High Priority</p>
            <h3 className="text-2xl font-black text-[#111827]">{ALERTS_DATA.filter(a => a.priority === 'High').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <MdWarning className="text-amber-500" size={24} />
          </div>
        </div>

        <div className="bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]/60 mb-1">Resolved (24h)</p>
            <h3 className="text-2xl font-black text-[#111827]">{ALERTS_DATA.filter(a => a.status === 'Resolved').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <MdCheckCircle className="text-[#D4AF37]" size={24} />
          </div>
        </div>
      </div>

      {/* ── Alerts List ─────────────────────────────────────────────── */}
      <div className="bg-white/65 backdrop-blur-md border border-[#111827]/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111827]/5 border-b border-[#111827]/10">
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider">Alert Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#111827]/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111827]/5">
              {paginatedData.length > 0 ? (
                paginatedData.map(alert => (
                  <tr key={alert.id} className="hover:bg-[#111827]/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.bgCls} border`}>
                          {(() => {
                            const AlertIcon = alert.icon;
                            return <AlertIcon className={alert.colorCls} size={20} />;
                          })()}
                        </div>
                        <span className="text-sm font-bold text-[#111827]">{alert.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#111827]/70 max-w-md truncate" title={alert.message}>
                        {alert.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111827]">{alert.time}</span>
                        <span className="text-xs text-[#111827]/50">{alert.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        alert.priority === 'High' 
                          ? 'bg-[#FF5C5C]/10 text-[#FF5C5C] border-[#FF5C5C]/20' 
                          : alert.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                      }`}>
                        {alert.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${alert.status === 'Active' ? 'bg-[#FF5C5C]' : 'bg-[#D4AF37]'}`} />
                        <span className="text-sm font-medium text-[#111827]">{alert.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-xs font-bold text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors mr-3">
                        View Details
                      </button>
                      {alert.status === 'Active' && (
                        <button className="text-xs font-bold text-[#111827]/50 hover:text-[#111827] transition-colors">
                          Dismiss
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#111827]/50 text-sm">
                    No alerts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAlerts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
