import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import RegisterCompanyModal from "../auth/Registration";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={path} />
  </svg>
);

const icons = {
  map: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  truck:
    "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  bar: "M18 20V10M12 20V4M6 20v-6",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  linkedin:
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  twitter:
    "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  fuel: "M3 22V8l9-6 9 6v14H3zM12 2v20M3 12h18",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l1.8-1.8a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ to, duration = 2, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, to, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ─── FLOATING MAP PIN ─────────────────────────────────────────────────────────
const MapPin = ({ x, y, color, delay = 0, pulse = true }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
  >
    <motion.div
      animate={pulse ? { y: [-4, 4, -4] } : {}}
      transition={{ duration: 2 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative">
        {pulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.3 }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  </motion.div>
);

// ─── ANIMATED ROAD LINE ───────────────────────────────────────────────────────
const RoadLine = ({ x1, y1, x2, y2, color, delay = 0 }) => (
  <motion.line
    x1={`${x1}%`}
    y1={`${y1}%`}
    x2={`${x2}%`}
    y2={`${y2}%`}
    stroke={color}
    strokeWidth="1.5"
    strokeDasharray="6 4"
    opacity="0.4"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.4 }}
    transition={{ duration: 2, delay, ease: "easeInOut" }}
  />
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ dark, setDark, onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Features", "Dashboard", "How It Works", "Pricing", "Contact"];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? dark
              ? "bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
              : "bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Icon path={icons.truck} size={16} className="text-white" />
            </div>
            <span
              className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-gray-900"}`}
            >
              Fleet<span className="text-cyan-400">IQ</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l}
                href="#"
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${dark ? "text-gray-300" : "text-gray-600"}`}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg transition-colors ${dark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <Icon path={dark ? icons.sun : icons.moon} size={18} />
            </button>
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
            >
              Get Started →
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              <Icon path={dark ? icons.sun : icons.moon} size={18} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 ${dark ? "text-white" : "text-gray-900"}`}
            >
              <Icon path={icons.menu} size={22} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-72 ${dark ? "bg-[#0B0F19] border-l border-white/10" : "bg-white border-l border-gray-200"} p-6 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-10">
                <span
                  className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}
                >
                  Fleet<span className="text-cyan-400">IQ</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={dark ? "text-gray-400" : "text-gray-500"}
                >
                  <Icon path={icons.close} size={22} />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {links.map((l, i) => (
                  <motion.a
                    key={l}
                    href="#"
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className={`text-base font-medium transition-colors hover:text-cyan-400 ${dark ? "text-gray-300" : "text-gray-700"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l}
                  </motion.a>
                ))}
              </div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
              >
                Get Started →
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = ({ dark }) => {
  const pins = [
    { x: 20, y: 30, color: "#22d3ee", delay: 0.8 },
    { x: 65, y: 20, color: "#3b82f6", delay: 1.1 },
    { x: 78, y: 55, color: "#22d3ee", delay: 1.4 },
    { x: 35, y: 65, color: "#8b5cf6", delay: 1.7 },
    { x: 50, y: 40, color: "#f59e0b", delay: 2.0 },
    { x: 10, y: 60, color: "#3b82f6", delay: 1.2 },
    { x: 88, y: 35, color: "#22d3ee", delay: 0.9 },
  ];

  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${dark ? "bg-[#0B0F19]" : "bg-gray-50"}`}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 ${dark ? "opacity-20" : "opacity-10"}`}
          style={{
            backgroundImage: `linear-gradient(${dark ? "#22d3ee" : "#3b82f6"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "#22d3ee" : "#3b82f6"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial gradient overlay */}
        <div
          className={`absolute inset-0 ${dark ? "bg-gradient-radial from-transparent via-[#0B0F19]/50 to-[#0B0F19]" : "bg-gradient-radial from-transparent via-gray-50/50 to-gray-50"}`}
          style={{
            background: dark
              ? "radial-gradient(ellipse at center, transparent 0%, rgba(11,15,25,0.7) 60%, #0B0F19 100%)"
              : "radial-gradient(ellipse at center, transparent 0%, rgba(249,250,251,0.7) 60%, #f9fafb 100%)",
          }}
        />
      </div>

      {/* Floating map pins */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <RoadLine
            x1={20}
            y1={30}
            x2={50}
            y2={40}
            color="#22d3ee"
            delay={1.5}
          />
          <RoadLine
            x1={50}
            y1={40}
            x2={65}
            y2={20}
            color="#3b82f6"
            delay={1.8}
          />
          <RoadLine
            x1={50}
            y1={40}
            x2={78}
            y2={55}
            color="#22d3ee"
            delay={2.0}
          />
          <RoadLine
            x1={35}
            y1={65}
            x2={50}
            y2={40}
            color="#8b5cf6"
            delay={2.2}
          />
        </svg>
        {pins.map((p, i) => (
          <MapPin key={i} {...p} />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-sm font-medium"
          style={{
            borderColor: dark ? "rgba(34,211,238,0.3)" : "rgba(59,130,246,0.3)",
            backgroundColor: dark
              ? "rgba(34,211,238,0.07)"
              : "rgba(59,130,246,0.05)",
            color: dark ? "#22d3ee" : "#3b82f6",
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </motion.span>
          Live tracking active — 2,400+ vehicles online
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 ${dark ? "text-white" : "text-gray-900"}`}
        >
          Command Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Fleet
            </span>
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </span>
          <br />
          In Real-Time
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
        >
          GPS-powered fleet intelligence for travel companies. Track every
          vehicle, monitor every driver, and optimize operations — all from one
          unified command center.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 20px 40px rgba(34,211,238,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center gap-2"
          >
            Start Free Trial
            <Icon path={icons.arrow} size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`px-8 py-3.5 rounded-xl font-semibold text-base border flex items-center gap-2 transition-colors ${
              dark
                ? "border-white/15 text-gray-300 hover:border-white/30 hover:text-white bg-white/5"
                : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
            }`}
          >
            Watch Demo
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
            </div>
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto p-5 rounded-2xl border ${dark ? "bg-white/5 border-white/10 backdrop-blur-lg" : "bg-white border-gray-200 shadow-xl shadow-gray-100"}`}
        >
          {[
            { val: 2400, suf: "+", label: "Active Vehicles" },
            { val: 98, suf: "%", label: "Uptime SLA" },
            { val: 500, suf: "+", label: "Companies" },
            { val: 12000, suf: "+", label: "Drivers Monitored" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div
                className={`text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent`}
              >
                <AnimatedCounter to={s.val} suffix={s.suf} />
              </div>
              <div
                className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-500"}`}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-6 h-9 rounded-full border-2 flex items-start justify-center pt-1.5 ${dark ? "border-white/20" : "border-gray-300"}`}
        >
          <div
            className={`w-1 h-2 rounded-full ${dark ? "bg-white/40" : "bg-gray-400"}`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
const Section = ({ children, className = "", id = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const SectionLabel = ({ text, dark }) => (
  <span
    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4 ${dark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
  >
    {text}
  </span>
);

const SectionTitle = ({ children, dark }) => (
  <h2
    className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${dark ? "text-white" : "text-gray-900"}`}
  >
    {children}
  </h2>
);

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const Features = ({ dark }) => {
  const features = [
    {
      icon: icons.map,
      title: "Real-Time GPS Tracking",
      desc: "See every vehicle's exact location live on an interactive map. Sub-second updates, zero blind spots.",
      color: "#22d3ee",
    },
    {
      icon: icons.zap,
      title: "Speed Monitoring",
      desc: "Track speed in real-time with alerts for over-speeding. Full timestamp history for compliance.",
      color: "#3b82f6",
    },
    {
      icon: icons.shield,
      title: "Driver Safety Score",
      desc: "AI-powered behavior analysis scores each driver. Harsh braking, acceleration, and route adherence.",
      color: "#8b5cf6",
    },
    {
      icon: icons.bar,
      title: "Fleet Analytics",
      desc: "Rich dashboards with KPIs, trends, and performance metrics. Export reports in one click.",
      color: "#f59e0b",
    },
    {
      icon: icons.bell,
      title: "Smart Alerts",
      desc: "Instant push notifications for geofence exits, idling, speeding, and critical events.",
      color: "#10b981",
    },
    {
      icon: icons.users,
      title: "Driver Management",
      desc: "Register drivers with ID proofs, licenses, and vehicle assignments. Full audit trail.",
      color: "#ef4444",
    },
  ];

  return (
    <Section
      className={`py-24 ${dark ? "bg-[#0B0F19]" : "bg-white"}`}
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel text="Core Features" dark={dark} />
          <SectionTitle dark={dark}>
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Run Smarter Fleets
            </span>
          </SectionTitle>
          <p
            className={`mt-4 text-lg max-w-2xl mx-auto ${dark ? "text-gray-400" : "text-gray-600"}`}
          >
            Purpose-built tools for travel companies to maximize efficiency,
            safety, and control across their entire fleet.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative p-6 rounded-2xl border group cursor-default transition-shadow hover:shadow-2xl ${
                dark
                  ? "bg-[#111827] border-white/10 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                  : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-blue-100/50"
              }`}
            >
              {/* Top glow on hover */}
              <div
                className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: f.color }}
              />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}18` }}
              >
                <Icon
                  path={f.icon}
                  size={22}
                  className=""
                  style={{ color: f.color }}
                />
              </div>
              <h3
                className={`font-bold text-base mb-2 ${dark ? "text-white" : "text-gray-900"}`}
              >
                {f.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─── DASHBOARD PREVIEW ────────────────────────────────────────────────────────
const DashboardPreview = ({ dark }) => {
  const vehicles = [
    {
      id: "TN-01-AB-1234",
      driver: "Rajan Kumar",
      speed: 62,
      status: "Moving",
      x: 30,
      y: 35,
    },
    {
      id: "TN-02-CD-5678",
      driver: "Priya Sharma",
      speed: 0,
      status: "Idle",
      x: 55,
      y: 50,
    },
    {
      id: "TN-03-EF-9012",
      driver: "Arun Raj",
      speed: 78,
      status: "Moving",
      x: 70,
      y: 25,
    },
    {
      id: "TN-04-GH-3456",
      driver: "Lakshmi V",
      speed: 45,
      status: "Moving",
      x: 20,
      y: 65,
    },
  ];

  return (
    <Section
      className={`py-24 ${dark ? "bg-[#060912]" : "bg-gray-50"}`}
      id="dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionLabel text="Dashboard Preview" dark={dark} />
          <SectionTitle dark={dark}>
            Your Fleet Command
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Center
            </span>
          </SectionTitle>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={`rounded-2xl border overflow-hidden shadow-2xl ${dark ? "bg-[#0d1420] border-white/10 shadow-black/50" : "bg-white border-gray-200 shadow-gray-200/80"}`}
        >
          {/* Titlebar */}
          <div
            className={`flex items-center gap-2 px-4 py-3 border-b ${dark ? "bg-[#111827] border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span
              className={`ml-3 text-xs font-mono ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              FleetIQ Dashboard — Live View
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              />
              <span
                className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}
              >
                LIVE
              </span>
            </div>
          </div>

          <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map area */}
            <div
              className={`lg:col-span-2 rounded-xl overflow-hidden relative ${dark ? "bg-[#0a1628]" : "bg-blue-50"}`}
              style={{ minHeight: 340 }}
            >
              {/* Fake map grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(${dark ? "rgba(34,211,238,0.08)" : "rgba(59,130,246,0.08)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(34,211,238,0.08)" : "rgba(59,130,246,0.08)"} 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Roads */}
              <svg className="absolute inset-0 w-full h-full">
                <RoadLine
                  x1={10}
                  y1={50}
                  x2={90}
                  y2={50}
                  color={dark ? "#22d3ee" : "#3b82f6"}
                  delay={0.3}
                />
                <RoadLine
                  x1={50}
                  y1={10}
                  x2={50}
                  y2={90}
                  color={dark ? "#22d3ee" : "#3b82f6"}
                  delay={0.5}
                />
                <RoadLine
                  x1={20}
                  y1={20}
                  x2={80}
                  y2={75}
                  color={dark ? "#8b5cf6" : "#8b5cf6"}
                  delay={0.7}
                />
              </svg>
              {/* Map label */}
              <div
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${dark ? "bg-black/40 text-cyan-400 border border-cyan-500/30" : "bg-white/80 text-blue-600 border border-blue-200"}`}
              >
                📍 Chennai, Tamil Nadu
              </div>
              {/* Vehicle pins */}
              {vehicles.map((v, i) => (
                <MapPin
                  key={i}
                  x={v.x}
                  y={v.y}
                  color={v.status === "Moving" ? "#22d3ee" : "#f59e0b"}
                  delay={0.5 + i * 0.2}
                />
              ))}
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-3">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active", val: "3", color: "#22d3ee" },
                  { label: "Idle", val: "1", color: "#f59e0b" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 ${dark ? "bg-[#111827]" : "bg-gray-50 border border-gray-100"}`}
                  >
                    <div
                      className="text-2xl font-black"
                      style={{ color: s.color }}
                    >
                      {s.val}
                    </div>
                    <div
                      className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehicle list */}
              <div className="flex-1 space-y-2 overflow-auto">
                {vehicles.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`p-3 rounded-xl ${dark ? "bg-[#111827] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`}
                      >
                        {v.id}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${v.status === "Moving" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div
                      className={`text-[11px] ${dark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {v.driver}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Icon
                        path={icons.zap}
                        size={11}
                        className="text-cyan-400"
                      />
                      <span className="text-[11px] font-mono text-cyan-400">
                        {v.speed} km/h
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Speed graph bar */}
          <div className={`px-4 lg:px-6 pb-4 lg:pb-6`}>
            <div
              className={`rounded-xl p-4 ${dark ? "bg-[#111827]" : "bg-gray-50 border border-gray-100"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold ${dark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Speed History (Last 30 min)
                </span>
                <span className="text-xs text-cyan-400 font-mono">
                  Avg: 58 km/h
                </span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[
                  40, 55, 62, 58, 70, 65, 72, 68, 60, 55, 63, 67, 71, 64, 58,
                  60, 66, 72, 68, 62, 58, 55, 60, 64, 70, 66, 62, 58, 54, 60,
                ].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="flex-1 rounded-sm origin-bottom"
                    style={{
                      height: `${(h / 80) * 100}%`,
                      backgroundColor:
                        h > 65 ? "#22d3ee" : dark ? "#1e3a5f" : "#bfdbfe",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

// ─── DRIVER APP ───────────────────────────────────────────────────────────────
const DriverApp = ({ dark }) => {
  const [screen, setScreen] = useState(0);
  const screens = ["Login", "Speed", "Location"];

  return (
    <Section className={`py-24 ${dark ? "bg-[#0B0F19]" : "bg-white"}`} id="app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <SectionLabel text="Driver Mobile App" dark={dark} />
            <SectionTitle dark={dark}>
              Drivers Stay
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Connected & Safe
              </span>
            </SectionTitle>
            <p
              className={`mt-4 text-base leading-relaxed mb-8 ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              The FleetIQ driver app is beautifully simple. Login with your
              Driver ID, and we handle everything — live location broadcasting,
              speed tracking, and safety alerts.
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: icons.phone,
                  title: "Instant Login",
                  desc: "Driver ID + Vehicle Number login. No complicated setup.",
                },
                {
                  icon: icons.map,
                  title: "Live Location Sync",
                  desc: "Your GPS streams to the company dashboard in real-time.",
                },
                {
                  icon: icons.zap,
                  title: "Speed Tracking",
                  desc: "Automatic speed monitoring with visual alerts for safe driving.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-cyan-500/10" : "bg-blue-50"}`}
                  >
                    <Icon
                      path={item.icon}
                      size={18}
                      className={dark ? "text-cyan-400" : "text-blue-600"}
                    />
                  </div>
                  <div>
                    <div
                      className={`font-semibold text-sm mb-0.5 ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2 mt-8">
              {screens.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setScreen(i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${screen === i ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25" : dark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Phone frame */}
              <div
                className={`w-64 h-[520px] rounded-[40px] border-4 shadow-2xl overflow-hidden relative ${dark ? "border-white/20 bg-[#0a0e17] shadow-cyan-500/20" : "border-gray-300 bg-gray-900 shadow-blue-200"}`}
              >
                {/* Status bar */}
                <div className="flex justify-between items-center px-5 pt-3 pb-2">
                  <span className="text-white text-[10px] font-bold">9:41</span>
                  <div className="w-16 h-5 rounded-full bg-black absolute top-2 left-1/2 -translate-x-1/2" />
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-2 rounded-sm bg-white/60" />
                    <div className="w-0.5 h-1.5 bg-white/60 rounded-full" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {screen === 0 && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="px-5 pt-4"
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                          <Icon
                            path={icons.truck}
                            size={14}
                            className="text-white"
                          />
                        </div>
                        <span className="text-white font-bold">
                          FleetIQ Driver
                        </span>
                      </div>
                      <h3 className="text-white font-black text-xl mb-5">
                        Welcome Back
                      </h3>
                      {["Driver ID", "Vehicle No.", "Full Name"].map((l, i) => (
                        <div key={i} className="mb-3">
                          <div className="text-gray-400 text-[10px] mb-1 font-semibold uppercase tracking-wide">
                            {l}
                          </div>
                          <div
                            className={`rounded-xl px-3 py-2.5 text-xs font-mono ${dark ? "bg-white/10 text-cyan-300" : "bg-white/10 text-cyan-300"}`}
                          >
                            {i === 0
                              ? "DRV-2041"
                              : i === 1
                                ? "TN-01-AB-1234"
                                : "Rajan Kumar"}
                          </div>
                        </div>
                      ))}
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold text-center"
                      >
                        Start Driving
                      </motion.div>
                    </motion.div>
                  )}
                  {screen === 1 && (
                    <motion.div
                      key="speed"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="px-5 pt-4 text-center"
                    >
                      <div className="text-white font-bold mb-2 text-sm text-left">
                        Speed Monitor
                      </div>
                      <div className="relative w-40 h-40 mx-auto my-4">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full -rotate-90"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="10"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#speedGrad)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray="251"
                            initial={{ strokeDashoffset: 251 }}
                            animate={{
                              strokeDashoffset: 251 - (62 / 120) * 251,
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient
                              id="speedGrad"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="#22d3ee" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-white text-3xl font-black">
                            62
                          </span>
                          <span className="text-gray-400 text-xs">km/h</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {[
                          ["Max Today", "84 km/h"],
                          ["Avg Speed", "58 km/h"],
                          ["Distance", "124 km"],
                          ["Trips", "3"],
                        ].map(([l, v], i) => (
                          <div key={i} className="bg-white/5 rounded-xl p-2.5">
                            <div className="text-[9px] text-gray-500 font-semibold uppercase">
                              {l}
                            </div>
                            <div className="text-white text-xs font-bold mt-0.5">
                              {v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {screen === 2 && (
                    <motion.div
                      key="location"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="px-5 pt-4"
                    >
                      <div className="text-white font-bold mb-3 text-sm">
                        Live Location
                      </div>
                      <div
                        className="rounded-2xl overflow-hidden relative h-48"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                          backgroundColor: "#0a1628",
                        }}
                      >
                        <svg className="absolute inset-0 w-full h-full">
                          <RoadLine
                            x1={10}
                            y1={60}
                            x2={90}
                            y2={60}
                            color="#22d3ee"
                            delay={0}
                          />
                          <RoadLine
                            x1={50}
                            y1={10}
                            x2={50}
                            y2={90}
                            color="#3b82f6"
                            delay={0.2}
                          />
                        </svg>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <motion.div
                            animate={{
                              scale: [1, 2, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-cyan-400"
                          />
                          <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/50 relative z-10" />
                        </div>
                      </div>
                      <div className="mt-3 bg-white/5 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 mb-1">
                          Current Address
                        </div>
                        <div className="text-white text-xs font-semibold">
                          Anna Nagar, Chennai
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          13.0827° N, 80.2707° E
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating notifications */}
              <motion.div
                animate={{ x: [0, -5, 0], y: [0, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className={`absolute -right-12 top-16 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl ${dark ? "bg-[#111827] border border-cyan-500/30 text-cyan-400" : "bg-white border border-blue-200 text-blue-600 shadow-blue-100"}`}
              >
                📍 Location synced
              </motion.div>
              <motion.div
                animate={{ x: [0, 5, 0], y: [0, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className={`absolute -left-12 bottom-24 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl ${dark ? "bg-[#111827] border border-emerald-500/30 text-emerald-400" : "bg-white border border-emerald-200 text-emerald-600 shadow-emerald-100"}`}
              >
                ✓ Safe driving
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
};

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
const HowItWorks = ({ dark }) => {
  const steps = [
    {
      num: "01",
      title: "Register Your Company",
      desc: "Create your FleetIQ account and configure your company profile in under 5 minutes.",
      icon: icons.settings,
    },
    {
      num: "02",
      title: "Add Vehicles & Drivers",
      desc: "Upload your fleet data — vehicle numbers, driver IDs, license info, and assignments.",
      icon: icons.truck,
    },
    {
      num: "03",
      title: "Driver Logs In via App",
      desc: "Drivers download the app, log in with their ID and vehicle number, and start driving.",
      icon: icons.phone,
    },
    {
      num: "04",
      title: "Track in Real-Time",
      desc: "Your command dashboard goes live. Watch every vehicle, every route, every second.",
      icon: icons.map,
    },
  ];

  return (
    <Section
      className={`py-24 ${dark ? "bg-[#060912]" : "bg-gray-50"}`}
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel text="How It Works" dark={dark} />
          <SectionTitle dark={dark}>
            Up and Running in{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Minutes
            </span>
          </SectionTitle>
        </div>
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className={`absolute top-16 left-[12.5%] right-[12.5%] h-px hidden lg:block ${dark ? "bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" : "bg-gradient-to-r from-transparent via-blue-300 to-transparent"}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 relative ${dark ? "bg-[#111827] border-cyan-500/40" : "bg-white border-blue-200 shadow-lg shadow-blue-50"}`}
                  >
                    <Icon
                      path={s.icon}
                      size={22}
                      className={dark ? "text-cyan-400" : "text-blue-600"}
                    />
                    <div
                      className={`absolute -top-3 -right-3 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center ${dark ? "bg-cyan-500 text-[#0B0F19]" : "bg-blue-600 text-white"}`}
                    >
                      {s.num}
                    </div>
                  </div>
                </div>
                <h3
                  className={`font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {s.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

// ─── BENEFITS ─────────────────────────────────────────────────────────────────
const Benefits = ({ dark }) => {
  const benefits = [
    {
      icon: icons.shield,
      title: "40% Safety Improvement",
      desc: "AI-powered behavior monitoring reduces accidents and driver incidents significantly.",
      color: "#10b981",
    },
    {
      icon: icons.fuel,
      title: "25% Fuel Savings",
      desc: "Route optimization and idle-time monitoring cuts fuel costs from day one.",
      color: "#3b82f6",
    },
    {
      icon: icons.eye,
      title: "100% Fleet Visibility",
      desc: "Never lose track of a vehicle. Full 24/7 coverage across your entire fleet.",
      color: "#22d3ee",
    },
    {
      icon: icons.zap,
      title: "60% Less Risk",
      desc: "Early warning alerts and compliance tracking reduce operational and legal risk.",
      color: "#8b5cf6",
    },
  ];

  return (
    <Section
      className={`py-24 ${dark ? "bg-[#0B0F19]" : "bg-white"}`}
      id="benefits"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel text="Business Value" dark={dark} />
            <SectionTitle dark={dark}>
              Real Results for
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Real Companies
              </span>
            </SectionTitle>
            <p
              className={`mt-5 text-base leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              FleetIQ isn't just software — it's a measurable ROI engine. Travel
              companies using FleetIQ report dramatic improvements across
              safety, cost, and efficiency.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              View Case Studies
              <Icon path={icons.arrow} size={16} />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className={`p-5 rounded-2xl border ${dark ? "bg-[#111827] border-white/10" : "bg-gray-50 border-gray-100"}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${b.color}18` }}
                >
                  <Icon path={b.icon} size={20} style={{ color: b.color }} />
                </div>
                <h3
                  className={`font-bold text-sm mb-1 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {b.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const Testimonials = ({ dark }) => {
  const reviews = [
    {
      name: "Vikram Nair",
      role: "Fleet Manager, SunTours",
      text: "FleetIQ transformed how we operate. Real-time tracking gave us full control over 80 vehicles. Safety incidents dropped 45% in the first quarter.",
      stars: 5,
    },
    {
      name: "Anjali Mehta",
      role: "COO, ExpressTravels",
      text: "The driver app is incredibly simple. Our drivers adopted it in days. The speed analytics alone saved us from multiple compliance issues.",
      stars: 5,
    },
    {
      name: "Karthik Subbu",
      role: "Operations Head, YatraWheels",
      text: "We evaluated 5 platforms. FleetIQ was the clear winner — real-time data, clean UI, and the support team is excellent.",
      stars: 5,
    },
  ];

  const logos = [
    "SunTours",
    "ExpressTravels",
    "YatraWheels",
    "RoadKing",
    "TravelPro",
    "SwiftFleet",
  ];

  return (
    <Section
      className={`py-24 ${dark ? "bg-[#060912]" : "bg-gray-50"}`}
      id="testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionLabel text="Trusted By Leaders" dark={dark} />
          <SectionTitle dark={dark}>
            Companies That{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Trust FleetIQ
            </span>
          </SectionTitle>
        </div>

        {/* Logo strip */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {logos.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${dark ? "bg-white/5 border-white/10 text-gray-400" : "bg-white border-gray-200 text-gray-500 shadow-sm"}`}
            >
              {l}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl border ${dark ? "bg-[#111827] border-white/10" : "bg-white border-gray-200 shadow-lg shadow-gray-100"}`}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(r.stars)].map((_, j) => (
                  <Icon
                    key={j}
                    path={icons.star}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                    style={{ fill: "#f59e0b" }}
                  />
                ))}
              </div>
              <p
                className={`text-sm leading-relaxed mb-5 ${dark ? "text-gray-300" : "text-gray-700"}`}
              >
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-black">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div
                    className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    {r.name}
                  </div>
                  <div
                    className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {r.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─── CTA SECTION ──────────────────────────────────────────────────────────────
const CTA = ({ dark }) => (
  <Section className={`py-24 ${dark ? "bg-[#0B0F19]" : "bg-white"}`}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        className={`relative rounded-3xl p-10 sm:p-16 overflow-hidden border ${dark ? "bg-gradient-to-br from-[#0d1f3c] to-[#111827] border-cyan-500/20" : "bg-gradient-to-br from-blue-600 to-violet-600 border-transparent"}`}
      >
        {/* Glow blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
          >
            <Icon path={icons.truck} size={28} className="text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
            Start Managing Your
            <br />
            Fleet Today
          </h2>
          <p
            className={`text-lg mb-8 ${dark ? "text-gray-400" : "text-white/80"}`}
          >
            Join 500+ travel companies running smarter, safer fleets with
            FleetIQ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 20px 40px rgba(34,211,238,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-base shadow-xl flex items-center gap-2"
            >
              Start Free Trial
              <Icon path={icons.arrow} size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:border-white/60 transition-colors"
            >
              Schedule a Demo
            </motion.button>
          </div>
          <p className="text-xs mt-5 text-white/40">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </motion.div>
    </div>
  </Section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = ({ dark }) => (
  <footer
    className={`border-t py-14 ${dark ? "bg-[#060912] border-white/10" : "bg-gray-50 border-gray-200"}`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Icon path={icons.truck} size={16} className="text-white" />
            </div>
            <span
              className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}
            >
              Fleet<span className="text-cyan-400">IQ</span>
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed ${dark ? "text-gray-500" : "text-gray-500"}`}
          >
            The intelligent fleet management platform for modern travel
            companies.
          </p>
          <div className="flex gap-3 mt-4">
            {[icons.twitter, icons.linkedin, icons.github].map((ic, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-white/10 text-gray-400 hover:text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
              >
                <Icon path={ic} size={15} />
              </motion.a>
            ))}
          </div>
        </div>
        {[
          {
            title: "Product",
            links: [
              "Features",
              "Dashboard",
              "Driver App",
              "Pricing",
              "Changelog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact", "Press"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4
              className={`font-bold text-sm mb-4 ${dark ? "text-white" : "text-gray-900"}`}
            >
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className={`text-sm transition-colors hover:text-cyan-400 ${dark ? "text-gray-500" : "text-gray-500"}`}
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
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t text-sm ${dark ? "border-white/10 text-gray-600" : "border-gray-200 text-gray-400"}`}
      >
        <span>© 2025 FleetIQ Technologies. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          Built for{" "}
          <Icon path={icons.truck} size={14} className="text-cyan-400" /> fleets
          worldwide
        </span>
      </div>
    </div>
  </footer>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [dark, setDark] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 3px; }
      `}</style>
      <>
        <Navbar
          dark={dark}
          setDark={setDark}
          onGetStarted={() => setShowRegister(true)}
        />
        <Hero dark={dark} />
        <Features dark={dark} />
        <DashboardPreview dark={dark} />
        <DriverApp dark={dark} />
        <HowItWorks dark={dark} />
        <Benefits dark={dark} />
        <Testimonials dark={dark} />
        <CTA dark={dark} />
        <Footer dark={dark} />
      </>
      <RegisterCompanyModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />
    </div>
  );
}
