import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Stat cards data ─────────────────────────────────────────────────────── */
const STAT_CARDS = [
  {
    label:  "Active Devices",
    value:  "3,842",
    sub:    "+12% from yesterday",
    trend:  "up",
    color:  "#0D6EFD",
    bg:     "rgba(13,110,253,0.1)",
    border: "rgba(13,110,253,0.22)",
    icon:   "📡",
  },
  {
    label:  "Idle Units",
    value:  "641",
    sub:    "Auto-idle detection on",
    trend:  "neutral",
    color:  "#FFC107",
    bg:     "rgba(255,193,7,0.1)",
    border: "rgba(255,193,7,0.22)",
    icon:   "⏸️",
  },
  {
    label:  "Offline",
    value:  "517",
    sub:    "Last seen < 10 min",
    trend:  "down",
    color:  "#AB2E3C",
    bg:     "rgba(171,46,60,0.1)",
    border: "rgba(171,46,60,0.22)",
    icon:   "🔴",
  },
  {
    label:  "SOS Alerts",
    value:  "3",
    sub:    "Immediate action needed",
    trend:  "down",
    color:  "#AF1763",
    bg:     "rgba(175,23,99,0.1)",
    border: "rgba(175,23,99,0.3)",
    icon:   "🆘",
  },
  {
    label:  "GPS Records / Day",
    value:  "1.2M",
    sub:    "Time-series indexed",
    trend:  "up",
    color:  "#198754",
    bg:     "rgba(25,135,84,0.1)",
    border: "rgba(25,135,84,0.22)",
    icon:   "🗄️",
  },
  {
    label:  "WS Latency",
    value:  "48ms",
    sub:    "Target: < 2 seconds",
    trend:  "up",
    color:  "#0DCAF0",
    bg:     "rgba(13,202,240,0.1)",
    border: "rgba(13,202,240,0.22)",
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
  success: "#198754",
  danger:  "#AB2E3C",
  warning: "#FFC107",
  info:    "#0D6EFD",
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="ml-30">

      {/* ── Page Heading ────────────────────────────────────────────────── */}
      <div className="page-heading">
        <nav className="page-breadcrumb">
          <span>Fleetiq</span>
          <span className="page-breadcrumb-sep">/</span>
          <span style={{ color: "var(--color-text-secondary)" }}>Live Dashboard</span>
        </nav>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h1 className="page-title">Live Operations Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-live">● LIVE</span>
            <button className="fleet-btn-ghost" style={{ fontSize: 12 }}>
              Export Report
            </button>
            <button className="fleet-btn-primary" style={{ fontSize: 12 }}>
              + Add Device
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* ── Main content: Map + Activity ────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 296px",
          gap: 14,
        }}
      >
        {/* Map area */}
        <MapPlaceholder />

        {/* Activity feed */}
        <ActivityFeed />
      </div>

      {/* ── Second row: Devices table preview + system health ───────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 296px",
          gap: 14,
          marginTop: 14,
        }}
      >
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
      className="fleet-card"
      style={{ padding: "18px 20px", cursor: "pointer" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = card.border;
        e.currentTarget.style.transform   = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        {/* Icon box */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: card.bg,
            border: `1px solid ${card.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {card.icon}
        </div>
        {/* Trend */}
        {card.trend !== "neutral" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 600,
              color: card.trend === "up" ? "#198754" : "#AB2E3C",
            }}
          >
            {card.trend === "up" ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sora)",
          lineHeight: 1,
          marginBottom: 5,
        }}
      >
        {card.value}
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 3 }}>
        {card.label}
      </div>
      <div style={{ fontSize: 11, color: card.color, fontWeight: 500 }}>
        {card.sub}
      </div>
    </div>
  );
}

/* ── Map Placeholder ──────────────────────────────────────────────────────── */
function MapPlaceholder() {
  return (
    <div
      className="fleet-card"
      style={{
        height: 380,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Card header */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "var(--color-bg-card)",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-sora)" }}>
            Live Fleet Map
          </span>
          <span className="badge badge-live">● LIVE</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className="badge badge-active">3,842 active</span>
          <span className="badge badge-offline">517 offline</span>
        </div>
      </div>

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(13,110,253,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(13,110,253,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(175,23,99,0.07) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sora)",
            marginBottom: 5,
          }}
        >
          Integrate Mapbox / Google Maps
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 18 }}>
          WebSocket active · 3,842 devices tracked · &lt;2s latency
        </div>
        <button className="fleet-btn-primary">Initialize Map View</button>
      </div>
    </div>
  );
}

/* ── Activity Feed ────────────────────────────────────────────────────────── */
function ActivityFeed() {
  return (
    <div
      className="fleet-card"
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-sora)" }}>
          Recent Activity
        </span>
        <span className="badge badge-live">● LIVE</span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0", scrollbarWidth: "thin" }}>
        {ACTIVITY.map((item, i) => {
          const color = TYPE_COLOR[item.type];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "9px 16px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                  marginTop: 4,
                  boxShadow: `0 0 6px ${color}80`,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2 }}>
                  {item.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <button className="fleet-btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
          View All Alerts →
        </button>
      </div>
    </div>
  );
}

/* ── Device Table Preview ─────────────────────────────────────────────────── */
const DEVICES = [
  { id: "VH-4821", driver: "John Smith",   speed: "62 km/h", battery: "87%", status: "active"  },
  { id: "VH-0071", driver: "Priya Kumar",  speed: "0 km/h",  battery: "45%", status: "idle"    },
  { id: "DEV-093", driver: "Ali Hassan",   speed: "—",       battery: "9%",  status: "offline" },
  { id: "VH-3310", driver: "Sara Lee",     speed: "94 km/h", battery: "72%", status: "active"  },
  { id: "VH-2200", driver: "Carlos M.",    speed: "28 km/h", battery: "61%", status: "active"  },
];

const STATUS_BADGE = {
  active:  "badge badge-active",
  idle:    "badge badge-idle",
  offline: "badge badge-offline",
};

function DeviceTablePreview() {
  return (
    <div className="fleet-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-sora)" }}>
          Active Devices
        </span>
        <button className="fleet-btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>
          View All
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Device ID", "Driver", "Speed", "Battery", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 18px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
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
                style={{
                  borderBottom: i < DEVICES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "11px 18px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fleet-blue)", fontFamily: "var(--font-mono)" }}>
                    {d.id}
                  </span>
                </td>
                <td style={{ padding: "11px 18px", fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {d.driver}
                </td>
                <td style={{ padding: "11px 18px", fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {d.speed}
                </td>
                <td style={{ padding: "11px 18px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      color: parseInt(d.battery) < 20 ? "var(--color-fleet-red)" : "var(--color-text-secondary)",
                    }}
                  >
                    {d.battery}
                  </span>
                </td>
                <td style={{ padding: "11px 18px" }}>
                  <span className={STATUS_BADGE[d.status]}>{d.status}</span>
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
  { name: "API Gateway",       status: "healthy", latency: "12ms",  uptime: "99.9%" },
  { name: "Location Service",  status: "healthy", latency: "8ms",   uptime: "99.8%" },
  { name: "WebSocket Server",  status: "healthy", latency: "48ms",  uptime: "99.7%" },
  { name: "MongoDB Replica",   status: "healthy", latency: "4ms",   uptime: "99.9%" },
  { name: "Redis Cache",       status: "healthy", latency: "1ms",   uptime: "100%"  },
];

function SystemHealth() {
  return (
    <div className="fleet-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-sora)" }}>
          System Health
        </span>
        <span className="badge badge-active">All Healthy</span>
      </div>

      <div style={{ padding: "8px 0" }}>
        {SERVICES.map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              transition: "background 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <RiSignalTowerFill size={14} style={{ color: "#198754", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 1 }}>
                Uptime {s.uptime}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-fleet-cyan)",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}
            >
              {s.latency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}