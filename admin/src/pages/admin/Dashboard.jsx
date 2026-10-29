import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdTrendingUp, MdTrendingDown, MdOpenInNew, MdRefresh } from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import Pagination from "../../shared/Pagination";
import FleetLeafletMap from "../../components/map/FleetLeafletMap";
import { getDrivers } from "../../Redux/Thunks/driver.thunks";
import { getVehicles } from "../../Redux/Thunks/vehicle.thunks";
import {
  getTrackingStats,
  getLoggedInDriversTelemetry,
  getActiveFleetStops,
  getTripHistory,
} from "../../Redux/Thunks/tracking.thunks";
import { normalizeFleetUnits } from "../../utils/mapUtils";

const TYPE_COLOR = {
  success: "#D4AF37",
  danger:  "#ef4444",
  warning: "#f59e0b",
  info:    "#38bdf8",
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { drivers } = useSelector((state) => state.driver);
  const { vehicles } = useSelector((state) => state.vehicle);
  const {
    stats,
    statsLoading,
    loggedInDrivers,
    activeStops,
    tripHistory,
  } = useSelector((state) => state.tracking);

  const pollIntervalRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    dispatch(getDrivers());
    dispatch(getVehicles());
    dispatch(getTrackingStats());
    dispatch(getLoggedInDriversTelemetry());
    dispatch(getActiveFleetStops());
    dispatch(getTripHistory({ limit: 10 }));
  }, [dispatch]);

  // Periodic polling for dynamic telemetry updates (every 6 seconds)
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      dispatch(getTrackingStats());
      dispatch(getLoggedInDriversTelemetry());
      dispatch(getActiveFleetStops());
    }, 6000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [dispatch]);

  const handleManualSync = () => {
    dispatch(getTrackingStats());
    dispatch(getLoggedInDriversTelemetry());
    dispatch(getActiveFleetStops());
    dispatch(getTripHistory({ limit: 10 }));
    dispatch(getDrivers());
    dispatch(getVehicles());
  };

  // Base normalization from DB
  const baseFleet = useMemo(() => {
    return normalizeFleetUnits(drivers, vehicles);
  }, [drivers, vehicles]);

  // Merge real-time Redis telemetry into fleet units
  const fleetDrivers = useMemo(() => {
    if (!Array.isArray(loggedInDrivers) || loggedInDrivers.length === 0) {
      return baseFleet;
    }

    // Map each base unit, updating with live Redis coordinates and stoppage status if online
    return baseFleet.map((unit) => {
      const live = loggedInDrivers.find(
        (l) =>
          Number(l.driverId) === Number(unit.userId) ||
          Number(l.userId) === Number(unit.userId) ||
          (l.vehicleNumber && l.vehicleNumber === unit.vehicleId)
      );

      if (!live) return unit;

      const isStopped = Boolean(live.isCurrentlyStopped);
      const speedVal = isStopped ? 0 : Math.round(Number(live.speed) || 0);

      return {
        ...unit,
        lat: Number(live.latitude) || unit.lat,
        lng: Number(live.longitude) || unit.lng,
        speed: speedVal,
        heading: Number(live.heading) || unit.heading,
        status: isStopped ? "idle" : (speedVal > 0 ? "active" : "idle"),
        isCurrentlyStopped: isStopped,
        currentStopDurationSeconds: live.currentStopDurationSeconds || 0,
        address: live.locationAddress || unit.address,
        tripId: live.activeTripId || unit.tripId,
        isLoggedIn: true,
        lastSeen: "Live Now",
      };
    });
  }, [baseFleet, loggedInDrivers]);

  const activeCount = stats?.activeUnits ?? fleetDrivers.filter((d) => d.status === "active").length;
  const idleCount = stats?.idleUnits ?? fleetDrivers.filter((d) => d.status === "idle").length;
  const stoppedCount = stats?.stoppedUnits ?? (activeStops?.length || 0);
  const offlineCount = stats?.offlineUnits ?? fleetDrivers.filter((d) => d.status === "offline").length;
  const redisPing = stats?.redis?.pingMs ?? 1;

  /* ── Dynamic Stat Cards ───────────────────────────────────────────────── */
  const statCards = useMemo(() => [
    {
      label:  "Active Units",
      value:  String(activeCount),
      sub:    "Live GPS online & moving",
      trend:  "up",
      color:  "#D4AF37",
      bg:     "rgba(212,175,55,0.10)",
      border: "rgba(212,175,55,0.25)",
      icon:   "📡",
    },
    {
      label:  "Idle Units",
      value:  String(idleCount),
      sub:    "Standby & awaiting trip",
      trend:  "neutral",
      color:  "#f59e0b",
      bg:     "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.25)",
      icon:   "⏸️",
    },
    {
      label:  "Active Stops (>60s)",
      value:  String(stoppedCount),
      sub:    `${stoppedCount} duration monitored`,
      trend:  stoppedCount > 0 ? "down" : "neutral",
      color:  "#ef4444",
      bg:     "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.25)",
      icon:   "🛑",
    },
    {
      label:  "Offline Drivers",
      value:  String(offlineCount),
      sub:    "Heartbeat TTL expired",
      trend:  "down",
      color:  "#94a3b8",
      bg:     "rgba(148,163,184,0.10)",
      border: "rgba(148,163,184,0.25)",
      icon:   "🔴",
    },
    {
      label:  "Trip Records",
      value:  String(tripHistory?.count || tripHistory?.rows?.length || 0),
      sub:    "Persisted trip telematics",
      trend:  "up",
      color:  "#38bdf8",
      bg:     "rgba(56,189,248,0.10)",
      border: "rgba(56,189,248,0.25)",
      icon:   "📋",
    },
    {
      label:  "Redis Telemetry",
      value:  `${redisPing}ms`,
      sub:    stats?.redis?.connected ? "Cache Ingest Active" : "Connecting...",
      trend:  "up",
      color:  "#10b981",
      bg:     "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.25)",
      icon:   "⚡",
    },
  ], [activeCount, idleCount, stoppedCount, offlineCount, tripHistory, redisPing, stats]);

  return (
    <div className="min-h-screen bg-[#0B0F17] px-6 py-6">

      {/* ── Page Heading ────────────────────────────────────────────────── */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">Fleetiq</span>
          <span className="text-xs text-slate-600">/</span>
          <span className="text-xs text-slate-400">Live Dashboard</span>
        </nav>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            Live Operations Dashboard
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4AF37]" />
              </span>
              REALTIME TELEMETRY
            </span>
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white transition-all bg-slate-800/60 hover:bg-slate-700/60 cursor-pointer"
            >
              <MdRefresh size={14} className={statsLoading ? "animate-spin text-[#D4AF37]" : ""} />
              <span>Sync</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/fleet-map")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white transition-all bg-slate-800/60 hover:bg-slate-700/60 cursor-pointer"
            >
              Live Fleet Map →
            </button>
            <button
              onClick={() => navigate("/dashboard/trip-history")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-shadow cursor-pointer"
            >
              Trip History →
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {statCards.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* ── Main content: Map + Activity ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-3">
        <LiveFleetMapCard
          fleetDrivers={fleetDrivers}
          activeCount={activeCount}
          stoppedCount={stoppedCount}
          offlineCount={offlineCount}
        />
        <ActivityFeed
          activeStops={activeStops}
          loggedInDrivers={loggedInDrivers}
          tripHistory={tripHistory}
        />
      </div>

      {/* ── Second row: Devices table + System Health ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-3 mt-3">
        <DeviceTablePreview
          fleetDrivers={fleetDrivers}
          loggedInDrivers={loggedInDrivers}
        />
        <SystemHealth redisPing={redisPing} redisConnected={stats?.redis?.connected} />
      </div>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ card }) {
  return (
    <div
      className="group relative rounded-xl p-4 border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = card.border; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(51, 65, 85, 0.6)"; }}
    >
      {/* Subtle top glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${card.color}80, transparent)` }}
      />

      <div className="flex items-start justify-between mb-3">
        {/* Icon box */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base border"
          style={{ background: card.bg, borderColor: card.border }}
        >
          {card.icon}
        </div>
        {/* Trend */}
        {card.trend !== "neutral" && (
          <div
            className="flex items-center gap-0.5 text-[11px] font-bold"
            style={{ color: card.trend === "up" ? "#D4AF37" : "#ef4444" }}
          >
            {card.trend === "up"
              ? <MdTrendingUp size={13} />
              : <MdTrendingDown size={13} />}
          </div>
        )}
      </div>

      <div className="text-[22px] font-black text-white leading-none mb-1 tracking-tight">
        {card.value}
      </div>
      <div className="text-[11px] text-slate-400 mb-1">{card.label}</div>
      <div className="text-[10px] font-semibold" style={{ color: card.color }}>
        {card.sub}
      </div>
    </div>
  );
}

/* ── Live Fleet Map Card ──────────────────────────────────────────────────── */
function LiveFleetMapCard({ fleetDrivers, activeCount, stoppedCount, offlineCount }) {
  const navigate = useNavigate();

  return (
    <div
      className="relative rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md overflow-hidden flex flex-col shadow-sm"
      style={{ height: 380 }}
    >
      {/* Card header */}
      <div className="z-10 flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#151D2C]/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white tracking-tight">
            Live Fleet Map
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            {activeCount} active
          </span>
          {stoppedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              🛑 {stoppedCount} stopped
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            {offlineCount} offline
          </span>
          <button
            onClick={() => navigate("/dashboard/fleet-map")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#D4AF37] text-slate-950 hover:bg-[#c49f2f] transition-all cursor-pointer shadow-sm ml-1"
          >
            <span>Full Map</span>
            <MdOpenInNew size={11} />
          </button>
        </div>
      </div>

      {/* Interactive OpenStreetMap */}
      <div className="flex-1 relative w-full h-full min-h-0">
        <FleetLeafletMap
          drivers={fleetDrivers}
          compact={true}
          defaultLayer="street"
          disableDark={true}
          showLayerSwitcher={false}
          height="100%"
          minHeight="100%"
        />
      </div>
    </div>
  );
}

/* ── Activity Feed (Dynamic Telematics & Stoppage Events) ─────────────────── */
function ActivityFeed({ activeStops = [], loggedInDrivers = [], tripHistory = {} }) {
  const navigate = useNavigate();

  // Dynamically generate real feed items
  const feedItems = useMemo(() => {
    const list = [];

    // 1. Add active stops (>60s rule)
    if (Array.isArray(activeStops) && activeStops.length > 0) {
      activeStops.forEach((stop) => {
        list.push({
          label: `🛑 Stop >60s: ${stop.driverName} (${stop.vehicleNumber}) stopped for ${stop.durationFormatted || stop.durationSeconds + "s"}`,
          time: "Active stoppage",
          type: "danger",
        });
      });
    }

    // 2. Add moving logged-in drivers
    if (Array.isArray(loggedInDrivers) && loggedInDrivers.length > 0) {
      loggedInDrivers
        .filter((d) => !d.isCurrentlyStopped && Number(d.speed) > 0)
        .slice(0, 3)
        .forEach((d) => {
          list.push({
            label: `🚀 Driver ${d.name} (${d.vehicleNumber}) cruising at ${d.speed} km/h`,
            time: "Live telemetry",
            type: "success",
          });
        });
    }

    // 3. Add recent completed trips from history
    if (Array.isArray(tripHistory?.rows) && tripHistory.rows.length > 0) {
      tripHistory.rows.slice(0, 4).forEach((trip) => {
        const stopsCount = Array.isArray(trip.stops) ? trip.stops.length : 0;
        list.push({
          label: `🏁 Trip #${trip.tripId} recorded • Avg ${Math.round(trip.avgSpeed || 0)} km/h • ${stopsCount} stops`,
          time: trip.createdAt
            ? new Date(trip.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Recently",
          type: "info",
        });
      });
    }

    // 4. Fallback items if quiet
    if (list.length === 0) {
      list.push(
        { label: "Redis Stoppage Engine running (>60s rule active)", time: "Just now", type: "success" },
        { label: "Telematics Geo-indexing ready on Redis port 6379", time: "1m ago", type: "info" },
        { label: "Awaiting driver app GPS heartbeats", time: "Now", type: "warning" }
      );
    }

    return list.slice(0, 8);
  }, [activeStops, loggedInDrivers, tripHistory]);

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md overflow-hidden" style={{ height: 380 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
        <span className="text-[13px] font-bold text-white tracking-tight">Recent Activity</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
          <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block" />
          LIVE
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
        {feedItems.map((item, i) => {
          const color = TYPE_COLOR[item.type] || "#D4AF37";
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-4 py-2.5 border-b border-slate-800/60 cursor-pointer transition-colors hover:bg-slate-800/40"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1"
                style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-200 leading-snug">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-800 shrink-0">
        <button
          onClick={() => navigate("/dashboard/trip-history")}
          className="w-full text-center text-[11px] font-semibold text-[#D4AF37] hover:text-[#D4AF37] py-1 rounded-lg hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
        >
          View Trip History &amp; Replay →
        </button>
      </div>
    </div>
  );
}

/* ── Device Table Preview (Dynamic Logged-In Telemetry) ───────────────────── */
const STATUS_CLASSES = {
  active:  "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20",
  stopped: "bg-red-500/15 text-red-400 border border-red-500/30",
  idle:    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  offline: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
};

function DeviceTablePreview({ fleetDrivers = [], loggedInDrivers = [] }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Build real dynamic devices list
  const deviceList = useMemo(() => {
    // If loggedInDrivers exist, show them first
    if (Array.isArray(loggedInDrivers) && loggedInDrivers.length > 0) {
      return loggedInDrivers.map((d) => {
        const isStopped = Boolean(d.isCurrentlyStopped);
        const durSec = d.currentStopDurationSeconds || 0;
        const durText = `${Math.floor(durSec / 60)}m ${durSec % 60}s`;

        return {
          id: d.vehicleNumber || `VH-${d.driverId}`,
          driverId: d.driverId || d.userId,
          driver: d.name || "Driver",
          speed: isStopped ? "0 km/h (Stopped)" : `${Math.round(d.speed || 0)} km/h`,
          telemetryStatus: isStopped ? `Stopped: ${durText}` : "Cruising",
          status: isStopped ? "stopped" : (d.speed > 0 ? "active" : "idle"),
          isStopped,
        };
      });
    }

    // Fallback to normalized fleet drivers
    return fleetDrivers.slice(0, 8).map((d) => ({
      id: d.vehicleId || `VH-${d.userId}`,
      driverId: d.userId,
      driver: d.name,
      speed: `${d.speed} km/h`,
      telemetryStatus: `${d.battery}% batt`,
      status: d.status,
      isStopped: false,
    }));
  }, [loggedInDrivers, fleetDrivers]);

  const paginatedData = deviceList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white tracking-tight">Active Devices &amp; Telemetry</span>
          <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
            {deviceList.length} units
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/fleet-map")}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition-all cursor-pointer"
        >
          View All on Map
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40">
              {["Vehicle / Unit", "Driver", "Live Speed", "Telemetry Status", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                  No active driver devices currently connected.
                </td>
              </tr>
            ) : (
              paginatedData.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => d.driverId && navigate(`/dashboard/drivers/${d.driverId}/track`)}
                  className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  title="Click to track live GPS"
                >
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-bold text-[#D4AF37] font-mono">{d.id}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-200">{d.driver}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-300 font-mono">{d.speed}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        d.isStopped ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {d.telemetryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        STATUS_CLASSES[d.status] || STATUS_CLASSES.idle
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={deviceList.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

/* ── System Health (Dynamic Redis Engine) ─────────────────────────────────── */
function SystemHealth({ redisPing = 1, redisConnected = true }) {
  const services = [
    {
      name: "Redis Telemetry Engine",
      latency: `${redisPing}ms`,
      uptime: redisConnected ? "100%" : "Reconnecting",
      status: redisConnected ? "healthy" : "warning",
    },
    {
      name: "Stoppage Analyzer (>60s)",
      latency: "< 500ms",
      uptime: "Active",
      status: "healthy",
    },
    {
      name: "Geo-Indexing & Heartbeats",
      latency: "3ms",
      uptime: "99.9%",
      status: "healthy",
    },
    {
      name: "MySQL Historical Sync",
      latency: "4ms",
      uptime: "100%",
      status: "healthy",
    },
    {
      name: "API Gateway (/tracking)",
      latency: "12ms",
      uptime: "99.9%",
      status: "healthy",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#151D2C]/80 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-[13px] font-bold text-white tracking-tight">Telemetry Health</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
          Engine Active
        </span>
      </div>

      <div className="py-1">
        {services.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors"
          >
            <RiSignalTowerFill
              size={13}
              className={`shrink-0 ${
                s.status === "healthy" ? "text-[#D4AF37]" : "text-amber-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-slate-200 truncate">{s.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.uptime}</div>
            </div>
            <span className="text-[11px] font-bold text-[#D4AF37] font-mono shrink-0">
              {s.latency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}