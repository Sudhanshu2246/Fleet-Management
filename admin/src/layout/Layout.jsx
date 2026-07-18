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
        background: "#F0F4F8",
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
        className="main-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Sticky header ───────────────────────────────────────────── */}
        <Header onMenuToggle={handleMenuToggle} />

        {/* ── Page content ────────────────────────────────────────────── */}
        <main className="">
          <Outlet />
        </main>
      </div>

      {/* ── Responsive sidebar styles ────────────────────────────────────── */}
      <style>{`
        .main-content {
          margin-left: ${sidebarW}px;
        }
        @media (max-width: 767px) {
          .main-content {
            margin-left: 0 !important;
          }
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