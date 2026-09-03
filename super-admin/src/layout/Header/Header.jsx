import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/clients": "Client Management",
  "/plans": "Plan Management",
  "/finance": "Finance Management",
  "/notifications": "Notification Center",
  "/settings": "Settings",
};

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || "Dashboard";

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
    <header className="h-16 bg-[#111827] border-b border-white/10 flex items-center justify-between px-6 shadow-sm shrink-0">
      
      {/* ── Page Title ── */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-white m-0 tracking-wide">{currentTitle}</h1>
      </div>

      {/* ── User Profile ── */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white m-0">{user?.name || "Super Admin"}</p>
          <p className="text-xs text-white/50 m-0">{user?.role || "super_admin"}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#111827] text-sm bg-[#D4AF37] ring-2 ring-[#D4AF37]/25 cursor-pointer">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Header;
