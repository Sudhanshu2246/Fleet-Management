import { createBrowserRouter, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/admin/Dashboard";
import Register from "../pages/auth/Registration";
import Vehicles from "../pages/admin/Vehicles";
import Home from "../pages/Landing/Home";
import DriverManagement from "../pages/admin/DriverManagement";
import AssignVehicle from "../pages/admin/AssignVehicle";
import MyProfile from "../pages/auth/MyProfile";
import Trips from "../pages/admin/Trips";

import Alerts from "../pages/admin/Alerts";
import LiveFleetMap from "../pages/admin/LiveFleetMap";

/**
 * App Router
 * ─────────────────────────────────────────────────────────────────────────
 * Auth pages (Login, Register) sit OUTSIDE the Layout shell — no sidebar/header.
 * All admin pages are nested under Layout — they render into <Outlet />.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const appRouter = createBrowserRouter([
  /* ── Public routes ─────────────────────────────── */
  { path: "/", element: <Home /> }, // ✅ First page
  { path: "/register", element: <Register /> },

  /* ── Admin routes (with Layout) ───────────────── */
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> }, // /dashboard
      { path: "my-profile", element: <MyProfile /> },

      {
        path: "fleet-map",
        element: <LiveFleetMap />,
      },
      { path: "alerts", element: <Alerts /> },
      {
        path: "trip-history",
        element: <PlaceholderPage title="Trip History & Replay" />,
      },
      {
        path: "geofence",
        element: <PlaceholderPage title="Geofence Management" />,
      },
      { path: "trips", element: <Trips /> },
      { path: "vehicles", element: <Vehicles /> },
      { path: "drivers", element: <DriverManagement /> },
      {
        path: "assign-vehicle",
        element: <AssignVehicle />,
      },
      {
        path: "reports",
        element: <PlaceholderPage title="Reports & Analytics" />,
      },
      {
        path: "security",
        element: <PlaceholderPage title="Security & Audit Logs" />,
      },
      { path: "settings", element: <PlaceholderPage title="Settings" /> },
    ],
  },

  /* ── Fallback ─────────────────────────────── */
  { path: "*", element: <Home /> },
]);

/* ── Temporary placeholder for unbuilt pages ────────────────────────────── */
function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#EDECF1] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-[#19C853] tracking-wide">
            Fleetiq
          </span>
          <span className="text-xs text-[#0C0D0D]/20">/</span>
          <span className="text-xs text-[#0C0D0D]/40">{title}</span>
        </nav>

        <h1 className="text-2xl font-black text-[#0C0D0D] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Placeholder Card */}
      <div className="relative rounded-xl border border-[#0C0D0D]/6 bg-white overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#19C853]/10 blur-3xl rounded-full" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center text-center px-6 py-20 gap-5">
          {/* Icon */}
          <div className="text-5xl">🚧</div>

          {/* Title */}
          <h2 className="text-lg font-bold text-[#0C0D0D] tracking-tight">
            {title} Module
          </h2>

          {/* Description */}
          <p className="text-sm text-[#0C0D0D]/40 max-w-md leading-relaxed">
            This section is currently under development. Once completed, it will
            provide full control and insights for{" "}
            <span className="text-[#19C853] font-semibold">
              {title.toLowerCase()}
            </span>{" "}
            management inside your fleet system.
          </p>

          {/* Badge */}
          <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            🚀 Coming Soon
          </span>

          {/* CTA */}
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-5 py-2 rounded-lg text-xs font-bold bg-[#19C853] text-white shadow-lg shadow-[#19C853]/25 hover:shadow-[#19C853]/40 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
