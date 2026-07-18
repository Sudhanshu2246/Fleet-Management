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
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

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

export default function Header({ onMenuToggle, collapsed }) {
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchVal,   setSearchVal]   = useState("");
  const [fullscreen,  setFullscreen]  = useState(false);
  const [wsLatency,   setWsLatency]   = useState(48);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

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
    navigate("/login");
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
    <header className="sticky top-0 z-40 flex flex-col shrink-0 bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10 border-b border-[#111827]/10 shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 px-4 gap-3">
        {/* Hamburger Menu (Mobile Only) */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#111827]/60 hover:bg-white/65 backdrop-blur-md/5 transition-colors bg-transparent border-none cursor-pointer shrink-0"
        >
          <MdMenu size={24} />
        </button>

        {/* ── Search Bar ─────────────────────────────────── */}
        <div ref={searchRef} className="relative flex-1 max-w-sm">
          <div
            onClick={() => setSearchOpen(true)}
            className={`
              flex items-center gap-2.5 rounded-lg px-3 h-9 cursor-text
              transition-all duration-200 bg-white/65 backdrop-blur-md/5
              ${searchOpen
                ? "border border-[#D4AF37]/50"
                : "border border-white/[0.07]"
              }
            `}
          >
            <MdSearch size={17} className="text-[#111827]/60 shrink-0" />
            <input
              type="text"
              placeholder="Search vehicles, drivers, trips..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none border-none text-[#111827] placeholder:text-[#111827]/60 caret-[#D4AF37]"
            />
            {searchVal && (
              <button
                onClick={() => setSearchVal("")}
                className="shrink-0 text-[#111827]/60 bg-transparent border-none cursor-pointer"
              >
                <MdClose size={15} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchVal && (
            <div className="absolute top-11 left-0 w-full rounded-xl overflow-hidden py-1 bg-white/65 backdrop-blur-md border border-[#111827]/8 shadow-[0_16px_48px_rgba(0,0,0,0.15)] z-50">
              {["Vehicle VH-4821", "Driver John Smith", "Trip #TR-9920"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10/5 transition-colors"
                >
                  <MdSearch size={14} className="text-[#111827]/60" />
                  <span className="text-sm text-[#111827]/40">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Live Stats Strip ───────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {LIVE_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/65 backdrop-blur-md/4 border border-[#111827]/10 ${i < LIVE_STATS.length - 1 ? "mr-1" : ""}`}
            >
              <MdCircle size={8} className={s.dotCls} />
              <span className="text-xs font-semibold text-[#111827]">{s.value}</span>
              <span className="text-xs text-[#111827]/60">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Right Actions ───────────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto">

          {/* WS Latency chip */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/8 border border-[#D4AF37]/15">
            <RiSignalTowerFill size={13} className="text-[#D4AF37]" />
            <span className="text-xs font-mono font-semibold text-[#D4AF37]">{wsLatency}ms</span>
          </div>

          {/* Refresh */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#111827]/40 hover:bg-white/65 backdrop-blur-md/5 transition-colors bg-transparent border-none cursor-pointer"
            title="Refresh data"
          >
            <MdRefresh size={19} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-[#111827]/40 hover:bg-white/65 backdrop-blur-md/5 transition-colors bg-transparent border-none cursor-pointer"
            title="Toggle fullscreen"
          >
            {fullscreen ? <MdFullscreenExit size={19} /> : <MdFullscreen size={19} />}
          </button>

          {/* Divider */}
          <div className="w-px h-6 mx-1 bg-white/65 backdrop-blur-md/8" />

          {/* ── Notification Bell ─────────────────────── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg
                relative transition-all border-none cursor-pointer
                ${notifOpen
                  ? "text-[#D4AF37] bg-[#D4AF37]/10"
                  : "text-[#111827]/40 bg-transparent hover:bg-white/65 backdrop-blur-md/5"
                }
              `}
            >
              <MdNotificationsActive size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4.25 h-4.25 rounded-full bg-[#FF5C5C] text-[#111827] font-bold text-[9px] border-2 border-[#111827]">
                  {unread}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-85 rounded-xl overflow-hidden bg-white/65 backdrop-blur-md border border-[#111827]/8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-100">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#111827]/6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#111827]">Notifications</span>
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
                  {NOTIFICATIONS.map((n) => {
                    const NIcon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`
                          flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10/4
                          border-b border-[#111827]/4
                          ${!n.read ? "bg-[#D4AF37]/4" : "bg-transparent"}
                        `}
                      >
                        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 ${n.bgCls}`}>
                          <NIcon size={17} className={n.colorCls} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold ${n.colorCls}`}>{n.title}</span>
                            <span className="text-xs text-[#111827]/60 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed text-[#111827]/40 m-0">{n.message}</p>
                        </div>
                        {!n.read && (
                          <div className="shrink-0 mt-2">
                            <MdCircle size={7} className="text-[#D4AF37]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 text-center border-t border-[#111827]/10">
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

          {/* ── Profile Dropdown ──────────────────────── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className={`
                flex items-center gap-2.5 h-9 px-2 rounded-lg
                transition-all cursor-pointer bg-transparent
                ${profileOpen
                  ? "border border-[#D4AF37]/30 bg-[#D4AF37]/8"
                  : "border border-transparent hover:bg-white/65 backdrop-blur-md/5"
                }
              `}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#111827] font-bold text-xs shrink-0 bg-[#D4AF37] ring-2 ring-[#D4AF37]/25">
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-none text-[#111827] m-0">{user?.name || "Admin User"}</p>
                <p className="text-xs mt-0.5 text-[#111827]/60 m-0">{roleLabel(user?.role)}</p>
              </div>
              <MdKeyboardArrowDown
                size={16}
                className={`text-[#111827]/60 transition-transform duration-200 ${profileOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <div className="absolute right-0 top-12 w-50 rounded-xl py-1 overflow-hidden bg-white/65 backdrop-blur-md border border-[#111827]/8 shadow-[0_16px_48px_rgba(0,0,0,0.15)] z-100">
                {[
                  { label: "My Profile", icon: MdPerson },
                  { label: "Settings",   icon: MdSettings },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10/5 text-left bg-transparent border-none cursor-pointer"
                    >
                      <ItemIcon size={16} className="text-[#111827]/40" />
                      <span className="text-sm text-[#111827]/40">{item.label}</span>
                    </button>
                  );
                })}
                <div className="h-px bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10/6 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/65 backdrop-blur-xl border-b border-[#0C0D0D]/10/5 text-left bg-transparent border-none cursor-pointer"
                >
                  <MdLogout size={16} className="text-[#FF5C5C]" />
                  <span className="text-sm text-[#FF5C5C]">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}