import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";

/* ── Constants — must match Sidebar.jsx ─────────────────────────────────── */
const SIDEBAR_W           = 260;
const SIDEBAR_COLLAPSED_W = 72;

export default function Layout() {
  const [collapsed,       setCollapsed]       = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W;

  /* Hamburger: collapse on desktop, drawer on mobile */
  const handleMenuToggle = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-bg-base)",
      }}
    >
      {/* ── Sidebar (fixed position, outside flow) ──────────────────────── */}
      <div
        className={mobileSidebarOpen ? "sidebar-wrapper mobile-open" : "sidebar-wrapper"}
        style={{ flexShrink: 0 }}
      >
        <Sidebar
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            display: "none",          /* shown via CSS @media */
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 45,
            backdropFilter: "blur(2px)",
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div
        className=""
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        //   minWidth: 0,
          marginLeft: sidebarW,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Sticky header ───────────────────────────────────────────── */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* ── Page content ────────────────────────────────────────────── */}
        <main className="p-10"  style={{ margin: 15, overflowY: "auto", background: "var(--color-bg-base)" }}>
          <Outlet />
        </main>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer
          style={{
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            background: "var(--color-bg-card)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
          className="sticky bottom-0 z-40 flex shrink-0"
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            © 2025 Fleetiq  · Real-Time Fleet & Human Tracking Platform
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              Node.js · MongoDB · Redis · Socket.io
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-fleet-pink)",
                fontFamily: "var(--font-mono)",
              }}
            >
              v2.4.1
            </span>
          </div>
        </footer>
      </div>

      {/* ── Responsive sidebar styles ────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .sidebar-wrapper {
            position: fixed !important;
            top: 0; left: 0; height: 100%;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          .sidebar-wrapper.mobile-open {
            transform: translateX(0);
          }
          .mobile-overlay {
            display: block !important;
          }
         
        }
      `}</style>
    </div>
  );
}