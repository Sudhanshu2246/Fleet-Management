import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../Redux/Thunks/auth.thunks";
import {
  MdDashboard,
  MdMap,
  MdHistory,
  MdNotificationsActive,
  MdDirectionsCar,
  MdPeople,
  MdRadar,
  MdBarChart,
  MdBusiness,
  MdSecurity,
  MdChevronRight,
  MdChevronLeft,
  MdGpsFixed,
  MdLogout,
  MdSettings,
  MdAssignment,
  MdPerson,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import { NavLink } from "react-router-dom";

// Base route for the admin dashboard area
const DASH = "/dashboard";

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { id: "dashboard",  to: `${DASH}`,             label: "Live Dashboard",       icon: MdDashboard,           badge: null,  badgeCls: "" },
      { id: "fleet-map",  to: `${DASH}/fleet-map`,   label: "Live Fleet Map",        icon: MdMap,                 badge: "LIVE",badgeCls: "bg-cyan-400 text-[#0B0F19]" },
      { id: "alerts",     to: `${DASH}/alerts`,      label: "Alerts",               icon: MdNotificationsActive, badge: "3",   badgeCls: "bg-red-500 text-white" },
    ],
  },
  {
    label: "TRACKING",
    items: [
      { id: "trip-history", to: `${DASH}/trip-history`, label: "Trip History & Replay", icon: MdHistory, badge: null, badgeCls: "" },
      { id: "geofence",     to: `${DASH}/geofence`,     label: "Geofence Management",   icon: MdRadar,   badge: null, badgeCls: "" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { id: "trips",          to: `${DASH}/trips`,          label: "Trip Management",    icon: MdAssignment,    badge: null, badgeCls: "" },
      { id: "vehicles",       to: `${DASH}/vehicles`,       label: "Vehicle Management", icon: MdDirectionsCar, badge: null, badgeCls: "" },
      { id: "drivers",        to: `${DASH}/drivers`,        label: "Drivers Management", icon: MdPerson,        badge: null, badgeCls: "" },
      { id: "assign-vehicle", to: `${DASH}/assign-vehicle`, label: "Assign Vehicle",     icon: MdAssignment,    badge: null, badgeCls: "" },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { id: "reports",  to: `${DASH}/reports`,  label: "Reports & Analytics", icon: MdBarChart, badge: null, badgeCls: "" },
      { id: "security", to: `${DASH}/security`, label: "Security & Audit",    icon: MdSecurity, badge: null, badgeCls: "" },
    ],
  },
];

export default function Sidebar({ collapsed, onCollapseToggle, mobileOpen, onMobileClose }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-[#F0F4F8] border-r border-[#111827]/10
        shadow-[4px_0_24px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-in-out
        w-[260px] ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
    >
      {/* ── Logo / Brand ─────────────────────────────── */}
      <div
        className={`
          flex items-center shrink-0 overflow-hidden h-16
          border-b border-[#111827]/10
          ${collapsed ? "px-4.5" : "px-5.5"}
        `}
      >
        <div className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg bg-[#D4AF37] shadow-[0_4px_14px_rgba(212,175,55,0.35)]">
          <MdGpsFixed className="text-[#111827]" size={20} />
        </div>

        <div
          className={`
            ml-3 overflow-hidden whitespace-nowrap transition-all duration-300
            ${collapsed ? "opacity-100 w-auto md:opacity-0 md:w-0" : "opacity-100 w-auto"}
          `}
        >
          <p className="text-[15px] font-bold tracking-tight leading-none text-[#111827] m-0">
            Fleet<span className="text-[#D4AF37]">IQ</span>
          </p>
          <p className="text-xs mt-0.5 text-[#D4AF37] font-semibold tracking-[0.08em] m-0">
            {user?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
          </p>
        </div>

        <div className={`ml-auto items-center gap-1.5 shrink-0 ${collapsed ? "flex md:hidden" : "flex"}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
          </span>
        </div>
      </div>

      {/* ── Collapse toggle ───────────────────────────── */}
      <button
        onClick={onCollapseToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="
          hidden md:flex
          absolute top-11 -right-3.25 z-10
          items-center justify-center
          w-6.5 h-6.5 rounded-full
          bg-[#D4AF37]
          border-2 border-[#111827] text-[#111827] cursor-pointer
          shadow-[0_2px_8px_rgba(212,175,55,0.4)]
          hover:scale-110 transition-transform duration-200
        "
      >
        {collapsed ? <MdChevronRight size={14} /> : <MdChevronLeft size={14} />}
      </button>

      {/* ── Live Status Strip ─────────────────────────── */}
      {/* ── Live Status Strip ─────────────────────────── */}
      <div className={`mx-3 mt-3 shrink-0 rounded-lg items-center gap-2 px-3 py-2.5 bg-[#D4AF37]/[0.07] border border-[#D4AF37]/20 ${collapsed ? "flex md:hidden" : "flex"}`}>
        <RiSignalTowerFill className="text-[#D4AF37] shrink-0" size={16} />
        <div>
          <p className="text-xs font-semibold text-[#D4AF37] m-0">WebSocket Active</p>
          <p className="text-xs text-[#111827]/50 m-0">3,842 devices online</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            LIVE
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:none]">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <p className={`px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-[#111827]/60 uppercase m-0 ${collapsed ? "block md:hidden" : "block"}`}>
              {group.label}
            </p>
            {collapsed && (
              <div className="hidden md:block my-1 mx-4 h-px bg-[#111827]/10" />
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;

              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end
                  onClick={() => {
                    if (onMobileClose && window.innerWidth < 768) {
                      onMobileClose();
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 mx-2 mb-px
                    w-[calc(100%-16px)] rounded-lg
                    transition-all duration-150 cursor-pointer no-underline
                    ${collapsed ? "justify-start md:justify-center py-2.5 md:py-2.75 px-4 md:px-0" : "px-4 py-2.5"}
                    ${isActive
                      ? "bg-[#D4AF37]/10"
                      : isHovered
                        ? "bg-white/65 backdrop-blur-md/4"
                        : "bg-transparent"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-0.75 rounded-r bg-[#D4AF37]" />
                      )}

                      <span className={`shrink-0 flex items-center justify-center transition-colors duration-150
                        ${isActive ? "text-[#D4AF37]" : isHovered ? "text-[#111827]" : "text-[#111827]/40"}
                      `}>
                        <Icon size={20} />
                      </span>

                      <span className={`text-sm font-medium truncate flex-1 text-left transition-colors duration-150
                        ${collapsed ? "block md:hidden" : "block"}
                        ${isActive ? "text-[#111827]" : isHovered ? "text-[#111827]" : "text-[#111827]/40"}
                      `}>
                        {item.label}
                      </span>

                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-[0.04em] ${item.badgeCls} ${collapsed ? "flex md:hidden" : "flex"}`}>
                          {item.badge}
                        </span>
                      )}

                      {collapsed && item.badge && (
                        <span className={`hidden md:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                          ${item.badgeCls.includes("red") ? "bg-[#FF5C5C]" : "bg-[#D4AF37]"}
                        `} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Settings + User ───────────────────── */}
      <div className="shrink-0 border-t border-[#111827]/10">
        <button
          className={`
            w-full flex items-center gap-3
            hover:bg-white/65 backdrop-blur-md/5 text-[#111827]/50 cursor-pointer
            bg-transparent border-none transition-colors duration-150
            ${collapsed ? "justify-start md:justify-center py-3 md:py-3.5 px-5.5 md:px-0" : "px-5.5 py-3"}
          `}
        >
          <MdSettings size={20} />
          <span className={`text-sm ${collapsed ? "inline md:hidden" : "inline"}`}>Settings</span>
        </button>

        <div
          onClick={() => navigate(`${DASH}/my-profile`)}
          className={`
            flex items-center gap-2.5 cursor-pointer hover:bg-black/5 transition-colors
            bg-white/65 backdrop-blur-md/2.5 border-t border-[#111827]/10
            ${collapsed ? "justify-start md:justify-center py-3.5 px-4 md:px-0" : "px-4 py-3.5"}
          `}
        >
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#111827] text-sm bg-[#D4AF37] ring-2 ring-[#D4AF37]/25">
            {getInitials(user?.name)}
          </div>

          <div className={`flex-1 min-w-0 ${collapsed ? "block md:hidden" : "block"}`}>
            <p className="text-sm font-semibold truncate text-[#111827] m-0">{user?.name || "Admin User"}</p>
            <p className="text-xs truncate text-[#111827]/50 m-0">{user?.email || "admin@fleetiq.io"}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className={`shrink-0 p-1.5 rounded-lg hover:bg-white/65 backdrop-blur-md/10 text-[#111827]/50 cursor-pointer border-none bg-transparent transition-colors ${collapsed ? "block md:hidden" : "block"}`}
            title="Logout"
          >
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}