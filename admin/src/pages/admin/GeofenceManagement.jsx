import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Circle,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MdRadar,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
  MdWarning,
  MdSpeed,
  MdTimer,
  MdEdit,
  MdDelete,
  MdDirectionsCar,
  MdRefresh,
  MdLayers,
  MdFullscreen,
  MdFullscreenExit,
  MdClose,
  MdCheck,
  MdMyLocation,
  MdNotificationsActive,
  MdPlayArrow,
  MdShield,
  MdInfo,
  MdLocationOn,
} from "react-icons/md";
import { toast } from "sonner";
import api from "../../api/axios";
import { MAP_LAYERS, createDriverIcon } from "../../utils/mapUtils";
import { addFirestoreAlert } from "../../config/firebase";

// ── Default Geofences Fallback (Delhi Logistics Corridor) ─────────────────────
const INITIAL_GEOFENCES = [
  {
    id: 1,
    geofenceId: "GEO-101",
    name: "Okhla Central Logistics Depot",
    code: "OKH-HUB-01",
    description: "Primary regional warehousing, freight staging, and automated loading terminal",
    category: "depot",
    type: "circle",
    centerLat: 28.5355,
    centerLng: 77.2732,
    radius: 750,
    coordinates: null,
    color: "#10B981", // Emerald
    status: "active",
    alertOnEntry: true,
    alertOnExit: true,
    speedLimit: 25,
    dwellLimitMinutes: 120,
    assignedVehicles: ["*"],
    insideVehicles: ["VH-4821", "VH-7740"],
  },
  {
    id: 2,
    geofenceId: "GEO-102",
    name: "Connaught Place Strict Urban Zone",
    code: "CP-REST-02",
    description: "High-congestion inner circle commercial zone with restricted commercial vehicle access (10 AM - 8 PM)",
    category: "restricted",
    type: "polygon",
    centerLat: 28.6304,
    centerLng: 77.2177,
    radius: null,
    coordinates: [
      [28.6345, 77.2140],
      [28.6340, 77.2230],
      [28.6275, 77.2225],
      [28.6270, 77.2135],
    ],
    color: "#F43F5E", // Rose
    status: "active",
    alertOnEntry: true,
    alertOnExit: false,
    speedLimit: 30,
    dwellLimitMinutes: 15,
    assignedVehicles: ["*"],
    insideVehicles: ["VH-3310"],
  },
  {
    id: 3,
    geofenceId: "GEO-103",
    name: "Noida Sector 62 Delivery Cluster",
    code: "NOI-HUB-03",
    description: "High-density enterprise client deliveries, courier drop points, and quick transit lanes",
    category: "client_site",
    type: "circle",
    centerLat: 28.6280,
    centerLng: 77.3670,
    radius: 900,
    coordinates: null,
    color: "#D4AF37", // Gold
    status: "active",
    alertOnEntry: true,
    alertOnExit: true,
    speedLimit: 40,
    dwellLimitMinutes: 45,
    assignedVehicles: ["VH-1092", "VH-2104"],
    insideVehicles: ["VH-1092"],
  },
  {
    id: 4,
    geofenceId: "GEO-104",
    name: "NH-44 Express Freight Corridor",
    code: "NH44-COR-04",
    description: "Designated high-speed heavy truck transit corridor connecting Delhi to Agra logistics bypass",
    category: "corridor",
    type: "polygon",
    centerLat: 28.4800,
    centerLng: 77.3100,
    radius: null,
    coordinates: [
      [28.5100, 77.2950],
      [28.5150, 77.3080],
      [28.4450, 77.3350],
      [28.4400, 77.3200],
    ],
    color: "#3B82F6", // Blue
    status: "active",
    alertOnEntry: false,
    alertOnExit: true,
    speedLimit: 80,
    dwellLimitMinutes: 90,
    assignedVehicles: ["*"],
    insideVehicles: [],
  },
];

// ── Sample Live Vehicles Plotted on Map ──────────────────────────────────────
const LIVE_FLEET_VEHICLES = [
  {
    vehicleId: "VH-4821",
    driverName: "Vikram Malhotra",
    driverId: 103,
    lat: 28.5365,
    lng: 77.2740,
    speed: 18,
    status: "active",
    insideZone: "OKH-HUB-01",
  },
  {
    vehicleId: "VH-3310",
    driverName: "Rahul Sharma",
    driverId: 104,
    lat: 28.6310,
    lng: 77.2185,
    speed: 34,
    status: "active",
    insideZone: "CP-REST-02", // In restricted zone!
  },
  {
    vehicleId: "VH-1092",
    driverName: "Amit Kumar",
    driverId: 105,
    lat: 28.6275,
    lng: 77.3665,
    speed: 0,
    status: "idle",
    insideZone: "NOI-HUB-03",
  },
  {
    vehicleId: "VH-7740",
    driverName: "Suresh Raina",
    driverId: 107,
    lat: 28.5348,
    lng: 77.2715,
    speed: 22,
    status: "active",
    insideZone: "OKH-HUB-01",
  },
  {
    vehicleId: "VH-2104",
    driverName: "Priya Patel",
    driverId: 106,
    lat: 28.5750,
    lng: 77.3200,
    speed: 56,
    status: "active",
    insideZone: null, // In transit outside zones
  },
];

// Color palette options for custom geofences
const COLOR_PRESETS = [
  { label: "Emerald Safe", value: "#10B981" },
  { label: "Crimson Restricted", value: "#F43F5E" },
  { label: "Fleet Gold", value: "#D4AF37" },
  { label: "Cyber Blue", value: "#3B82F6" },
  { label: "Electric Violet", value: "#8B5CF6" },
  { label: "Amber Warning", value: "#F59E0B" },
];

// ── Leaflet Helper: Center Map on Selected Geofence ─────────────────────────
function MapFlyController({ targetGeofence }) {
  const map = useMap();
  useEffect(() => {
    if (!targetGeofence) return;
    if (targetGeofence.centerLat && targetGeofence.centerLng) {
      map.flyTo([targetGeofence.centerLat, targetGeofence.centerLng], 14, {
        duration: 1.2,
      });
    }
  }, [targetGeofence, map]);
  return null;
}

// ── Leaflet Helper: Interactive Click Handler for Drawing Mode ──────────────
function MapDrawHandler({ drawingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (drawingMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function GeofenceManagement() {
  const navigate = useNavigate();

  // ── States ────────────────────────────────────────────────────────────────
  const [geofences, setGeofences] = useState(INITIAL_GEOFENCES);
  const [selectedGeofence, setSelectedGeofence] = useState(INITIAL_GEOFENCES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTileLayer, setActiveTileLayer] = useState("googleStreets");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drawing State
  // drawingMode: null | "circle" | "polygon"
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawCenter, setDrawCenter] = useState(null); // { lat, lng }
  const [drawRadius, setDrawRadius] = useState(500); // meters
  const [drawPolygonPoints, setDrawPolygonPoints] = useState([]); // [[lat, lng], ...]

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState(null);

  const mapContainerRef = useRef(null);

  // ── 1. Fetch Geofences from Backend ───────────────────────────────────────
  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const res = await api.get("/geofences");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setGeofences(res.data.data);
        if (!selectedGeofence) {
          setSelectedGeofence(res.data.data[0]);
        }
      }
    } catch (err) {
      console.warn("⚠️ [Geofences] Using local initial geofences:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  // ── 2. Filter Geofences ───────────────────────────────────────────────────
  const filteredGeofences = useMemo(() => {
    return geofences.filter((g) => {
      const matchesSearch =
        (g.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || (g.category || "").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [geofences, searchQuery, selectedCategory]);

  // ── 3. Calculate Key Metrics ──────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = geofences.length;
    const active = geofences.filter((g) => g.status === "active").length;
    let vehiclesInside = 0;
    geofences.forEach((g) => {
      vehiclesInside += (g.insideVehicles || []).length;
    });
    const restrictedCount = geofences.filter((g) => g.category === "restricted").length;

    return { total, active, vehiclesInside, restrictedCount };
  }, [geofences]);

  // ── 4. Drawing Mode Event Handlers ────────────────────────────────────────
  const handleMapClick = (latlng) => {
    if (drawingMode === "circle") {
      setDrawCenter({ lat: latlng.lat, lng: latlng.lng });
      toast.info("Center Set", {
        description: `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}. Adjust radius on HUD.`,
      });
    } else if (drawingMode === "polygon") {
      setDrawPolygonPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
    }
  };

  const handleStartDrawCircle = () => {
    setDrawingMode("circle");
    setDrawCenter({ lat: 28.5355, lng: 77.3910 });
    setDrawRadius(600);
    toast("📍 Circle Draw Mode Active", {
      description: "Click on the map to place zone center, then adjust the radius slider.",
    });
  };

  const handleStartDrawPolygon = () => {
    setDrawingMode("polygon");
    setDrawPolygonPoints([]);
    toast("📐 Polygon Draw Mode Active", {
      description: "Click on map points to outline the perimeter boundary (min 3 points).",
    });
  };

  const handleCancelDrawing = () => {
    setDrawingMode(null);
    setDrawCenter(null);
    setDrawPolygonPoints([]);
  };

  const handleProceedToCreateWithDrawing = () => {
    if (drawingMode === "circle" && !drawCenter) {
      toast.error("Please click on the map to set a circle center point first.");
      return;
    }
    if (drawingMode === "polygon" && drawPolygonPoints.length < 3) {
      toast.error("A polygon perimeter requires at least 3 vertices.");
      return;
    }

    setEditingGeofence(null);
    setIsCreateModalOpen(true);
  };

  // ── 5. Quick Toggle Active/Inactive Status ─────────────────────────────────
  const handleToggleStatus = async (geo, e) => {
    e.stopPropagation();
    const newStatus = geo.status === "active" ? "inactive" : "active";
    try {
      setGeofences((prev) =>
        prev.map((g) => (g.id === geo.id ? { ...g, status: newStatus } : g))
      );
      if (selectedGeofence?.id === geo.id) {
        setSelectedGeofence((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Geofence ${newStatus === "active" ? "Activated" : "Deactivated"}`, {
        description: `${geo.name} monitoring is now ${newStatus}.`,
      });
      await api.put(`/geofences/${geo.id}`, { status: newStatus });
    } catch (err) {
      // optimistic state kept
    }
  };

  // ── 6. Delete Geofence ────────────────────────────────────────────────────
  const handleDeleteGeofence = async (geoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this geofence zone?")) return;

    try {
      setGeofences((prev) => prev.filter((g) => g.id !== geoId));
      if (selectedGeofence?.id === geoId) {
        setSelectedGeofence(geofences.find((g) => g.id !== geoId) || null);
      }
      toast.success("Geofence Zone Deleted");
      await api.delete(`/geofences/${geoId}`);
    } catch (err) {
      // already removed optimistically
    }
  };

  // ── 7. Toggle Fullscreen ──────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current) {
        mapContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#0B0F19] text-white">
      {/* ── 1. Top Header & Metrics Bar ───────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-[#111827]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
            <MdRadar size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white m-0">
                Geofence Intelligence & Perimeter Security
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ● Live Perimeter Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              Interactive boundaries, automated corridor breach alarms, and zone telematics
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
            title="Simulate vehicle crossing zone to test Firebase alert"
          >
            <MdPlayArrow size={16} />
            <span>Test Breach Simulation</span>
          </button>

          <div className="relative group">
            <button
              onClick={() => {
                if (drawingMode) {
                  handleCancelDrawing();
                } else {
                  handleStartDrawCircle();
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                drawingMode
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                  : "bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0B0F19] hover:opacity-95 shadow-[#D4AF37]/20"
              }`}
            >
              {drawingMode ? <MdClose size={16} /> : <MdAdd size={16} />}
              <span>{drawingMode ? "Cancel Drawing" : "+ New Geofence"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Key Telematics KPI Metric Counters ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-3 border-b border-slate-800/60 bg-[#0E1526]/60 shrink-0">
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MdRadar size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Geofences
            </span>
            <span className="text-base font-black text-white">{metrics.total} Defined</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MdCheckCircle size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Monitoring
            </span>
            <span className="text-base font-black text-emerald-400">{metrics.active} Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <MdDirectionsCar size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Vehicles In-Zone
            </span>
            <span className="text-base font-black text-white">{metrics.vehiclesInside} Occupants</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <MdShield size={16} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Restricted Zones
            </span>
            <span className="text-base font-black text-rose-400">{metrics.restrictedCount} Guarded</span>
          </div>
        </div>
      </div>

      {/* ── 3. Split Command View: Zone Directory (Left) + Interactive Map (Right) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ── Left Sidebar: Zone Directory ─────────────────────────────────── */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#111827]/95 flex flex-col shrink-0 z-10">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search zones, codes, depots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <MdClose size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[
                { id: "all", label: "All Zones" },
                { id: "depot", label: "Depots" },
                { id: "client_site", label: "Delivery" },
                { id: "restricted", label: "Restricted" },
                { id: "corridor", label: "Corridors" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? "bg-[#D4AF37] text-[#0B0F19] shadow-sm shadow-[#D4AF37]/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Geofence Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 [scrollbar-width:thin]">
            {filteredGeofences.length > 0 ? (
              filteredGeofences.map((geo) => {
                const isSelected = selectedGeofence?.id === geo.id;
                const occupantCount = (geo.insideVehicles || []).length;
                const isRestricted = geo.category === "restricted";

                return (
                  <div
                    key={geo.id}
                    onClick={() => setSelectedGeofence(geo)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-slate-800/90 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: geo.color || "#10B981" }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {geo.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {geo.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleStatus(geo, e)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            geo.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {geo.status === "active" ? "Active" : "Disabled"}
                        </button>
                      </div>
                    </div>

                    {/* Geofence Name */}
                    <h3 className="text-sm font-bold text-white mb-1 leading-snug">
                      {geo.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2.5 m-0">
                      {geo.description || "Designated logistics management boundary"}
                    </p>

                    {/* Rules Pill Summary */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                        <MdSpeed size={12} className="text-[#D4AF37]" />
                        <span>Max {geo.speedLimit || 40} km/h</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                        {geo.type === "circle"
                          ? `⭕ Circle (${geo.radius || 500}m)`
                          : `📐 Polygon (${geo.coordinates?.length || 4} pts)`}
                      </span>

                      {occupantCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{occupantCount} Vehicles Inside</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGeofence(geo);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
                      >
                        Details & Vehicles →
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGeofence(geo);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                          title="Edit Zone"
                        >
                          <MdEdit size={13} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteGeofence(geo.id, e)}
                          className="p-1 rounded-md text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
                          title="Delete Zone"
                        >
                          <MdDelete size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No geofences match your search or filter.
              </div>
            )}
          </div>
        </div>

        {/* ── Main Map Canvas ─────────────────────────────────────────────── */}
        <div ref={mapContainerRef} className="flex-1 relative bg-[#090D16]">
          {/* Floating Map Controls HUD */}
          <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2">
            {/* Tile Layer Selector */}
            <div className="flex items-center p-1 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-slate-700/80 shadow-xl">
              {[
                { id: "googleStreets", label: "Google Roadmap" },
                { id: "googleHybrid", label: "Satellite" },
                { id: "dark", label: "Dark Mode" },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveTileLayer(layer.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTileLayer === layer.id
                      ? "bg-[#D4AF37] text-[#0B0F19] shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Fullscreen & Reset View */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-[#111827]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white shadow-xl cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
              >
                {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
              </button>
            </div>
          </div>

          {/* Interactive Drawing Mode Floating Banner */}
          {drawingMode && (
            <div className="absolute top-4 left-4 z-[999] max-w-md p-4 rounded-2xl bg-[#111827]/95 backdrop-blur-xl border border-[#D4AF37] shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {drawingMode === "circle" ? "Circle Drawing Mode" : "Polygon Perimeter Mode"}
                  </span>
                </div>
                <button onClick={handleCancelDrawing} className="text-slate-400 hover:text-white">
                  <MdClose size={16} />
                </button>
              </div>

              {drawingMode === "circle" ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 m-0">
                    Click anywhere on the map to place center. Drag the radius slider below.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">Radius:</span>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="50"
                      value={drawRadius}
                      onChange={(e) => setDrawRadius(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#D4AF37] cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-[#D4AF37] w-16 text-right">
                      {drawRadius >= 1000 ? `${(drawRadius / 1000).toFixed(2)} km` : `${drawRadius} m`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 m-0">
                    Click successive boundary points on the map.
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Vertices Placed:</span>
                    <span className="text-[#D4AF37] font-bold">{drawPolygonPoints.length} points</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleCancelDrawing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToCreateWithDrawing}
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#D4AF37] text-[#0B0F19] hover:opacity-95 shadow-md shadow-[#D4AF37]/20"
                >
                  Configure & Save Zone →
                </button>
              </div>
            </div>
          )}

          {/* Leaflet Map Canvas */}
          <MapContainer
            center={[28.5900, 77.2900]}
            zoom={12}
            className="w-full h-full"
            zoomControl={false}
          >
            {/* Active Tile Layer */}
            <TileLayer
              key={activeTileLayer}
              url={MAP_LAYERS[activeTileLayer].url}
              attribution={MAP_LAYERS[activeTileLayer].attribution}
              subdomains={MAP_LAYERS[activeTileLayer].subdomains || []}
              className={MAP_LAYERS[activeTileLayer].className || ""}
            />

            {/* Fly to Selected Geofence on change */}
            <MapFlyController targetGeofence={selectedGeofence} />

            {/* Click Handler for Drawing Mode */}
            <MapDrawHandler drawingMode={drawingMode} onMapClick={handleMapClick} />

            {/* ── Render Defined Geofences on Map ─────────────────────────── */}
            {geofences.map((geo) => {
              const isSelected = selectedGeofence?.id === geo.id;
              const color = geo.color || "#10B981";

              if (geo.type === "circle" && geo.centerLat && geo.centerLng) {
                return (
                  <Circle
                    key={geo.id}
                    center={[geo.centerLat, geo.centerLng]}
                    radius={geo.radius || 500}
                    pathOptions={{
                      color: isSelected ? "#FFFFFF" : color,
                      weight: isSelected ? 3 : 2,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.35 : 0.2,
                      dashArray: geo.status === "inactive" ? "6, 6" : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedGeofence(geo),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="text-center font-bold text-xs p-1">
                        <div>{geo.name}</div>
                        <div className="text-[10px] opacity-80">
                          {geo.category.toUpperCase()} • Radius: {geo.radius}m
                        </div>
                      </div>
                    </Tooltip>
                  </Circle>
                );
              }

              if (geo.type === "polygon" && Array.isArray(geo.coordinates)) {
                return (
                  <Polygon
                    key={geo.id}
                    positions={geo.coordinates}
                    pathOptions={{
                      color: isSelected ? "#FFFFFF" : color,
                      weight: isSelected ? 3 : 2,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.35 : 0.2,
                      dashArray: geo.status === "inactive" ? "6, 6" : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedGeofence(geo),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="text-center font-bold text-xs p-1">
                        <div>{geo.name}</div>
                        <div className="text-[10px] opacity-80">
                          {geo.category.toUpperCase()} • Perimeter Zone
                        </div>
                      </div>
                    </Tooltip>
                  </Polygon>
                );
              }

              return null;
            })}

            {/* ── Render In-Progress Drawing Overlays ──────────────────────── */}
            {drawingMode === "circle" && drawCenter && (
              <Circle
                center={[drawCenter.lat, drawCenter.lng]}
                radius={drawRadius}
                pathOptions={{
                  color: "#D4AF37",
                  weight: 3,
                  fillColor: "#D4AF37",
                  fillOpacity: 0.3,
                  dashArray: "4, 4",
                }}
              />
            )}

            {drawingMode === "polygon" && drawPolygonPoints.length > 0 && (
              <>
                <Polygon
                  positions={drawPolygonPoints}
                  pathOptions={{
                    color: "#D4AF37",
                    weight: 3,
                    fillColor: "#D4AF37",
                    fillOpacity: 0.3,
                    dashArray: "4, 4",
                  }}
                />
                {drawPolygonPoints.map((pt, idx) => (
                  <Marker
                    key={idx}
                    position={pt}
                    icon={L.divIcon({
                      className: "custom-vertex-icon",
                      html: `<div style="width:12px;height:12px;background:#D4AF37;border:2px solid #000;border-radius:50%;"></div>`,
                      iconSize: [12, 12],
                      iconAnchor: [6, 6],
                    })}
                  />
                ))}
              </>
            )}

            {/* ── Render Live Vehicle Markers on Map ──────────────────────── */}
            {LIVE_FLEET_VEHICLES.map((veh) => {
              const icon = createDriverIcon(
                veh.status,
                false,
                veh.driverName
                  ? veh.driverName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "VH"
              );

              return (
                <Marker key={veh.vehicleId} position={[veh.lat, veh.lng]} icon={icon}>
                  <Popup>
                    <div className="p-2 text-slate-900 min-w-[200px]">
                      <div className="flex items-center justify-between font-bold text-xs mb-1">
                        <span>{veh.vehicleId}</span>
                        <span className="text-emerald-600 uppercase text-[10px]">{veh.status}</span>
                      </div>
                      <div className="text-xs text-slate-700 mb-1">
                        Driver: <b>{veh.driverName}</b>
                      </div>
                      <div className="text-xs text-slate-700 mb-1">
                        Speed: <b>{veh.speed} km/h</b>
                      </div>
                      <div className="text-[11px] text-slate-600 mb-2">
                        {veh.insideZone ? (
                          <span className="text-blue-600 font-bold">
                            📍 Inside Zone: {veh.insideZone}
                          </span>
                        ) : (
                          <span className="text-slate-500">In Transit Outside Zones</span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/fleet-map?driverId=${veh.driverId}`)}
                        className="w-full py-1 text-center text-xs font-bold bg-[#0B0F19] text-[#D4AF37] rounded-md hover:opacity-90"
                      >
                        Track in Live Fleet Map →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ── 4. Create / Edit Geofence Modal ───────────────────────────────── */}
      {isCreateModalOpen && (
        <CreateGeofenceModal
          editingGeofence={editingGeofence}
          initialShapeType={drawingMode || "circle"}
          initialCenter={drawCenter}
          initialRadius={drawRadius}
          initialPolygonPoints={drawPolygonPoints}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingGeofence(null);
            handleCancelDrawing();
          }}
          onSuccess={(newGeo) => {
            if (editingGeofence) {
              setGeofences((prev) =>
                prev.map((g) => (g.id === newGeo.id ? newGeo : g))
              );
              setSelectedGeofence(newGeo);
              toast.success("Geofence Zone Updated Successfully");
            } else {
              setGeofences((prev) => [newGeo, ...prev]);
              setSelectedGeofence(newGeo);
              toast.success("New Geofence Activated", {
                description: `${newGeo.name} perimeter is now live and monitored`,
              });
            }
            setIsCreateModalOpen(false);
            setEditingGeofence(null);
            handleCancelDrawing();
          }}
        />
      )}

      {/* ── 5. Breach Simulation Modal ────────────────────────────────────── */}
      {isSimulateModalOpen && (
        <BreachSimulationModal
          geofences={geofences}
          onClose={() => setIsSimulateModalOpen(false)}
        />
      )}

      {/* ── 6. Zone Full Details Drawer / Modal ────────────────────────────── */}
      {isDetailsModalOpen && selectedGeofence && (
        <GeofenceDetailsModal
          geofence={selectedGeofence}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setEditingGeofence(selectedGeofence);
            setIsCreateModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 CREATE / EDIT GEOFENCE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CreateGeofenceModal({
  editingGeofence,
  initialShapeType,
  initialCenter,
  initialRadius,
  initialPolygonPoints,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState(editingGeofence?.name || "");
  const [code, setCode] = useState(editingGeofence?.code || "");
  const [description, setDescription] = useState(editingGeofence?.description || "");
  const [category, setCategory] = useState(editingGeofence?.category || "depot");
  const [shapeType, setShapeType] = useState(editingGeofence?.type || initialShapeType || "circle");
  const [centerLat, setCenterLat] = useState(
    editingGeofence?.centerLat || initialCenter?.lat || 28.5355
  );
  const [centerLng, setCenterLng] = useState(
    editingGeofence?.centerLng || initialCenter?.lng || 77.2732
  );
  const [radius, setRadius] = useState(editingGeofence?.radius || initialRadius || 500);
  const [color, setColor] = useState(editingGeofence?.color || "#10B981");
  const [speedLimit, setSpeedLimit] = useState(editingGeofence?.speedLimit || 30);
  const [dwellLimit, setDwellLimit] = useState(editingGeofence?.dwellLimitMinutes || 60);
  const [alertOnEntry, setAlertOnEntry] = useState(editingGeofence?.alertOnEntry ?? true);
  const [alertOnExit, setAlertOnExit] = useState(editingGeofence?.alertOnExit ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a geofence zone name");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      code: code.trim() || `ZONE-${Date.now().toString().slice(-4)}`,
      description: description.trim(),
      category,
      type: shapeType,
      centerLat: parseFloat(centerLat),
      centerLng: parseFloat(centerLng),
      radius: shapeType === "circle" ? parseFloat(radius) : null,
      coordinates:
        shapeType === "polygon"
          ? editingGeofence?.coordinates || initialPolygonPoints || [
              [centerLat + 0.005, centerLng - 0.005],
              [centerLat + 0.005, centerLng + 0.005],
              [centerLat - 0.005, centerLng + 0.005],
              [centerLat - 0.005, centerLng - 0.005],
            ]
          : null,
      color,
      status: "active",
      speedLimit: parseInt(speedLimit, 10),
      dwellLimitMinutes: parseInt(dwellLimit, 10),
      alertOnEntry,
      alertOnExit,
      assignedVehicles: ["*"],
    };

    try {
      if (editingGeofence) {
        await api.put(`/geofences/${editingGeofence.id}`, payload);
        onSuccess({ ...editingGeofence, ...payload });
      } else {
        const res = await api.post("/geofences", payload);
        const savedGeo = res.data?.data || {
          id: Date.now(),
          geofenceId: `GEO-${Date.now().toString().slice(-4)}`,
          ...payload,
        };
        onSuccess(savedGeo);
      }
    } catch (err) {
      // Fallback local persistence
      const fallbackGeo = {
        id: editingGeofence?.id || Date.now(),
        geofenceId: editingGeofence?.geofenceId || `GEO-${Date.now().toString().slice(-4)}`,
        ...payload,
      };
      onSuccess(fallbackGeo);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md" />

      <div className="relative w-full max-w-xl bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <MdRadar size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white m-0">
                  {editingGeofence ? "Configure Geofence Zone" : "Activate New Geofence Zone"}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Define perimeter boundaries and telematics alerts
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <MdClose size={16} />
            </button>
          </div>

          {/* Form Scrollable Content */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 [scrollbar-width:thin]">
            {/* Zone Name & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okhla Central Freight Hub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Zone Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. OKH-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Zone Classification
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: "depot", label: "🏢 Depot / Hub", color: "#10B981" },
                  { id: "client_site", label: "📦 Delivery Hub", color: "#D4AF37" },
                  { id: "restricted", label: "🚫 Restricted Zone", color: "#F43F5E" },
                  { id: "corridor", label: "🛣️ Transit Corridor", color: "#3B82F6" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setColor(cat.color);
                    }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      category === cat.id
                        ? "bg-slate-800 border-[#D4AF37] text-white shadow-sm"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Geometry Details */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MdLocationOn size={16} className="text-[#D4AF37]" />
                  <span>Geographic Boundary ({shapeType.toUpperCase()})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Lat: {Number(centerLat).toFixed(4)}, Lng: {Number(centerLng).toFixed(4)}
                </span>
              </div>

              {shapeType === "circle" ? (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Radius Boundary:</span>
                    <span className="text-[#D4AF37] font-bold font-mono">{radius} meters</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Polygon perimeter containing {initialPolygonPoints?.length || 4} custom vertex coordinates.
                </div>
              )}
            </div>

            {/* Telematics Rules & Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Speed Limit (km/h)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Max Dwell Time (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={dwellLimit}
                  onChange={(e) => setDwellLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnEntry}
                  onChange={(e) => setAlertOnEntry(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                <span>Alert on Vehicle Entry</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertOnExit}
                  onChange={(e) => setAlertOnExit(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                <span>Alert on Vehicle Exit</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#D4AF37] text-[#0B0F19] hover:opacity-95 shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <MdCheck size={16} />
              <span>{isSubmitting ? "Activating..." : editingGeofence ? "Save Changes" : "Activate Geofence"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ BREACH SIMULATION MODAL (REAL-TIME FIREBASE DISPATCH TESTER)
// ─────────────────────────────────────────────────────────────────────────────
function BreachSimulationModal({ geofences, onClose }) {
  const [selectedGeoId, setSelectedGeoId] = useState(geofences[0]?.id || "");
  const [vehicleId, setVehicleId] = useState("VH-4821");
  const [driverName, setDriverName] = useState("Vikram Malhotra");
  const [breachType, setBreachType] = useState("entry"); // 'entry' or 'exit'
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);

    const targetZone = geofences.find((g) => String(g.id) === String(selectedGeoId)) || geofences[0];

    const isExit = breachType === "exit";
    const title = isExit
      ? `📍 Corridor Exit: ${targetZone.name}`
      : `🚨 Geofence Breach: ${targetZone.name}`;
    const message = isExit
      ? `Vehicle ${vehicleId} exited designated boundary corridor '${targetZone.name}'`
      : `Vehicle ${vehicleId} triggered unauthorized entry into '${targetZone.name}' (${targetZone.code})`;

    const alertPayload = {
      id: `ALT-GEO-${Date.now().toString().slice(-6)}`,
      title,
      message,
      type: "geofence",
      priority: targetZone.category === "restricted" ? "Critical" : "High",
      severity: targetZone.category === "restricted" ? "critical" : "high",
      vehicleId,
      driverName,
      locationLat: targetZone.centerLat,
      locationLng: targetZone.centerLng,
      locationAddress: `${targetZone.name} Perimeter, New Delhi`,
      status: "Active",
      createdAtIso: new Date().toISOString(),
    };

    try {
      // 1. Broadcast to Firebase Firestore in real-time
      await addFirestoreAlert(alertPayload);

      // 2. Also notify backend simulation endpoint
      try {
        await api.post("/geofences/simulate-breach", {
          geofenceId: targetZone.id,
          vehicleId,
          driverName,
          breachType,
        });
      } catch (e) {}

      toast.error(title, {
        description: message,
      });

      onClose();
    } catch (err) {
      toast.error("Simulation failed", { description: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MdPlayArrow size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white m-0">Test Geofence Breach Simulation</h3>
              <span className="text-[11px] text-slate-400">
                Dispatches a live incident into Firebase Firestore & Web Push
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800">
            <MdClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Geofence Zone
            </label>
            <select
              value={selectedGeoId}
              onChange={(e) => setSelectedGeoId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              {geofences.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code}) — {g.category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vehicle Unit
              </label>
              <input
                type="text"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Driver
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Incident Trigger Type
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBreachType("entry")}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  breachType === "entry"
                    ? "bg-rose-500/20 border-rose-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400"
                }`}
              >
                🚨 Unauthorized Entry Breach
              </button>
              <button
                type="button"
                onClick={() => setBreachType("exit")}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  breachType === "exit"
                    ? "bg-amber-500/20 border-amber-500 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400"
                }`}
              >
                📍 Corridor Boundary Exit
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-95 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <MdPlayArrow size={16} />
            <span>{isSimulating ? "Broadcasting..." : "Broadcast Real-Time Breach"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔍 GEOFENCE FULL DETAILS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GeofenceDetailsModal({ geofence, onClose, onEdit }) {
  const occupants = geofence.insideVehicles || [];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: geofence.color || "#10B981" }}
            />
            <div>
              <h3 className="text-base font-black text-white m-0">{geofence.name}</h3>
              <span className="text-[11px] font-mono text-slate-400">
                {geofence.code} • {geofence.category.toUpperCase()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800">
            <MdClose size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Description
            </span>
            <p className="text-slate-300 leading-relaxed m-0 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {geofence.description || "Designated fleet management zone boundary"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Speed Threshold
              </span>
              <span className="text-sm font-bold text-[#D4AF37]">
                Max {geofence.speedLimit || 30} km/h
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Dwell Time Allowance
              </span>
              <span className="text-sm font-bold text-white">
                {geofence.dwellLimitMinutes || 60} minutes
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Vehicles Currently Inside Zone ({occupants.length})
            </span>
            {occupants.length > 0 ? (
              <div className="space-y-1.5">
                {occupants.map((plate, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">{plate}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Inside Perimeter
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No active fleet vehicles currently located within this zone.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:text-white hover:bg-slate-700"
          >
            <MdEdit size={14} />
            <span>Edit Configuration</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
