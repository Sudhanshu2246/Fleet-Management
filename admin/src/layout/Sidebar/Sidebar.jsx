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
      { id: "vehicles", to: `${DASH}/vehicles`, label: "Vehicle Management",  icon: MdDirectionsCar, badge: null, badgeCls: "" },
      { id: "drivers",  to: `${DASH}/drivers`,  label: "Drivers Management",  icon: MdPeople,        badge: null, badgeCls: "" },
      { id: "assign-vehicle", to: `${DASH}/assign-vehicle`, label: "Assign Vehicle", icon: MdAssignment, badge: null, badgeCls: "" },
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

export default function Sidebar({ collapsed, onCollapseToggle }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
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
        ${collapsed ? "w-18" : "w-65"}
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
            ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
          `}
        >
          <p className="text-[15px] font-bold tracking-tight leading-none text-[#111827] m-0">
            Fleet<span className="text-[#D4AF37]">IQ</span>
          </p>
          <p className="text-xs mt-0.5 text-[#D4AF37] font-semibold tracking-[0.08em] m-0">
            {user?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
          </p>
        </div>

        {!collapsed && (
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────── */}
      <button
        onClick={onCollapseToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="
          absolute top-11 -right-3.25 z-10
          flex items-center justify-center
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
      {!collapsed && (
        <div className="mx-3 mt-3 shrink-0 rounded-lg flex items-center gap-2 px-3 py-2.5 bg-[#D4AF37]/[0.07] border border-[#D4AF37]/20">
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
      )}

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:none]">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed ? (
              <p className="px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-[#111827]/60 uppercase m-0">
                {group.label}
              </p>
            ) : (
              <div className="my-1 mx-4 h-px bg-[#111827]/10" />
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;

              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 mx-2 mb-px
                    w-[calc(100%-16px)] rounded-lg
                    transition-all duration-150 cursor-pointer no-underline
                    ${collapsed ? "justify-center py-2.75 px-0" : "px-4 py-2.5"}
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

                      {!collapsed && (
                        <span className={`text-sm font-medium truncate flex-1 text-left transition-colors duration-150
                          ${isActive ? "text-[#111827]" : isHovered ? "text-[#111827]" : "text-[#111827]/40"}
                        `}>
                          {item.label}
                        </span>
                      )}

                      {!collapsed && item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-[0.04em] ${item.badgeCls}`}>
                          {item.badge}
                        </span>
                      )}

                      {collapsed && item.badge && (
                        <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full
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
            ${collapsed ? "justify-center py-3.5 px-0" : "px-5.5 py-3"}
          `}
        >
          <MdSettings size={20} />
          {!collapsed && (
            <span className="text-sm">Settings</span>
          )}
        </button>

        <div
          className={`
            flex items-center gap-2.5
            bg-white/65 backdrop-blur-md/2.5 border-t border-[#111827]/10
            ${collapsed ? "justify-center py-3.5 px-0" : "px-4 py-3.5"}
          `}
        >
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#111827] text-sm bg-[#D4AF37] ring-2 ring-[#D4AF37]/25">
            {getInitials(user?.name)}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-[#111827] m-0">{user?.name || "Admin User"}</p>
                <p className="text-xs truncate text-[#111827]/50 m-0">{user?.email || "admin@fleetiq.io"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/65 backdrop-blur-md/10 text-[#111827]/50 cursor-pointer border-none bg-transparent transition-colors"
                title="Logout"
              >
                <MdLogout size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}