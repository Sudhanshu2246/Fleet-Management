import { useState, useEffect, useRef } from "react";
import {
  FiZap, FiShield, FiBarChart2, FiTruck, FiAlertCircle,
  FiCheckCircle, FiBell, FiUsers, FiMenu, FiX,
  FiChevronDown, FiChevronUp, FiStar, FiActivity, FiClock,
  FiSettings, FiGlobe, FiMail, FiTrendingUp,
  FiCpu, FiWifi,
} from "react-icons/fi";
import {
  RiFlashlightLine, RiRouteLine, RiDashboardLine, RiGasStationLine,
} from "react-icons/ri";
import { MdOutlineSatelliteAlt } from "react-icons/md";

/* ─── Animated Counter ───────────────────────────────────────── */
function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let s = 0;
      const step = end / 60;
      const timer = setInterval(() => {
        s += step;
        if (s >= end) { setVal(end); clearInterval(timer); }
        else setVal(Math.floor(s));
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Pulse Dot ──────────────────────────────────────────────── */
function Pulse({ color = "#198754" }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

/* ─── Section Label ──────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <span className="h-px w-7" style={{ background: "#AF1763" }} />
      <span
        className="text-[10px] tracking-[0.18em] uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "#AF1763" }}
      >
        {children}
      </span>
      <span className="h-px w-7" style={{ background: "#AF1763" }} />
    </div>
  );
}

/* ─── Section Title ──────────────────────────────────────────── */
function SectionTitle({ children, sub }) {
  return (
    <div className="text-center mb-12">
      <h2
        className="font-bold tracking-tight leading-tight mb-3"
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(26px, 3.5vw, 42px)",
          color: "#f0f2f8",
          letterSpacing: "-0.02em",
        }}
      >
        {children}
      </h2>
      {sub && (
        <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "#a8b0c8" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Features", "How It Works", "Pricing", "FAQ"];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(15,17,23,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #AF1763, #d63384)",
              boxShadow: "0 4px 14px rgba(175,23,99,0.4)",
            }}
          >
            <FiTruck size={16} color="#fff" />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "#f0f2f8" }}>
            Fleet<span style={{ color: "#AF1763" }}>IQ</span>
          </span>
          <span
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(25,135,84,0.15)",
              color: "#198754",
              border: "1px solid rgba(25,135,84,0.3)",
            }}
          >
            <Pulse color="#198754" />LIVE
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium transition-colors duration-200 hover:text-[#f0f2f8]"
              style={{ color: "#a8b0c8" }}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="text-sm font-medium px-4 py-2 transition-colors"
            style={{ color: "#a8b0c8", background: "none", border: "none", cursor: "pointer" }}
          >
            Log in
          </button>
          <button className="fleet-btn-primary text-sm">Start Free Trial</button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#f0f2f8" }}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-6 pb-6"
          style={{ background: "#191C24", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm"
              style={{ color: "#a8b0c8", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {l}
            </a>
          ))}
          <button className="fleet-btn-primary w-full justify-center mt-4 text-sm">
            Start Free Trial
          </button>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative flex items-center justify-center px-6"
      style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      {/* Pink glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "38%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(175,23,99,0.17) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: "rgba(175,23,99,0.12)",
            border: "1px solid rgba(175,23,99,0.35)",
            color: "#d4688a",
          }}
        >
          <RiFlashlightLine size={12} />
          Real-time GPS · AI Analytics · 48ms Latency
        </div>

        {/* H1 */}
        <h1
          className="font-bold tracking-tight leading-[1.05] mb-6"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(42px, 7vw, 78px)",
            color: "#f0f2f8",
            letterSpacing: "-0.03em",
          }}
        >
          Command Your
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #AF1763, #d63384)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Fleet Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="leading-relaxed mb-9 max-w-[560px]"
          style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#a8b0c8" }}
        >
          FleetIQ unifies live GPS tracking, predictive maintenance, AI-powered routing and driver
          analytics into one command center built for modern fleets.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button className="fleet-btn-primary px-7 py-3 text-sm">
            <FiZap size={15} /> Start Free Trial — 14 Days Free
          </button>
          <button className="fleet-btn-ghost px-7 py-3 text-sm">
            <FiActivity size={15} /> Watch Live Demo
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-12">
          {[
            { end: 3842, suf: "", label: "Active Vehicles", col: "#198754", bg: "rgba(25,135,84,0.1)", border: "rgba(25,135,84,0.25)" },
            { end: 1200000, suf: "+", label: "GPS Records/Day", col: "#AF1763", bg: "rgba(175,23,99,0.1)", border: "rgba(175,23,99,0.25)" },
            { end: 99, suf: "%", label: "Uptime SLA", col: "#0DCAF0", bg: "rgba(13,202,240,0.1)", border: "rgba(13,202,240,0.25)" },
            { end: 48, suf: "ms", label: "WS Latency", col: "#FFC107", bg: "rgba(255,193,7,0.1)", border: "rgba(255,193,7,0.25)" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-5 py-3 rounded-xl"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: s.col }}
              >
                <Counter end={s.end} suffix={s.suf} />
              </span>
              <span className="text-[10px] mt-1" style={{ color: "#5a6380" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div
          className="w-full rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
          style={{
            border: "1px solid rgba(175,23,99,0.25)",
            background: "#191C24",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Chrome bar */}
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: "#1e2230", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="w-3 h-3 rounded-full" style={{ background: "#AB2E3C", opacity: 0.85 }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#FFC107", opacity: 0.85 }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#198754", opacity: 0.85 }} />
            <span
              className="ml-3 text-[11px]"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#5a6380" }}
            >
              FleetIQ — Live Dashboard
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Pulse color="#198754" />
              <span className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#198754" }}>48ms</span>
              <span className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#5a6380" }}>● WS Connected</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2.5 p-3">
            {[
              { label: "Active", val: "3,842", icon: <FiTruck size={13} />, col: "#198754", bg: "rgba(25,135,84,0.1)", border: "rgba(25,135,84,0.2)" },
              { label: "Idle", val: "641", icon: <FiClock size={13} />, col: "#FFC107", bg: "rgba(255,193,7,0.08)", border: "rgba(255,193,7,0.2)" },
              { label: "Offline", val: "517", icon: <FiWifi size={13} />, col: "#5a6380", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" },
              { label: "SOS Alerts", val: "3", icon: <FiAlertCircle size={13} />, col: "#AB2E3C", bg: "rgba(171,46,60,0.1)", border: "rgba(171,46,60,0.25)" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl p-3"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: c.col }}>{c.icon}</span>
                  <FiTrendingUp size={10} style={{ color: "#5a6380" }} />
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: c.col }}
                >
                  {c.val}
                </div>
                <div className="text-[10px] mt-1" style={{ color: "#5a6380" }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div
            className="mx-3 mb-3 rounded-xl overflow-hidden"
            style={{ height: 185, background: "#080b12", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="100%" height="100%" viewBox="0 0 860 185" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 21} x2="860" y2={i * 21} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}
              {Array.from({ length: 22 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 43} y1="0" x2={i * 43} y2="185" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}
              <polyline points="60,155 160,95 310,115 460,68 620,90 800,48" fill="none" stroke="#AF1763" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
              <polyline points="40,80 170,140 290,90 440,148 580,110 750,142" fill="none" stroke="#0DCAF0" strokeWidth="1.5" strokeDasharray="4,5" opacity="0.35" />
              {[
                [160, 95, "#198754"], [310, 115, "#198754"], [460, 68, "#d4688a"],
                [620, 90, "#198754"], [290, 90, "#FFC107"], [440, 148, "#198754"], [750, 142, "#AB2E3C"],
              ].map(([x, y, col], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="9" fill={col} opacity="0.12" />
                  <circle cx={x} cy={y} r="4.5" fill={col} />
                  <circle cx={x} cy={y} r="2.5" fill="#fff" opacity="0.8" />
                </g>
              ))}
              <rect x="8" y="8" width="118" height="18" rx="4" fill="rgba(175,23,99,0.15)" />
              <text x="14" y="21" fontSize="9.5" fill="#AF1763" fontFamily="JetBrains Mono, monospace" fontWeight="600">● LIVE FLEET MAP</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Ticker ─────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    "Real-Time GPS Tracking","Predictive Maintenance AI","Route Optimization",
    "Driver Behavior Scoring","Fuel Efficiency Analytics","Geofence Alerts",
    "Compliance Reporting","Multi-Fleet Management","Mobile Driver App","24/7 Live Support",
  ];
  return (
    <div
      className="overflow-hidden py-3"
      style={{ background: "#1e2230", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 42s linear infinite" }}>
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 mx-8 text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#a8b0c8" }}
          >
            <span style={{ color: "#AF1763", fontSize: 8 }}>◆</span>
            {item}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/* ─── Features ───────────────────────────────────────────────── */
function Features() {
  const feats = [
    { icon: <MdOutlineSatelliteAlt size={20} />, title: "Real-Time GPS", desc: "Sub-second location updates via Socket.io. Track every vehicle live on an interactive map.", col: "#AF1763", bg: "rgba(175,23,99,0.1)" },
    { icon: <FiBarChart2 size={20} />, title: "Predictive Analytics", desc: "AI models detect anomalies and forecast maintenance before breakdowns happen.", col: "#0D6EFD", bg: "rgba(13,110,253,0.1)" },
    { icon: <RiRouteLine size={20} />, title: "Route Optimization", desc: "ML-powered routing cuts mileage by up to 23% while respecting driver HOS rules.", col: "#0DCAF0", bg: "rgba(13,202,240,0.1)" },
    { icon: <FiShield size={20} />, title: "Driver Safety", desc: "Harsh braking, speeding, and distraction events scored in real time.", col: "#198754", bg: "rgba(25,135,84,0.1)" },
    { icon: <RiGasStationLine size={20} />, title: "Fuel Management", desc: "Correlate idle time, routes and loads to slash fuel costs across your fleet.", col: "#FFC107", bg: "rgba(255,193,7,0.1)" },
    { icon: <FiSettings size={20} />, title: "Smart Maintenance", desc: "OBD-II fault codes, mileage triggers and calendar-based PM schedules unified.", col: "#AF1763", bg: "rgba(175,23,99,0.1)" },
    { icon: <FiGlobe size={20} />, title: "Compliance Hub", desc: "ELD mandate, IFTA, DVIR and HOS reporting automated end-to-end.", col: "#0DCAF0", bg: "rgba(13,202,240,0.1)" },
    { icon: <FiBell size={20} />, title: "Smart Alerts", desc: "Push, SMS and email notifications for geofence breaches, SOS and engine faults.", col: "#AB2E3C", bg: "rgba(171,46,60,0.1)" },
    { icon: <FiUsers size={20} />, title: "Driver Portal", desc: "Mobile-first app for DVIRs, messaging, navigation and shift tracking.", col: "#198754", bg: "rgba(25,135,84,0.1)" },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Capabilities</SectionLabel>
        <SectionTitle sub="Everything you need to run a smarter, safer, and more profitable fleet — in one platform.">
          Built for Fleet Operators
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {feats.map((f, i) => (
            <div key={i} className="fleet-card p-6 cursor-default">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg, color: f.col }}
              >
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#f0f2f8" }}>
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#a8b0c8" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { icon: <FiCpu size={22} />, title: "Install Hardware", desc: "Plug OBD-II trackers into your vehicles — setup in under 3 minutes per unit." },
    { icon: <FiWifi size={22} />, title: "Connect Platform", desc: "Devices handshake with our WebSocket cluster. Live data flows in seconds." },
    { icon: <RiDashboardLine size={22} />, title: "Monitor & Analyze", desc: "Your command center shows location, health, driver scores and fuel live." },
    { icon: <FiTrendingUp size={22} />, title: "Optimize & Save", desc: "Act on AI recommendations to cut costs, prevent breakdowns and improve safety." },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: "#191C24" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Process</SectionLabel>
        <SectionTitle sub="From unboxing to full fleet visibility in less than a day.">
          Up and Running in 4 Steps
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector */}
          <div
            className="hidden lg:block absolute h-px"
            style={{
              top: 40, left: "12.5%", right: "12.5%",
              background: "linear-gradient(90deg, #AF1763, #d63384, #AF1763)",
              opacity: 0.2,
            }}
          />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 z-10"
                style={{ background: "#1e2230", border: "2px solid rgba(175,23,99,0.3)" }}
              >
                <span
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-md flex items-center justify-center text-white font-bold"
                  style={{ background: "#AF1763", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "#AF1763" }}>{s.icon}</span>
              </div>
              <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#f0f2f8" }}>
                {s.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#a8b0c8" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Starter", price: 49, vehicles: "Up to 10 vehicles", hi: false,
      features: ["Real-time GPS tracking", "Basic geofence alerts", "7-day trip history", "Email support"],
      cta: "Start Free",
    },
    {
      name: "Growth", price: 149, vehicles: "Up to 50 vehicles", hi: true,
      features: ["Everything in Starter", "AI route optimization", "Driver behavior scoring", "Fuel analytics", "90-day history", "Priority support"],
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise", price: null, vehicles: "Unlimited vehicles", hi: false,
      features: ["Everything in Growth", "Custom integrations", "Dedicated CSM", "SLA guarantee", "On-premise option", "24/7 phone support"],
      cta: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionLabel>Pricing</SectionLabel>
        <SectionTitle sub="Transparent pricing that scales with your fleet. No hidden fees.">
          Simple, Honest Pricing
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <div
              key={i}
              className="relative rounded-xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-1"
              style={
                p.hi
                  ? {
                      background: "linear-gradient(160deg, rgba(175,23,99,0.1), rgba(13,110,253,0.05))",
                      border: "2px solid rgba(175,23,99,0.45)",
                    }
                  : {
                      background: "#191C24",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }
              }
            >
              {p.hi && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #AF1763, #d63384)",
                    boxShadow: "0 4px 14px rgba(175,23,99,0.4)",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <div className="mb-5">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "'Sora', sans-serif", color: "#f0f2f8" }}
                >
                  {p.name}
                </h3>
                <p className="text-[11px] mb-4" style={{ color: "#5a6380" }}>{p.vehicles}</p>
                {p.price ? (
                  <div className="flex items-end gap-1">
                    <span
                      className="font-bold leading-none"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 44, color: "#f0f2f8" }}
                    >
                      ${p.price}
                    </span>
                    <span className="text-sm mb-1.5" style={{ color: "#a8b0c8" }}>/mo</span>
                  </div>
                ) : (
                  <span
                    className="font-bold"
                    style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, color: "#f0f2f8" }}
                  >
                    Custom
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[13px]" style={{ color: "#a8b0c8" }}>
                    <FiCheckCircle size={13} style={{ color: "#198754", flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <button className={p.hi ? "fleet-btn-primary w-full justify-center py-3 text-sm" : "fleet-btn-ghost w-full justify-center py-3 text-sm"}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */
function Testimonials() {
  const tms = [
    { name: "Marcus Rivera", role: "Fleet Director, LogiCorp", stars: 5, quote: "FleetIQ cut our fuel costs by 19% in the first quarter. The AI routing alone paid for itself." },
    { name: "Priya Nair", role: "Operations Manager, SwiftHaul", stars: 5, quote: "The 48ms latency is real. We can see every truck live — no lag, no guessing. Our drivers love the mobile app too." },
    { name: "Thomas Becker", role: "CEO, Alpine Freight", stars: 5, quote: "Migrated from a legacy TMS in a weekend. Onboarding was seamless and the compliance hub saved us hours every week." },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#191C24" }}>
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Testimonials</SectionLabel>
        <SectionTitle sub="Trusted by fleet operators running thousands of vehicles worldwide.">
          What Fleet Managers Say
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tms.map((t, i) => (
            <div key={i} className="fleet-card p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <FiStar key={j} size={13} style={{ color: "#FFC107", fill: "#FFC107" }} />
                ))}
              </div>
              <p className="text-[13px] leading-relaxed mb-5 italic" style={{ color: "#a8b0c8" }}>
                "{t.quote}"
              </p>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#f0f2f8" }}>{t.name}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#5a6380" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "How long does installation take?", a: "Most fleets are fully set up within a day. OBD-II plug-in devices take 3 minutes per vehicle. Hardwired units require a certified installer but our network covers 90+ countries." },
    { q: "What hardware do I need?", a: "FleetIQ works with our certified OBD-II trackers or integrates with 200+ third-party GPS devices via our open API. No proprietary lock-in." },
    { q: "Is my data secure?", a: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and GDPR compliant." },
    { q: "Can I try before paying?", a: "Absolutely. All plans include a 14-day free trial with full features, no credit card required." },
    { q: "What's your uptime SLA?", a: "We guarantee 99.9% uptime on Growth and Enterprise plans, backed by a credit policy. Our live status page is always public." },
    { q: "Do you offer API access?", a: "Yes. Full REST and WebSocket APIs are available on all plans. Enterprise customers get dedicated sandbox environments and integration support." },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <SectionLabel>FAQ</SectionLabel>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <div className="space-y-2.5">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                background: "#191C24",
                border: open === i ? "1px solid rgba(175,23,99,0.35)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-medium" style={{ color: "#f0f2f8" }}>{f.q}</span>
                {open === i
                  ? <FiChevronUp size={15} style={{ color: "#AF1763", flexShrink: 0 }} />
                  : <FiChevronDown size={15} style={{ color: "#5a6380", flexShrink: 0 }} />}
              </button>
              {open === i && (
                <div
                  className="px-5 pb-5 text-[13px] leading-relaxed"
                  style={{
                    color: "#a8b0c8",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: 12,
                  }}
                >
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="py-24 px-6" style={{ background: "#191C24" }}>
      <div className="max-w-3xl mx-auto">
        <div
          className="relative rounded-2xl px-8 py-16 text-center overflow-hidden"
          style={{ background: "#1e2230", border: "1px solid rgba(175,23,99,0.25)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(175,23,99,0.14) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <div className="flex justify-center mb-5">
              <span
                className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "rgba(175,23,99,0.1)",
                  border: "1px solid rgba(175,23,99,0.25)",
                  color: "#d4688a",
                }}
              >
                <Pulse color="#AF1763" /> 3,842 fleets running live right now
              </span>
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#f0f2f8" }}
            >
              Ready to take command?
            </h2>
            <p className="text-base mb-9 max-w-sm mx-auto leading-relaxed" style={{ color: "#a8b0c8" }}>
              Join 5,000+ fleet operators. Start your free 14-day trial today — no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="fleet-btn-primary px-7 py-3 text-sm">
                <FiZap size={15} /> Start Free Trial
              </button>
              <button className="fleet-btn-ghost px-7 py-3 text-sm">
                <FiMail size={15} /> Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { label: "MAIN", links: ["Dashboard", "Live Map", "Alerts", "Reports"] },
    { label: "TRACKING", links: ["GPS Devices", "Geofences", "History Playback", "Trip Analytics"] },
    { label: "MANAGEMENT", links: ["Drivers", "Maintenance", "Fuel", "Documents"] },
    { label: "ANALYTICS", links: ["Fleet Score", "Cost Center", "Compliance", "API Docs"] },
  ];

  return (
    <footer style={{ background: "#191C24", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #AF1763, #d63384)" }}
              >
                <FiTruck size={14} color="#fff" />
              </div>
              <span className="font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "#f0f2f8" }}>
                Fleet<span style={{ color: "#AF1763" }}>IQ</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#5a6380" }}>
              Enterprise fleet intelligence powered by real-time GPS, AI, and WebSocket technology.
            </p>
            <span className="flex items-center gap-2 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#5a6380" }}>
              <Pulse color="#198754" />All systems operational
            </span>
          </div>

          {cols.map((c) => (
            <div key={c.label}>
              <h4
                className="text-[10px] font-bold tracking-[0.18em] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#AF1763" }}
              >
                {c.label}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs transition-colors hover:text-[#a8b0c8]"
                      style={{ color: "#5a6380" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px] mb-3 md:mb-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#5a6380" }}>
            Node.js · MongoDB · Redis · Socket.io · v2.4.1
          </p>
          <p className="text-[11px]" style={{ color: "#5a6380" }}>
            © 2026 FleetIQ Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0f1117", color: "#f0f2f8", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <Hero />
      <Ticker />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}