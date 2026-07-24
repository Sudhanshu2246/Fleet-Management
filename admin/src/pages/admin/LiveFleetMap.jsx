import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MdSearch, MdFilterList } from "react-icons/md";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Default Leaflet Icons (Vite/Webpack issue) ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom Icons based on status
const createIcon = (color) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const ICONS = {
  active: createIcon("#D4AF37"), // Gold
  idle: createIcon("#f59e0b"),   // Amber
  offline: createIcon("#ef4444"), // Red
};

// ── Mock Data ──
const MOCK_VEHICLES = [
  { id: "VH-4821", driver: "John Smith", lat: 40.7128, lng: -74.0060, speed: 62, battery: 87, status: "active" },
  { id: "VH-0071", driver: "Priya Kumar", lat: 40.7200, lng: -73.9900, speed: 0, battery: 45, status: "idle" },
  { id: "DEV-093", driver: "Ali Hassan", lat: 40.7350, lng: -73.9850, speed: 0, battery: 9, status: "offline" },
  { id: "VH-3310", driver: "Sara Lee", lat: 40.7050, lng: -74.0150, speed: 94, battery: 72, status: "active" },
  { id: "VH-2200", driver: "Carlos M.", lat: 40.7300, lng: -74.0000, speed: 28, battery: 61, status: "active" },
  { id: "VH-5501", driver: "Anna Doe", lat: 40.7150, lng: -73.9700, speed: 45, battery: 90, status: "active" },
];

export default function LiveFleetMap() {
  const [vehicles] = useState(MOCK_VEHICLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = vehicles.filter(v => v.status === "active").length;
  const idleCount = vehicles.filter(v => v.status === "idle").length;
  const offlineCount = vehicles.filter(v => v.status === "offline").length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F0F4F8] px-6 py-6 flex flex-col">
      {/* ── Page Heading ────────────────────────────────────────────────── */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">Fleetiq</span>
          <span className="text-xs text-[#111827]/20">/</span>
          <span className="text-xs text-[#111827]/40">Live Fleet Map</span>
        </nav>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight leading-tight">
            Live Fleet Map
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
              </span>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard label="Active Vehicles" value={activeCount} color="#D4AF37" icon="📡" />
        <StatCard label="Idle Vehicles" value={idleCount} color="#f59e0b" icon="⏸️" />
        <StatCard label="Offline Vehicles" value={offlineCount} color="#ef4444" icon="🔴" />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 p-3 rounded-xl border border-[#111827]/6 bg-white/65 backdrop-blur-md">
        <div className="relative w-full sm:w-64">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111827]/40" size={18} />
          <input
            type="text"
            placeholder="Search by ID or Driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent border border-[#111827]/10 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#111827]"
          />
        </div>
        
        <div className="relative w-full sm:w-48">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111827]/40" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-transparent border border-[#111827]/10 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#111827] appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="idle">Idle</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* ── Map Container ────────────────────────────────────────────────── */}
      <div className="flex-1 rounded-xl border border-[#111827]/6 overflow-hidden bg-white/65 shadow-sm min-h-[500px] relative z-0">
        <MapContainer 
          center={[40.7128, -74.0060]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
        >
          {/* Using CartoDB Positron for a cleaner, modern look that fits our theme */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredVehicles.map(v => (
            <Marker 
              key={v.id} 
              position={[v.lat, v.lng]} 
              icon={ICONS[v.status]}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <div className="font-black text-[#111827] text-sm mb-1">{v.id}</div>
                  <div className="text-xs text-[#111827]/70 mb-2">Driver: <span className="font-semibold text-[#111827]">{v.driver}</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[#111827]/50">Speed</span>
                      <span className="font-mono text-[#111827] font-semibold">{v.speed} km/h</span>
                    </div>
                    <div>
                      <span className="block text-[#111827]/50">Battery</span>
                      <span className="font-mono font-semibold" style={{ color: v.battery < 20 ? "#ef4444" : "#111827" }}>
                        {v.battery}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                      ${v.status === 'active' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 
                        v.status === 'idle' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'}
                    `}>
                      {v.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

/* ── Stat Card Component ──────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon }) {
  return (
    <div
      className="group relative rounded-xl p-4 border border-[#111827]/6 bg-white/65 backdrop-blur-md transition-all duration-200 overflow-hidden"
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base border"
          style={{ background: `${color}1A`, borderColor: `${color}40` }}
        >
          {icon}
        </div>
      </div>
      <div className="text-[22px] font-black text-[#111827] leading-none mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] text-[#111827]/40 mb-1 font-semibold">{label}</div>
    </div>
  );
}
