import { createBrowserRouter, useNavigate, useRouteError } from "react-router-dom";
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
import TrackDriver from "../pages/admin/TrackDriver";
import TripHistory from "../pages/admin/TripHistory";
import GeofenceManagement from "../pages/admin/GeofenceManagement";
import ReportsAnalytics from "../pages/admin/ReportsAnalytics";
import SecurityAudit from "../pages/admin/SecurityAudit";
import Settings from "../pages/admin/Settings";

/**
 * App Router
 * ─────────────────────────────────────────────────────────────────────────
 * Auth pages (Login, Register) sit OUTSIDE the Layout shell — no sidebar/header.
 * All admin pages are nested under Layout — they render into <Outlet />.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const appRouter = createBrowserRouter([
  /* ── Public routes ─────────────────────────────── */
  { path: "/", element: <Home />, errorElement: <RouteErrorBoundary /> }, // ✅ First page
  { path: "/register", element: <Register />, errorElement: <RouteErrorBoundary /> },

  /* ── Admin routes (with Layout) ───────────────── */
  {
    path: "/dashboard",
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
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
        element: <TripHistory />,
      },
      {
        path: "geofence",
        element: <GeofenceManagement />,
      },
      { path: "trips", element: <Trips /> },
      { path: "vehicles", element: <Vehicles /> },
      { path: "drivers", element: <DriverManagement /> },
      { path: "drivers/:id", element: <TrackDriver /> },
      { path: "drivers/:id/details", element: <TrackDriver /> },
      { path: "drivers/:id/track", element: <TrackDriver /> },
      {
        path: "assign-vehicle",
        element: <AssignVehicle />,
      },
      {
        path: "reports",
        element: <ReportsAnalytics />,
      },
      {
        path: "security",
        element: <SecurityAudit />,
      },
      { path: "settings", element: <Settings /> },
    ],
  },

  /* ── Fallback ─────────────────────────────── */
  { path: "*", element: <Home /> },
]);

/* ── Temporary placeholder for unbuilt pages ────────────────────────────── */
function PlaceholderPage({ title }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0B0F17] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">
            Fleetiq
          </span>
          <span className="text-xs text-slate-600">/</span>
          <span className="text-xs text-slate-400">{title}</span>
        </nav>

        <h1 className="text-2xl font-black text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Placeholder Card */}
      <div className="relative rounded-xl border border-slate-800 bg-[#151D2C] overflow-hidden shadow-xl">
        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#D4AF37]/10 blur-3xl rounded-full" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center text-center px-6 py-20 gap-5">
          {/* Icon */}
          <div className="text-5xl">🚧</div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white tracking-tight">
            {title} Module
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            This section is currently under development. Once completed, it will
            provide full control and insights for{" "}
            <span className="text-[#D4AF37] font-semibold">
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
            className="mt-4 px-5 py-2 rounded-lg text-xs font-bold bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Error Boundary for Routes ───────────────────────────────────────────── */
function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#151D2C] border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          {error?.statusText || error?.message || "An unexpected error occurred while loading this view."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 hover:bg-[#c49f2f] transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

