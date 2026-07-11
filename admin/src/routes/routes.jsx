import { createBrowserRouter, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Registration";
import Vehicles from "../pages/admin/Vehicles";
import Home from "../pages/Landing/Home";
import DriverManagement from "../pages/admin/DriverManagement";

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
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  /* ── Admin routes (with Layout) ───────────────── */
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> }, // /dashboard

      {
        path: "fleet-map",
        element: <PlaceholderPage title="Live Fleet Map" />,
      },
      { path: "alerts", element: <PlaceholderPage title="Alerts Dashboard" /> },
      {
        path: "trip-history",
        element: <PlaceholderPage title="Trip History & Replay" />,
      },
      {
        path: "geofence",
        element: <PlaceholderPage title="Geofence Management" />,
      },
      { path: "vehicles", element: <Vehicles /> },
      { path: "drivers", element: <DriverManagement /> },
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
    <div className="min-h-screen bg-[#060912] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-cyan-400 tracking-wide">
            Fleetiq
          </span>
          <span className="text-xs text-white/20">/</span>
          <span className="text-xs text-white/40">{title}</span>
        </nav>

        <h1 className="text-2xl font-black text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Placeholder Card */}
      <div className="relative rounded-xl border border-white/[0.06] bg-[#0d1420] overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-cyan-500/10 blur-3xl rounded-full" />
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
          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            This section is currently under development. Once completed, it will
            provide full control and insights for{" "}
            <span className="text-cyan-400 font-semibold">
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
            className="mt-4 px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
