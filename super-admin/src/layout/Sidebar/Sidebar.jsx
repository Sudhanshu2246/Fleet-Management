import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { logout } from "../../Redux/Thunks/auth.thunks";
import {
  MdBusiness,
  MdViewList,
  MdAttachMoney,
  MdNotificationsActive,
  MdSettings,
  MdLogout,
  MdGpsFixed,
  MdChevronRight,
  MdChevronLeft,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const DASH = "/";

const NAV_GROUPS = [
  {
    label: "MANAGEMENT",
    items: [
      { id: "clients", to: `${DASH}clients`, label: "Client Management", icon: MdBusiness, badge: null, badgeCls: "" },
      { id: "plans", to: `${DASH}plans`, label: "Plan Management", icon: MdViewList, badge: null, badgeCls: "" },
      { id: "finance", to: `${DASH}finance`, label: "Finance Management", icon: MdAttachMoney, badge: null, badgeCls: "" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { id: "notifications", to: `${DASH}notifications`, label: "Notification Center", icon: MdNotificationsActive, badge: "3", badgeCls: "bg-red-500 text-white" },
      { id: "settings", to: `${DASH}settings`, label: "Settings", icon: MdSettings, badge: null, badgeCls: "" },
    ],
  },
];

export default function Sidebar({ collapsed, onCollapseToggle, mobileOpen, onMobileClose }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await dispatch(logout());
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-[#111827] border-r border-white/10
          shadow-[4px_0_24px_rgba(0,0,0,0.4)]
          transition-all duration-300 ease-in-out
          w-[260px] ${collapsed ? 'md:w-[72px]' : 'md:w-[260px]'}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
      {/* ── Logo / Brand ─────────────────────────────── */}
      <div
        className={`
          flex items-center shrink-0 overflow-hidden h-16
          border-b border-white/10
          ${collapsed ? "px-4.5 justify-center" : "px-5.5"}
        `}
      >
        <img 
          src={logo} 
          alt="FleetIQ" 
          className={`shrink-0 object-contain transition-all duration-300 ${collapsed ? "w-9 h-9" : "w-48 h-12"}`}
        />
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
      <div className={`mx-3 mt-3 shrink-0 rounded-lg items-center gap-2 px-3 py-2.5 bg-[#D4AF37]/[0.1] border border-[#D4AF37]/20 ${collapsed ? "flex md:hidden" : "flex"}`}>
        <RiSignalTowerFill className="text-[#D4AF37] shrink-0" size={16} />
        <div>
          <p className="text-xs font-semibold text-[#D4AF37] m-0">Network Active</p>
          <p className="text-xs text-white/50 m-0">All systems operational</p>
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
            <p className={`px-4 py-2 text-[10px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0 ${collapsed ? "block md:hidden" : "block"}`}>
              {group.label}
            </p>
            {collapsed && (
              <div className="hidden md:block my-1 mx-4 h-px bg-white/10" />
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;

              return (
                <NavLink
                  key={item.id}
                  to={item.to}
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
                      ? "bg-[#D4AF37]/15"
                      : isHovered
                        ? "bg-white/5 backdrop-blur-md/4"
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
                        ${isActive ? "text-[#D4AF37]" : isHovered ? "text-white" : "text-white/40"}
                      `}>
                        <Icon size={20} />
                      </span>

                      <span className={`text-sm font-medium truncate flex-1 text-left transition-colors duration-150
                        ${collapsed ? "block md:hidden" : "block"}
                        ${isActive ? "text-white" : isHovered ? "text-white" : "text-white/60"}
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

      {/* ── Bottom: User Profile ───────────────────── */}
      <div className="shrink-0 border-t border-white/10">
        <div
          className={`
            flex items-center gap-2.5
            bg-transparent
            ${collapsed ? "justify-start md:justify-center py-3.5 px-4 md:px-0" : "px-4 py-3.5"}
          `}
        >
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#111827] text-sm bg-[#D4AF37] ring-2 ring-[#D4AF37]/25">
            {getInitials(user?.name)}
          </div>

          <div className={`flex-1 min-w-0 ${collapsed ? "block md:hidden" : "block"}`}>
            <p className="text-sm font-semibold truncate text-white m-0">{user?.name || "Super Admin"}</p>
            <p className="text-xs truncate text-white/50 m-0">{user?.email || "admin@fleetiq.io"}</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white cursor-pointer border-none bg-transparent transition-colors ${collapsed ? "block md:hidden" : "block"}`}
            title="Logout"
          >
            <MdLogout size={18} />
          </button>
        </div>
      </div>
    </aside>

    {/* ── Logout Modal ────────────────────────────── */}
    <AnimatePresence>
      {showLogoutModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl flex flex-col items-center"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-500 mb-4">
              <MdLogout size={28} />
            </div>
            <h3 className="text-xl font-bold text-white text-center m-0 mb-2">Confirm Logout</h3>
            <p className="text-white/50 text-sm text-center m-0 mb-6">
              Are you sure you want to securely log out of your session?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-white/70 hover:bg-white/5 border border-white/10 transition-colors cursor-pointer bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer border-none"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
