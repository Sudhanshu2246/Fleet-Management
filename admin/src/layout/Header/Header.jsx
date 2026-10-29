import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/Thunks/auth.thunks";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdNotificationsActive,
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
  MdMenu,
  MdGpsFixed,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

import { subscribeToAlerts } from "../../config/firebase";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "sos",
    title: "SOS Alert",
    message: "Vehicle VH-4821 triggered SOS — Chennai Highway",
    time: "2m ago",
    read: false,
    colorCls: "text-[#FF5C5C]",
    bgCls: "bg-[#FF5C5C]/10 border border-[#FF5C5C]/20",
    icon: MdWarning,
  },
  {
    id: 2,
    type: "geofence",
    title: "Geofence Exit",
    message: "Driver UID-2291 exited Zone B perimeter",
    time: "8m ago",
    read: false,
    colorCls: "text-amber-400",
    bgCls: "bg-amber-500/10 border border-amber-500/20",
    icon: MdGpsOff,
  },
  {
    id: 3,
    type: "battery",
    title: "Low Battery",
    message: "Device DEV-0093 battery at 9% — may go offline",
    time: "14m ago",
    read: false,
    colorCls: "text-amber-400",
    bgCls: "bg-amber-500/10 border border-amber-500/20",
    icon: MdBatteryAlert,
  },
  {
    id: 4,
    type: "system",
    title: "System Healthy",
    message: "All 4 microservices running. WebSocket latency 48ms",
    time: "1h ago",
    read: true,
    colorCls: "text-[#D4AF37]",
    bgCls: "bg-[#D4AF37]/10 border border-[#D4AF37]/20",
    icon: MdCheckCircle,
  },
];

const LIVE_STATS = [
  { label: "Active",  value: "3,842", dotCls: "bg-[#D4AF37]" },
  { label: "Idle",    value: "641",   dotCls: "bg-amber-400" },
  { label: "Offline", value: "517",   dotCls: "bg-[#FF5C5C]" },
];

const getAlertStyle = (priority, type) => {
  const p = (priority || "").toLowerCase();
  const t = (type || "").toLowerCase();
  if (p === "critical" || t.includes("sos") || t.includes("collision")) {
    return {
      colorCls: "text-[#FF5C5C]",
      bgCls: "bg-[#FF5C5C]/10 border border-[#FF5C5C]/20",
      icon: MdWarning,
    };
  }
  if (p === "high" || t.includes("overspeed") || t.includes("speed")) {
    return {
      colorCls: "text-amber-400",
      bgCls: "bg-amber-500/10 border border-amber-500/20",
      icon: MdGpsOff,
    };
  }
  if (t.includes("battery")) {
    return {
      colorCls: "text-amber-400",
      bgCls: "bg-amber-500/10 border border-amber-500/20",
      icon: MdBatteryAlert,
    };
  }
  return {
    colorCls: "text-[#D4AF37]",
    bgCls: "bg-[#D4AF37]/10 border border-[#D4AF37]/20",
    icon: MdCheckCircle,
  };
};

const formatTimeAgo = (ts, fallbackIso) => {
  const val = ts || fallbackIso;
  if (!val) return "Just now";
  const date = val?.toDate ? val.toDate() : new Date(val);
  if (isNaN(date.getTime())) return "Recently";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export default function Header({ onMenuToggle, collapsed }) {
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchVal,   setSearchVal]   = useState("");
  const [fullscreen,  setFullscreen]  = useState(false);
  const [wsLatency,   setWsLatency]   = useState(48);
  const [liveAlerts,  setLiveAlerts]  = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = subscribeToAlerts((alerts) => {
        if (Array.isArray(alerts)) {
          setLiveAlerts(alerts);
        }
      });
    } catch (e) {}
    return () => unsub();
  }, []);

  const activeAlerts = liveAlerts.filter((a) => (a.status || "").toLowerCase() === "active");
  const unread = liveAlerts.length > 0 ? activeAlerts.length : NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  // ── Helper: Get initials ───────────────────────
  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const roleLabel = (role) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "company_admin") return "Company Admin";
    return "Admin";
  };

  return (
    <header className="sticky top-0 z-40 flex flex-col shrink-0 bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between h-16 px-4 gap-3">
        {/* Hamburger Menu & Logo (Mobile Only) */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800/60 transition-colors bg-transparent border-none cursor-pointer shrink-0"
          >
            <MdMenu size={24} />
          </button>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-[#D4AF37] shadow-[0_2px_8px_rgba(212,175,55,0.35)]">
              <MdGpsFixed className="text-[#0B0F17]" size={18} />
            </div>
            <div className="ml-2">
              <p className="text-[14px] font-bold tracking-tight leading-none text-white m-0">
                Fleet<span className="text-[#D4AF37]">IQ</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Live Stats Strip ───────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {LIVE_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#1E293B]/70 border border-[#334155]/50 ${i < LIVE_STATS.length - 1 ? "mr-1" : ""}`}
            >
              <MdCircle size={8} className={s.dotCls} />
              <span className="text-xs font-semibold text-white">{s.value}</span>
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Right Actions ───────────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto">

          {/* WS Latency chip */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25">
            <RiSignalTowerFill size={13} className="text-[#D4AF37]" />
            <span className="text-xs font-mono font-semibold text-[#D4AF37]">{wsLatency}ms</span>
          </div>

          {/* Refresh */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors bg-transparent border-none cursor-pointer"
            title="Refresh data"
          >
            <MdRefresh size={19} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors bg-transparent border-none cursor-pointer"
            title="Toggle fullscreen"
          >
            {fullscreen ? <MdFullscreenExit size={19} /> : <MdFullscreen size={19} />}
          </button>

          {/* Divider */}
          <div className="w-px h-6 mx-1 bg-slate-800" />

          {/* ── Notification Bell ─────────────────────── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg
                relative transition-all border-none cursor-pointer
                ${notifOpen
                  ? "text-[#D4AF37] bg-[#D4AF37]/15"
                  : "text-slate-400 bg-transparent hover:text-white hover:bg-slate-800/60"
                }
              `}
            >
              <MdNotificationsActive size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#FF5C5C] text-white font-bold text-[9px] border-2 border-[#0F172A]">
                  {unread}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-85 rounded-xl overflow-hidden bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/60 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-100">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unread > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <button className="text-xs font-medium text-[#D4AF37] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity">
                    Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div className="max-h-80 overflow-y-auto [scrollbar-width:thin]">
                  {(liveAlerts.length > 0 ? liveAlerts.slice(0, 6) : NOTIFICATIONS).map((n) => {
                    const isLive = liveAlerts.length > 0;
                    const style = isLive ? getAlertStyle(n.priority, n.type) : n;
                    const NIcon = style.icon;
                    const title = isLive ? (n.title || (n.type ? n.type.toUpperCase() : "Alert")) : n.title;
                    const message = isLive ? (n.message || n.details || `Triggered by ${n.vehicleId || "Vehicle"}`) : n.message;
                    const time = isLive ? formatTimeAgo(n.createdAt, n.createdAtIso) : n.time;
                    const isUnread = isLive ? (n.status || "").toLowerCase() === "active" : !n.read;

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/dashboard/alerts");
                        }}
                        className={`
                          flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-800/60
                          border-b border-slate-800/60
                          ${isUnread ? "bg-[#D4AF37]/5" : "bg-transparent"}
                        `}
                      >
                        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${style.bgCls}`}>
                          <NIcon size={17} className={style.colorCls} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold ${style.colorCls}`}>{title}</span>
                            <span className="text-xs text-slate-500 shrink-0">{time}</span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed text-slate-300 m-0 truncate">{message}</p>
                        </div>
                        {isUnread && (
                          <div className="shrink-0 mt-2">
                            <MdCircle size={7} className="text-[#D4AF37]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 text-center border-t border-slate-800">
                  <button 
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/dashboard/alerts");
                    }}
                    className="text-xs font-medium text-[#D4AF37] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    View all alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Profile Chip & Dropdown ──────────────────────── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 h-9 px-2 rounded-lg transition-all bg-transparent hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 cursor-pointer"
              title="User Account"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#0B0F17] font-black text-xs shrink-0 bg-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                  {user?.name || "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                  {roleLabel(user?.role)}
                </span>
              </div>
              <MdKeyboardArrowDown size={16} className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-xl overflow-hidden bg-[#0F172A]/95 backdrop-blur-xl border border-slate-700/70 shadow-2xl z-100 p-1.5 animate-fadeIn">
                <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.name || "Admin User"}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user?.email || "admin@fleetiq.com"}
                  </div>
                  <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {roleLabel(user?.role)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                >
                  <MdSettings size={16} className="text-[#D4AF37]" />
                  <span>System Settings</span>
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                >
                  <MdLogout size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}