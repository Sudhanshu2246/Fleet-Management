import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Registration";
import Vehicles from "../pages/admin/Vehicles";

/**
 * App Router
 * ─────────────────────────────────────────────────────────────────────────
 * Auth pages (Login, Register) sit OUTSIDE the Layout shell — no sidebar/header.
 * All admin pages are nested under Layout — they render into <Outlet />.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const appRouter = createBrowserRouter([
  /* ── Auth routes (no Layout wrapper) ──────────────────────────────── */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  /* ── Admin routes (wrapped in Layout) ─────────────────────────────── */
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, path: "/dashboard", element: <Dashboard /> },

      /* Add pages as you build them — stub placeholders below */
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
      {
        path: "vehicles",
        element: <Vehicles />,
      },
      { path: "users", element: <PlaceholderPage title="User Management" /> },
      {
        path: "organizations",
        element: <PlaceholderPage title="Organizations" />,
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
]);

/* ── Temporary placeholder for unbuilt pages ────────────────────────────── */
function PlaceholderPage({ title }) {
  return (
    <div className="page-wrapper">
      <div className="page-heading">
        <nav className="page-breadcrumb">
          <span>Fleetiq</span>
          <span className="page-breadcrumb-sep">/</span>
          <span style={{ color: "var(--color-text-secondary)" }}>{title}</span>
        </nav>
        <h1 className="page-title">{title}</h1>
      </div>

      <div
        className="fleet-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 40px",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 44 }}>🚧</div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sora)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textAlign: "center",
            maxWidth: 360,
          }}
        >
          This page is in development. Replace this placeholder with your{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-fleet-cyan)",
              background: "rgba(13,202,240,0.08)",
              padding: "1px 6px",
              borderRadius: 4,
            }}
          >
            src/pages/{title.replace(/\s/g, "")}/index.jsx
          </code>{" "}
          component.
        </div>
        <span className="badge badge-warning" style={{ marginTop: 8 }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}
