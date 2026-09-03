import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import Login from "../Auth/Login";

const Placeholder = ({ title }) => (
  <div className="p-6 bg-[#111827] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/10">
    <h2 className="text-xl font-bold text-white m-0">{title}</h2>
    <p className="text-white/50 mt-2 text-sm">This module is under construction.</p>
  </div>
);

/**
 * App Router
 * ─────────────────────────────────────────────────────────────────────────
 * Auth pages (Login) sit OUTSIDE the Layout shell — no sidebar/header.
 * All admin pages are nested under Layout — they render into <Outlet />.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const appRouter = createBrowserRouter([
  /* ── Public routes ─────────────────────────────── */
  { path: "/login", element: <Login /> },

  /* ── Admin routes (with Layout) ───────────────── */
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/clients" replace /> },
      { path: "clients", element: <Placeholder title="Client Management" /> },
      { path: "plans", element: <Placeholder title="Plan Management" /> },
      { path: "finance", element: <Placeholder title="Finance Management" /> },
      { path: "notifications", element: <Placeholder title="Notification Center" /> },
      { path: "settings", element: <Placeholder title="Settings" /> },
    ],
  },

  /* ── Fallback ─────────────────────────────── */
  { path: "*", element: <Navigate to="/login" replace /> },
]);
