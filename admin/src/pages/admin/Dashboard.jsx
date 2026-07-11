import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Stat cards data ─────────────────────────────────────────────────────── */
const STAT_CARDS = [
  {
    label:  "Active Devices",
    value:  "3,842",
    sub:    "+12% from yesterday",
    trend:  "up",
    color:  "#22d3ee",
    bg:     "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.25)",
    icon:   "📡",
  },
  {
    label:  "Idle Units",
    value:  "641",
    sub:    "Auto-idle detection on",
    trend:  "neutral",
    color:  "#f59e0b",
    bg:     "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
    icon:   "⏸️",
  },
  {
    label:  "Offline",
    value:  "517",
    sub:    "Last seen < 10 min",
    trend:  "down",
    color:  "#ef4444",
    bg:     "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.25)",
    icon:   "🔴",
  },
  {
    label:  "SOS Alerts",
    value:  "3",
    sub:    "Immediate action needed",
    trend:  "down",
    color:  "#d946ef",
    bg:     "rgba(217,70,239,0.10)",
    border: "rgba(217,70,239,0.30)",
    icon:   "🆘",
  },
  {
    label:  "GPS Records / Day",
    value:  "1.2M",
    sub:    "Time-series indexed",
    trend:  "up",
    color:  "#10b981",
    bg:     "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.25)",
    icon:   "🗄️",
  },
  {
    label:  "WS Latency",
    value:  "48ms",
    sub:    "Target: < 2 seconds",
    trend:  "up",
    color:  "#3b82f6",
    bg:     "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
    icon:   "⚡",
  },
];

/* ── Recent activity feed ─────────────────────────────────────────────────── */
const ACTIVITY = [
  { label: "VH-4821 entered Zone A",         time: "just now", type: "success" },
  { label: "SOS triggered — UID-0093",        time: "2m ago",   type: "danger"  },
  { label: "DEV-2291 battery low (9%)",       time: "5m ago",   type: "warning" },
  { label: "Trip #TR-9920 completed",         time: "11m ago",  type: "info"    },
  { label: "New device registered: DEV-5501", time: "18m ago",  type: "info"    },
  { label: "Geofence exit — VH-0071",         time: "24m ago",  type: "warning" },
  { label: "VH-3310 speed limit exceeded",    time: "31m ago",  type: "danger"  },
  { label: "Backend autoscaled: +2 pods",     time: "45m ago",  type: "success" },
];

const TYPE_COLOR = {
  success: "#10b981",
  danger:  "#ef4444",
  warning: "#f59e0b",
  info:    "#22d3ee",
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#060912] px-6 py-6">

      {/* ── Page Heading ────────────────────────────────────────────────── */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-cyan-400 tracking-wide">Fleetiq</span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs text-white/40">Live Dashboard</span>
        </nav>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            Live Operations Dashboard
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              LIVE
            </span>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all bg-white/5 hover:bg-white/10">
              Export Report
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
              + Add Device
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* ── Main content: Map + Activity ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
        <MapPlaceholder />
        <ActivityFeed />
      </div>

      {/* ── Second row: Devices table + System Health ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3 mt-3">
        <DeviceTablePreview />
        <SystemHealth />
      </div>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ card }) {
  return (
    <div
      className="group relative rounded-xl p-4 border border-white/[0.06] bg-[#0d1420] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = card.border; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
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
            style={{ color: card.trend === "up" ? "#10b981" : "#ef4444" }}
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
      <div className="text-[11px] text-white/40 mb-1">{card.label}</div>
      <div className="text-[10px] font-semibold" style={{ color: card.color }}>
        {card.sub}
      </div>
    </div>
  );
}

/* ── Map Placeholder ──────────────────────────────────────────────────────── */
function MapPlaceholder() {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden" style={{ height: 360 }}>
      {/* Card header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0d1420]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white tracking-tight">Live Fleet Map</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            LIVE
          </span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            3,842 active
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            517 offline
          </span>
        </div>
      </div>

      {/* Animated grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)",
          top: "30%",
          left: "30%",
        }}
      />

      {/* Content */}
      <div className="relative z-[1] flex flex-col items-center justify-center h-full gap-3 mt-8">
        <div className="text-4xl">🗺️</div>
        <div className="text-center">
          <div className="text-sm font-bold text-white mb-1">Integrate Mapbox / Google Maps</div>
          <div className="text-[11px] text-white/40">
            WebSocket active · 3,842 devices tracked · &lt;2s latency
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
          Initialize Map View
        </button>
      </div>
    </div>
  );
}

/* ── Activity Feed ────────────────────────────────────────────────────────── */
function ActivityFeed() {
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <span className="text-[13px] font-bold text-white tracking-tight">Recent Activity</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          LIVE
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
        {ACTIVITY.map((item, i) => {
          const color = TYPE_COLOR[item.type];
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-4 py-2.5 border-b border-white/[0.03] cursor-pointer transition-colors hover:bg-white/[0.04]"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1"
                style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white/70 leading-snug">{item.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{item.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.06] shrink-0">
        <button className="w-full text-center text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 py-1 rounded-lg hover:bg-cyan-500/5 transition-colors">
          View All Alerts →
        </button>
      </div>
    </div>
  );
}

/* ── Device Table Preview ─────────────────────────────────────────────────── */
const DEVICES = [
  { id: "VH-4821", driver: "John Smith",  speed: "62 km/h", battery: "87%", status: "active"  },
  { id: "VH-0071", driver: "Priya Kumar", speed: "0 km/h",  battery: "45%", status: "idle"    },
  { id: "DEV-093", driver: "Ali Hassan",  speed: "—",        battery: "9%",  status: "offline" },
  { id: "VH-3310", driver: "Sara Lee",    speed: "94 km/h", battery: "72%", status: "active"  },
  { id: "VH-2200", driver: "Carlos M.",   speed: "28 km/h", battery: "61%", status: "active"  },
];

const STATUS_CLASSES = {
  active:  "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  idle:    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  offline: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function DeviceTablePreview() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] font-bold text-white tracking-tight">Active Devices</span>
        <button className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-all">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Device ID", "Driver", "Speed", "Battery", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEVICES.map((d, i) => (
              <tr
                key={d.id}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-cyan-400 font-mono">{d.id}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-white/60">{d.driver}</td>
                <td className="px-4 py-3 text-[12px] text-white/60 font-mono">{d.speed}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-[12px] font-bold font-mono"
                    style={{ color: parseInt(d.battery) < 20 ? "#ef4444" : "rgba(255,255,255,0.6)" }}
                  >
                    {d.battery}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CLASSES[d.status]}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── System Health ────────────────────────────────────────────────────────── */
const SERVICES = [
  { name: "API Gateway",      latency: "12ms",  uptime: "99.9%" },
  { name: "Location Service", latency: "8ms",   uptime: "99.8%" },
  { name: "WebSocket Server", latency: "48ms",  uptime: "99.7%" },
  { name: "MongoDB Replica",  latency: "4ms",   uptime: "99.9%" },
  { name: "Redis Cache",      latency: "1ms",   uptime: "100%"  },
];

function SystemHealth() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] font-bold text-white tracking-tight">System Health</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          All Healthy
        </span>
      </div>

      <div className="py-1">
        {SERVICES.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
          >
            <RiSignalTowerFill size={13} className="text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-white/80 truncate">{s.name}</div>
              <div className="text-[10px] text-white/30 mt-0.5">Uptime {s.uptime}</div>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 font-mono shrink-0">{s.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}