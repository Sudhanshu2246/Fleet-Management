import { useState } from "react";
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
  MdCircle,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import { NavLink } from "react-router-dom";

// ─── Nav structure from SOW ────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Live Dashboard",
        icon: MdDashboard,
        badge: null,
        badgeColor: "",
      },
      {
        id: "fleet-map",
        label: "Live Fleet Map",
        icon: MdMap,
        badge: "LIVE",
        badgeColor: "bg-[#AF1763]",
      },
      {
        id: "alerts",
        label: "Alerts",
        icon: MdNotificationsActive,
        badge: "3",
        badgeColor: "bg-[#AB2E3C]",
      },
    ],
  },
  {
    label: "TRACKING",
    items: [
      {
        id: "trip-history",
        label: "Trip History & Replay",
        icon: MdHistory,
        badge: null,
        badgeColor: "",
      },
      {
        id: "geofence",
        label: "Geofence Management",
        icon: MdRadar,
        badge: null,
        badgeColor: "",
      },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        id: "vehicles",
        label: "Vehicle Management",
        icon: MdDirectionsCar,
        badge: null,
        badgeColor: "",
      },
      {
        id: "users",
        label: "User Management",
        icon: MdPeople,
        badge: null,
        badgeColor: "",
      },
      {
        id: "organizations",
        label: "Organizations",
        icon: MdBusiness,
        badge: null,
        badgeColor: "",
      },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      {
        id: "reports",
        label: "Reports & Analytics",
        icon: MdBarChart,
        badge: null,
        badgeColor: "",
      },
      {
        id: "security",
        label: "Security & Audit",
        icon: MdSecurity,
        badge: null,
        badgeColor: "",
      },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed,
  activePage,
  onCollapseToggle,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);


  return (
    <>
      {/* Sidebar container */}
      <aside
        className="fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? "72px" : "260px",
          background: "#191C24",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* ── Logo / Brand ─────────────────────────────── */}
        <div
          className="flex items-center shrink-0 overflow-hidden"
          style={{
            height: "64px",
            padding: collapsed ? "0 18px" : "0 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Icon mark */}
          <div
            className="flex items-center justify-center shrink-0 rounded-lg"
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #AF1763 0%, #7b0e44 100%)",
              boxShadow: "0 4px 14px rgba(175,23,99,0.45)",
            }}
          >
            <MdGpsFixed className="text-white" size={20} />
          </div>

          {/* Brand name — hidden when collapsed */}
          <div
            className="ml-3 overflow-hidden transition-all duration-300"
            style={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="font-bold tracking-tight leading-none"
              style={{
                fontSize: "15px",
                color: "#f0f2f8",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Fleetiq
            </div>
            <div
              className="text-xs mt-0.5"
              style={{
                color: "#AF1763",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              ADMIN
            </div>
          </div>

          {/* Live pulse indicator */}
          {!collapsed && (
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "#198754" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "#198754" }}
                />
              </span>
            </div>
          )}
        </div>

        {/* ── Collapse toggle ───────────────────────────── */}
        <button
          onClick={onCollapseToggle}
          className="absolute flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
          style={{
            top: "44px",
            right: "-13px",
            width: "26px",
            height: "26px",
            background: "#AF1763",
            border: "2px solid #191C24",
            color: "#fff",
            zIndex: 10,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(175,23,99,0.5)",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <MdChevronRight size={14} />
          ) : (
            <MdChevronLeft size={14} />
          )}
        </button>

        {/* ── Live Status Strip ─────────────────────────── */}
        {!collapsed && (
          <div
            className="mx-3 mt-3 rounded-lg flex items-center gap-2 shrink-0"
            style={{
              padding: "10px 12px",
              background: "rgba(13,110,253,0.08)",
              border: "1px solid rgba(13,110,253,0.2)",
            }}
          >
            <RiSignalTowerFill style={{ color: "#0D6EFD" }} size={16} />
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: "#0DCAF0" }}
              >
                WebSocket Active
              </div>
              <div className="text-xs" style={{ color: "#5a6380" }}>
                3,842 devices online
              </div>
            </div>
            <div className="ml-auto">
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(25,135,84,0.15)",
                  color: "#198754",
                  border: "1px solid rgba(25,135,84,0.3)",
                }}
              >
                LIVE
              </span>
            </div>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto py-3"
          style={{ scrollbarWidth: "none" }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {/* Group label */}
              {!collapsed && (
                <div
                  className="px-4 py-2 text-xs font-semibold tracking-widest"
                  style={{ color: "#5a6380", letterSpacing: "0.12em" }}
                >
                  {group.label}
                </div>
              )}
              {collapsed && (
                <div
                  className="my-1 mx-4"
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.05)",
                  }}
                />
              )}

              {/* Nav items */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                const isHovered = hoveredItem === item.id;

                return (
                  <NavLink
                    key={item.id}
                    to={`/${item.id}`}
                    end
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={collapsed ? item.label : ""}
                    className="w-full flex items-center relative transition-all duration-150"
                    style={{
                      padding: collapsed ? "11px 0" : "10px 14px 10px 16px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: "12px",
                      marginBottom: "1px",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(175,23,99,0.18) 0%, rgba(175,23,99,0.04) 100%)"
                        : isHovered
                          ? "rgba(255,255,255,0.04)"
                          : "transparent",
                      borderRadius: "8px",
                      margin: "0 8px 1px 8px",
                      width: "calc(100% - 16px)",
                      cursor: "pointer",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1 bottom-1 rounded-r"
                        style={{
                          width: "3px",
                          background: "#AF1763",
                          borderRadius: "0 3px 3px 0",
                        }}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        color: isActive
                          ? "#AF1763"
                          : isHovered
                            ? "#f0f2f8"
                            : "#a8b0c8",
                      }}
                    >
                      <Icon size={20} />
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        className="text-sm font-medium truncate flex-1 text-left transition-colors duration-150"
                        style={{
                          color: isActive
                            ? "#f0f2f8"
                            : isHovered
                              ? "#f0f2f8"
                              : "#a8b0c8",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0 ${item.badgeColor}`}
                        style={{ fontSize: "10px", letterSpacing: "0.04em" }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed badge dot */}
                    {collapsed && item.badge && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{
                          background: item.badgeColor.includes("AB2E3C")
                            ? "#AB2E3C"
                            : "#AF1763",
                        }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom: Settings + User ───────────────────── */}
        <div
          className="shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Settings */}
          <button
            className="w-full flex items-center transition-colors duration-150 hover:bg-white/5"
            style={{
              padding: collapsed ? "14px 0" : "12px 22px",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color: "#5a6380",
            }}
            onClick={() => handleNav("settings")}
          >
            <MdSettings size={20} />
            {!collapsed && (
              <span
                className="text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Settings
              </span>
            )}
          </button>

          {/* User Profile Card */}
          <div
            className="flex items-center"
            style={{
              padding: collapsed ? "14px 0" : "14px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "10px",
              background: "rgba(255,255,255,0.025)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Avatar */}
            <div
              className="shrink-0 rounded-full flex items-center justify-center font-bold text-white text-sm"
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #AF1763, #7b0e44)",
                boxShadow: "0 0 0 2px rgba(175,23,99,0.3)",
                flexShrink: 0,
              }}
            >
              AD
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: "#f0f2f8" }}
                  >
                    Admin User
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "#5a6380" }}
                  >
                    admin@fleetiq.io
                  </div>
                </div>
                <button
                  className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{
                    color: "#5a6380",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                  }}
                  title="Logout"
                >
                  <MdLogout size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
