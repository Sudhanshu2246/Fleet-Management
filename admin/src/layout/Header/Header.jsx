import { useState, useRef, useEffect } from "react";
import {
  MdSearch,
  MdNotificationsActive,
  MdMenu,
  MdFullscreen,
  MdFullscreenExit,
  MdRefresh,
  MdCircle,
  MdWarning,
  MdBatteryAlert,
  MdGpsOff,
  MdCheckCircle,
  MdKeyboardArrowDown,
  MdLogout,
  MdSettings,
  MdPerson,
  MdClose,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import { HiOutlineChip } from "react-icons/hi";

// ─── Sample notifications from SOW alert types ──────────────────────────────
const NOTIFICATIONS = [
  {
    id: 1,
    type: "sos",
    title: "SOS Alert",
    message: "Vehicle VH-4821 triggered SOS — Chennai Highway",
    time: "2m ago",
    read: false,
    color: "#AB2E3C",
    icon: MdWarning,
  },
  {
    id: 2,
    type: "geofence",
    title: "Geofence Exit",
    message: "Driver UID-2291 exited Zone B perimeter",
    time: "8m ago",
    read: false,
    color: "#FFC107",
    icon: MdGpsOff,
  },
  {
    id: 3,
    type: "battery",
    title: "Low Battery",
    message: "Device DEV-0093 battery at 9% — may go offline",
    time: "14m ago",
    read: false,
    color: "#FFC107",
    icon: MdBatteryAlert,
  },
  {
    id: 4,
    type: "system",
    title: "System Healthy",
    message: "All 4 microservices running. WebSocket latency 48ms",
    time: "1h ago",
    read: true,
    color: "#198754",
    icon: MdCheckCircle,
  },
];

// ─── Quick stats for header strip ───────────────────────────────────────────
const LIVE_STATS = [
  { label: "Active", value: "3,842", color: "#198754" },
  { label: "Idle", value: "641", color: "#FFC107" },
  { label: "Offline", value: "517", color: "#AB2E3C" },
];

export default function Header({ onMenuToggle, collapsed }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [wsLatency, setWsLatency] = useState(48);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Simulate live latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setWsLatency(Math.floor(Math.random() * 40 + 35));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 flex flex-col shrink-0"
      style={{
        background: "#191C24",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* ── Main Header Row ────────────────────────────────── */}
      <div className="flex items-center justify-around h-16 ">
          {/* ── Search Bar ─────────────────────────────────── */}
          <div ref={searchRef} className="relative flex-1 max-w-sm">
            <div
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-lg px-3 h-9 cursor-text transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${searchOpen ? "rgba(175,23,99,0.5)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <MdSearch size={17} style={{ color: "#5a6380", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search vehicles, drivers, trips..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none border-none"
                style={{
                  color: "#f0f2f8",
                  fontFamily: "'DM Sans', sans-serif",
                  caretColor: "#AF1763",
                }}
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="shrink-0"
                  style={{
                    color: "#5a6380",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <MdClose size={15} />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {searchOpen && searchVal && (
              <div
                className="absolute top-11 left-0 w-full rounded-xl overflow-hidden py-1"
                style={{
                  background: "#1e2230",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                }}
              >
                {["Vehicle VH-4821", "Driver John Smith", "Trip #TR-9920"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <MdSearch size={14} style={{ color: "#5a6380" }} />
                      <span className="text-sm" style={{ color: "#a8b0c8" }}>
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* ── Live Stats Strip (center) ───────────────────── */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {LIVE_STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  marginRight: i < LIVE_STATS.length - 1 ? "4px" : 0,
                }}
              >
                <MdCircle size={8} style={{ color: s.color }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#f0f2f8" }}
                >
                  {s.value}
                </span>
                <span className="text-xs" style={{ color: "#5a6380" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

        {/* ── Right Actions ───────────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto">
          {/* WS Latency chip */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(13,202,240,0.08)",
              border: "1px solid rgba(13,202,240,0.15)",
            }}
          >
            <RiSignalTowerFill size={13} style={{ color: "#0DCAF0" }} />
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: "#0DCAF0" }}
            >
              {wsLatency}ms
            </span>
          </div>

          {/* Refresh */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-white/5"
            style={{
              color: "#a8b0c8",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            title="Refresh data"
          >
            <MdRefresh size={19} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-white/5"
            style={{
              color: "#a8b0c8",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            title="Toggle fullscreen"
          >
            {fullscreen ? (
              <MdFullscreenExit size={19} />
            ) : (
              <MdFullscreen size={19} />
            )}
          </button>

          {/* Divider */}
          <div
            className="w-px h-6 mx-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          {/* ── Notification Bell ─────────────────────── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-white/5 relative"
              style={{
                color: notifOpen ? "#AF1763" : "#a8b0c8",
                border: "none",
                background: notifOpen ? "rgba(175,23,99,0.1)" : "transparent",
                cursor: "pointer",
              }}
            >
              <MdNotificationsActive size={20} />
              {unread > 0 && (
                <span
                  className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
                  style={{
                    width: "17px",
                    height: "17px",
                    background: "#AB2E3C",
                    fontSize: "9px",
                    border: "2px solid #191C24",
                  }}
                >
                  {unread}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div
                className="absolute right-0 top-12 rounded-xl overflow-hidden"
                style={{
                  width: "340px",
                  background: "#1e2230",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 100,
                }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: "#f0f2f8",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Notifications
                    </span>
                    {unread > 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(171,46,60,0.2)",
                          color: "#AB2E3C",
                          border: "1px solid rgba(171,46,60,0.3)",
                        }}
                      >
                        {unread} new
                      </span>
                    )}
                  </div>
                  <button
                    className="text-xs font-medium transition-colors"
                    style={{
                      color: "#AF1763",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div
                  className="max-h-80 overflow-y-auto"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {NOTIFICATIONS.map((n) => {
                    const NIcon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/4"
                        style={{
                          background: !n.read
                            ? "rgba(175,23,99,0.04)"
                            : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                          style={{
                            background: n.color + "18",
                            border: `1px solid ${n.color}30`,
                          }}
                        >
                          <NIcon size={17} style={{ color: n.color }} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: n.color }}
                            >
                              {n.title}
                            </span>
                            <span
                              className="text-xs shrink-0"
                              style={{ color: "#5a6380" }}
                            >
                              {n.time}
                            </span>
                          </div>
                          <div
                            className="text-xs mt-0.5 leading-relaxed"
                            style={{ color: "#a8b0c8" }}
                          >
                            {n.message}
                          </div>
                        </div>
                        {!n.read && (
                          <div className="shrink-0 mt-2">
                            <MdCircle size={7} style={{ color: "#AF1763" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  className="px-4 py-3 text-center"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <button
                    className="text-xs font-medium transition-colors hover:opacity-80"
                    style={{
                      color: "#0D6EFD",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    View all alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Profile Dropdown ──────────────────────── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 h-9 px-2 rounded-lg transition-all hover:bg-white/5"
              style={{
                border: profileOpen
                  ? "1px solid rgba(175,23,99,0.3)"
                  : "1px solid transparent",
                background: profileOpen
                  ? "rgba(175,23,99,0.08)"
                  : "transparent",
                cursor: "pointer",
              }}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{
                  background: "linear-gradient(135deg, #AF1763, #7b0e44)",
                  boxShadow: "0 0 0 2px rgba(175,23,99,0.25)",
                }}
              >
                AD
              </div>
              <div className="hidden md:block text-left">
                <div
                  className="text-xs font-semibold leading-none"
                  style={{ color: "#f0f2f8" }}
                >
                  Admin User
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#5a6380" }}>
                  Super Admin
                </div>
              </div>
              <MdKeyboardArrowDown
                size={16}
                style={{
                  color: "#5a6380",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 top-12 rounded-xl py-1 overflow-hidden"
                style={{
                  width: "200px",
                  background: "#1e2230",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                  zIndex: 100,
                }}
              >
                {[
                  { label: "My Profile", icon: MdPerson },
                  { label: "Settings", icon: MdSettings },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5 text-left"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <ItemIcon size={16} style={{ color: "#a8b0c8" }} />
                      <span
                        className="text-sm"
                        style={{
                          color: "#a8b0c8",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                    margin: "4px 0",
                  }}
                />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5 text-left"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <MdLogout size={16} style={{ color: "#AB2E3C" }} />
                  <span
                    className="text-sm"
                    style={{
                      color: "#AB2E3C",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
