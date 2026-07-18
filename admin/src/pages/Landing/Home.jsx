import { useState, useEffect, useRef } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import RegisterCompanyModal from "../auth/Registration";

// ─── ARGOLOGICS-STYLE PALETTE ─────────────────────────────────────────────────
// Light, clean, white cards + electric green + dark map
// Inspired by the ArgoLogics dashboard screenshot
const C = {
  bg: "#F0F4F8", // page background — cool light gray
  surface: "rgba(255, 255, 255, 0.65)", // glassmorphism surface
  surfaceAlt: "rgba(255, 255, 255, 0.4)", // slightly more transparent
  border: "rgba(255, 255, 255, 0.6)", // glass border
  borderLight: "rgba(255, 255, 255, 0.3)",
  
  // Replaced green with gold to apply golden theme globally without changing UI structure
  green: "#D4AF37", 
  greenDark: "#B68A1F", 
  greenLight: "#FFF4CC", 
  greenBright: "#F4D46B", 
  
  gold: "#D4AF37",
  goldDark: "#B68A1F",
  goldLight: "#FFF4CC",
  goldBright: "#F4D46B",
  
  cyan: "#22D3EE", 
  cyanLight: "#CFFAFE",
  dark: "#0F172A", 
  text: "#111827", 
  textMuted: "#4B5563", 
  textLight: "#9CA3AF", 
  mapBg: "#1A1F2E", 
  
  shadow: "0 4px 30px rgba(0,0,0,0.05)",
  shadowMd: "0 8px 32px rgba(0,0,0,0.08)",
  shadowLg: "0 12px 48px rgba(0,0,0,0.12)",
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 24, className = "", style = {} }) => (
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
    style={style}
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
  arrow: "M5 12h14M12 5l7 7-7 7",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
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
const AnimatedCounter = ({ to, duration = 2, suffix = "", prefix = "" }) => {
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
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ─── ANIMATED SPEED BAR (ArgoLogics style) ────────────────────────────────────
// White bars for inactive, green bars for active/peak — matching the screenshot
const SpeedBar = ({ height, index, isInView, isActive = false }) => {
  const pct = height / 80;
  return (
    <motion.div
      className="flex-1 rounded-sm origin-bottom cursor-pointer"
      style={{ height: `${pct * 100}%` }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
      whileHover={{ scaleY: 1.15, filter: "brightness(1.15)" }}
      transition={{
        delay: index * 0.028,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="w-full h-full rounded-sm"
        style={{
          background: isActive
            ? C.green
            : height > 65
              ? C.green
              : height > 52
                ? "#86EFAC" // light green mid
                : "#D1D5DB", // gray for low — matches screenshot inactive bars
        }}
        animate={
          isActive || height > 65
            ? {
                opacity: [1, 0.75, 1],
                boxShadow: [
                  `0 0 0px ${C.green}`,
                  `0 0 10px ${C.greenBright}80`,
                  `0 0 0px ${C.green}`,
                ],
              }
            : {}
        }
        transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.04 }}
      />
    </motion.div>
  );
};

// ─── GREEN SPARKLINE ──────────────────────────────────────────────────────────
// Mimics the ArgoLogics delivery volume line chart
const Sparkline = ({ data, color = C.green, width = 200, height = 50 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 4;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - 2 * pad);
      const y = pad + ((max - v) / (max - min || 1)) * (height - 2 * pad);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`sparkFill${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </svg>
  );
};

// ─── MAP PIN ──────────────────────────────────────────────────────────────────
// White circle pin with green inside — exactly like ArgoLogics
const MapPin = ({ x, y, color = C.green, delay = 0 }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
  >
    <motion.div
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color, opacity: 0.25 }}
          animate={{ scale: [1, 2.8, 1], opacity: [0.25, 0, 0.25] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={{
            background: "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── ROAD LINE (dark map style) ───────────────────────────────────────────────
const RoadLine = ({ x1, y1, x2, y2, color, delay = 0 }) => (
  <motion.line
    x1={`${x1}%`}
    y1={`${y1}%`}
    x2={`${x2}%`}
    y2={`${y2}%`}
    stroke={color}
    strokeWidth="2"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.7 }}
    transition={{ duration: 2.2, delay, ease: "easeInOut" }}
  />
);

// ─── SECTION ──────────────────────────────────────────────────────────────────
const Section = ({ children, className = "", id = "", style: s = {} }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={s}
    >
      {children}
    </motion.section>
  );
};

// ─── LABEL PILL ───────────────────────────────────────────────────────────────
const SectionLabel = ({ text }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest rounded-full mb-4"
    style={{ background: C.greenLight, color: C.greenDark }}
  >
    <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
    {text}
  </span>
);

const SectionTitle = ({ children }) => (
  <h2
    className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold leading-tight tracking-tight"
    style={{ color: C.text }}
  >
    {children}
  </h2>
);

// Green gradient text — matching ArgoLogics brand green
const GradientText = ({ children }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage: `linear-gradient(135deg, ${C.greenDark} 0%, ${C.green} 50%, ${C.greenBright} 100%)`,
    }}
  >
    {children}
  </span>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
const Card = ({ children, className = "", style: s = {}, hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -4, boxShadow: C.shadowLg } : {}}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl border ${className}`}
    style={{
      background: C.surface,
      borderColor: C.border,
      boxShadow: C.shadow,
      backdropFilter: "blur(20px)",
      ...s,
    }}
  >
    {children}
  </motion.div>
);

// ─── STATUS BADGE (ArgoLogics In Transit pill) ────────────────────────────────
const StatusBadge = ({ text, color = C.green }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
    style={{ background: color }}
  >
    <motion.div
      className="w-1.5 h-1.5 rounded-full bg-white"
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: 1.4, repeat: Infinity }}
    />
    {text}
  </span>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Features", "Dashboard", "How It Works", "Pricing", "Contact"];
  const scrollToSection = (link) => {
    const id = link.toLowerCase().replace(/ /g, "-");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled
            ? "0 1px 0 #E2E8F0, 0 2px 20px rgba(0,0,0,0.06)"
            : "none",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo — ArgoLogics style */}
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: C.green }}
            >
              <Icon path={icons.truck} size={16} className="text-white" />
            </div>
            <span
              className="font-extrabold text-[17px] tracking-tight transition-colors duration-500"
              style={{ color: scrolled ? C.text : "#FFFFFF" }}
            >
              Fleet<span style={{ color: C.green }}>IQ</span>
            </span>
          </motion.div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <button
                key={l}
                onClick={() => scrollToSection(l)}
                onMouseEnter={() => setActiveLink(l)}
                onMouseLeave={() => setActiveLink(null)}
                className="relative text-sm font-medium transition-colors duration-200"
                style={{ 
                  color: activeLink === l 
                    ? C.green 
                    : scrolled ? C.textMuted : "rgba(255,255,255,0.8)" 
                }}
              >
                {l}
                <motion.div
                  className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: C.green }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeLink === l ? 1 : 0 }}
                  transition={{ duration: 0.18 }}
                />
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 text-sm font-bold rounded-xl text-white"
              style={{
                background: C.green,
                boxShadow: `0 4px 14px ${C.green}50`,
              }}
            >
              Get Started →
            </motion.button>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 transition-colors duration-500"
            style={{ color: scrolled ? C.textMuted : "rgba(255,255,255,0.8)" }}
          >
            <Icon path={icons.menu} size={22} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 p-6 flex flex-col border-l"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div className="flex items-center justify-between mb-10">
                <span
                  className="font-extrabold text-lg"
                  style={{ color: C.text }}
                >
                  Fleet<span style={{ color: C.green }}>IQ</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ color: C.textMuted }}
                >
                  <Icon path={icons.close} size={22} />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {links.map((l, i) => (
                  <motion.button
                    key={l}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="text-base font-medium text-left"
                    style={{ color: C.textMuted }}
                    onClick={() => scrollToSection(l)}
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  onGetStarted();
                  setMobileOpen(false);
                }}
                className="mt-auto px-5 py-3 rounded-xl text-white font-bold"
                style={{ background: C.green }}
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

const TopDownTruck3D = () => {
  const pathRef = useRef(null);
  const cabRef = useRef(null);
  const trailerRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const cab = cabRef.current;
    const trailer = trailerRef.current;

    if (!path || !cab || !trailer) return;

    const durationMs = 26000;
    const targetFps = 30;
    const frameInterval = 1000 / targetFps;
    const pathLength = path.getTotalLength();
    const trailerOffset = 25.565 / 26;
    const tangentDistance = 4;
    let animationFrame;
    let startTime;
    let lastFrameTime = 0;

    const pointAt = (distance) => {
      const wrappedDistance = ((distance % pathLength) + pathLength) % pathLength;
      return path.getPointAtLength(wrappedDistance);
    };

    const moveAlongPath = (node, progress) => {
      const distance = progress * pathLength;
      const point = pointAt(distance);
      const previousPoint = pointAt(distance - tangentDistance);
      const nextPoint = pointAt(distance + tangentDistance);
      const angle =
        (Math.atan2(nextPoint.y - previousPoint.y, nextPoint.x - previousPoint.x) * 180) /
        Math.PI;

      node.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    };

    const animate = (time) => {
      if (startTime === undefined) {
        startTime = time;
        lastFrameTime = time - frameInterval;
      }

      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time - ((time - lastFrameTime) % frameInterval);

        const progress = ((time - startTime) % durationMs) / durationMs;
        moveAlongPath(cab, progress);
        moveAlongPath(trailer, (progress + trailerOffset) % 1);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Soft contact shadow that grounds the truck */}
          <filter id="truckShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#000" floodOpacity="0.5" />
          </filter>

          {/* Extra long, low ambient shadow blob under each unit for weight */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Panel bevel for painted body surfaces */}
          <filter id="bevel" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="blur" />
            <feOffset dx="0" dy="-1.6" result="offset1" />
            <feComposite in="SourceAlpha" in2="offset1" operator="out" result="bevelHighlight" />
            <feFlood floodColor="white" floodOpacity="0.7" result="highlightColor" />
            <feComposite in="highlightColor" in2="bevelHighlight" operator="in" result="highlight" />
            <feOffset dx="0" dy="1.6" result="offset2" />
            <feComposite in="SourceAlpha" in2="offset2" operator="out" result="bevelShadow" />
            <feFlood floodColor="black" floodOpacity="0.55" result="shadowColor" />
            <feComposite in="shadowColor" in2="bevelShadow" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="highlight" />
            </feMerge>
          </filter>

          {/* Tighter bevel for small chrome/metal parts */}
          <filter id="metalBevel" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
            <feOffset dx="0" dy="-0.8" result="offset1" />
            <feComposite in="SourceAlpha" in2="offset1" operator="out" result="bh" />
            <feFlood floodColor="white" floodOpacity="0.9" result="hc" />
            <feComposite in="hc" in2="bh" operator="in" result="highlight" />
            <feOffset dx="0" dy="0.8" result="offset2" />
            <feComposite in="SourceAlpha" in2="offset2" operator="out" result="bs" />
            <feFlood floodColor="black" floodOpacity="0.6" result="sc" />
            <feComposite in="sc" in2="bs" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="highlight" />
            </feMerge>
          </filter>

          {/* Cab paint: deep glossy blue with a specular sweep */}
          <linearGradient id="cabBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050B18" />
            <stop offset="18%" stopColor="#1E3A8A" />
            <stop offset="38%" stopColor="#3B63C4" />
            <stop offset="50%" stopColor="#2247A8" />
            <stop offset="65%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#050B18" />
          </linearGradient>

          <linearGradient id="cabRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1528" />
            <stop offset="45%" stopColor="#264BA0" />
            <stop offset="55%" stopColor="#264BA0" />
            <stop offset="100%" stopColor="#0B1528" />
          </linearGradient>

          {/* Trailer: brushed aluminum look */}
          <linearGradient id="trailerBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C838F" />
            <stop offset="8%" stopColor="#F8FAFC" />
            <stop offset="22%" stopColor="#D7DBE1" />
            <stop offset="50%" stopColor="#EEF1F4" />
            <stop offset="78%" stopColor="#C7CCD3" />
            <stop offset="92%" stopColor="#F3F5F7" />
            <stop offset="100%" stopColor="#565C66" />
          </linearGradient>

          <linearGradient id="windshield" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#010409" />
            <stop offset="35%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#010409" />
          </linearGradient>

          {/* Chrome radial for rims, grille, bumper, tanks */}
          <radialGradient id="chrome" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E5E9EE" />
            <stop offset="55%" stopColor="#9AA4B2" />
            <stop offset="75%" stopColor="#5B6472" />
            <stop offset="100%" stopColor="#232830" />
          </radialGradient>

          <radialGradient id="hubcap" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#F5F7FA" />
            <stop offset="45%" stopColor="#B7BEC8" />
            <stop offset="100%" stopColor="#3A3F47" />
          </radialGradient>

          <linearGradient id="tireBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#08090B" />
            <stop offset="45%" stopColor="#1C1F24" />
            <stop offset="55%" stopColor="#1C1F24" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          <linearGradient id="glossSweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <filter id="maskBlur">
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <mask id="textAvoidanceMask">
            <rect width="100%" height="100%" fill="white" />
            <ellipse cx="500" cy="300" rx="350" ry="200" fill="black" filter="url(#maskBlur)" />
          </mask>
        </defs>

        <path
          id="figure8"
          ref={pathRef}
          d="M 500 300 C 700 100, 900 200, 900 300 C 900 400, 700 500, 500 300 C 300 100, 100 200, 100 300 C 100 400, 300 500, 500 300 Z"
          fill="none"
          stroke="transparent"
        />

        <use
          href="#figure8"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="10 12"
          opacity="0.35"
          mask="url(#textAvoidanceMask)"
        />

        {/* === TRAILER === */}
        <g ref={trailerRef}>
          {/* grounded ambient shadow, drawn flat before the raised body */}
          <ellipse cx="-14" cy="20" rx="72" ry="26" fill="url(#groundShadow)" />

          <g filter="url(#truckShadow)">
            <g transform="translate(-76, -18) scale(1)">
              {/* Rear trailer wheel assemblies (3 axles), each tire + chrome hub */}
              {[20, 34, 48].map((x) => (
                <g key={x}>
                  <rect x={x} y="-4" width="12" height="44" fill="url(#tireBody)" rx="2.5" filter="url(#metalBevel)" />
                  <g fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="0.6">
                    <line x1={x + 1} y1="-2" x2={x + 1} y2="38" />
                    <line x1={x + 5} y1="-2" x2={x + 5} y2="38" />
                    <line x1={x + 9} y1="-2" x2={x + 9} y2="38" />
                    <line x1={x + 11} y1="-2" x2={x + 11} y2="38" />
                  </g>
                  <circle cx={x + 6} cy="4" r="3.4" fill="url(#hubcap)" filter="url(#metalBevel)" />
                  <circle cx={x + 6} cy="32" r="3.4" fill="url(#hubcap)" filter="url(#metalBevel)" />
                </g>
              ))}

              {/* Chrome rear bumper */}
              <rect x="6" y="-1" width="5" height="38" fill="url(#chrome)" rx="1.5" filter="url(#metalBevel)" />

              {/* Trailer Body */}
              <rect x="10" y="0" width="100" height="36" rx="2.5" fill="url(#trailerBody)" filter="url(#bevel)" />

              {/* Corrugated panel lines */}
              <g fill="none" stroke="#B8BDC4" strokeWidth="0.6" opacity="0.75">
                {[...Array(16)].map((_, i) => (
                  <line key={i} x1="12" y1={3 + i * 2} x2="108" y2={3 + i * 2} />
                ))}
              </g>

              {/* Panel outline + rivet-style corner accents */}
              <rect x="15" y="4" width="90" height="28" rx="1.5" fill="none" stroke="#8A9099" strokeWidth="1" />
              <rect x="15" y="4" width="90" height="28" rx="1.5" fill="url(#glossSweep)" opacity="0.5" />

              {/* Company stripe accent for depth/branding feel */}
              <rect x="15" y="16" width="90" height="4" fill="#1E3A8A" opacity="0.85" />
              <rect x="15" y="16" width="90" height="1" fill="#7DD3FC" opacity="0.6" />

              {/* Mud flaps behind rear axle */}
              <rect x="18" y="37" width="8" height="6" rx="1" fill="#111827" opacity="0.9" />
              <rect x="48" y="37" width="8" height="-6" rx="1" fill="#111827" opacity="0.9" />

              {/* Tail lights */}
              <rect x="8" y="1.5" width="2.5" height="6" rx="0.5" fill="#EF4444" filter="url(#metalBevel)" />
              <rect x="8" y="28.5" width="2.5" height="6" rx="0.5" fill="#EF4444" filter="url(#metalBevel)" />
              <rect x="8" y="9.5" width="2.5" height="4" rx="0.5" fill="#F59E0B" />
              <rect x="8" y="22.5" width="2.5" height="4" rx="0.5" fill="#F59E0B" />
              <rect x="8" y="16" width="2.5" height="4" rx="0.5" fill="#F8FAFC" opacity="0.8" />
            </g>
          </g>
        </g>

        {/* === CAB === */}
        <g ref={cabRef}>
          <ellipse cx="24" cy="20" rx="52" ry="24" fill="url(#groundShadow)" />

          <g filter="url(#truckShadow)">
            <g transform="translate(-118, -18) scale(1)">
              {/* Cab drive wheels (2 rear axles) */}
              {[114, 128].map((x) => (
                <g key={x}>
                  <rect x={x} y="-3" width="10" height="42" fill="url(#tireBody)" rx="2" filter="url(#metalBevel)" />
                  <g fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="0.55">
                    <line x1={x + 1} y1="-1" x2={x + 1} y2="37" />
                    <line x1={x + 4.5} y1="-1" x2={x + 4.5} y2="37" />
                    <line x1={x + 8} y1="-1" x2={x + 8} y2="37" />
                  </g>
                  <circle cx={x + 5} cy="3.5" r="3" fill="url(#hubcap)" filter="url(#metalBevel)" />
                  <circle cx={x + 5} cy="31.5" r="3" fill="url(#hubcap)" filter="url(#metalBevel)" />
                </g>
              ))}

              {/* Chassis rail between wheels */}
              <rect x="108" y="9" width="24" height="18" fill="#1F2937" filter="url(#bevel)" />
              <rect x="108" y="9" width="24" height="3" fill="#374151" opacity="0.6" />

              {/* Fifth wheel coupling */}
              <circle cx="118" cy="18" r="6.2" fill="url(#chrome)" stroke="#111827" strokeWidth="1" filter="url(#metalBevel)" />
              <circle cx="118" cy="18" r="2.4" fill="#111827" />

              {/* Steer wheels */}
              <g>
                <rect x="142" y="-3" width="8" height="42" fill="url(#tireBody)" rx="2" filter="url(#metalBevel)" />
                <g fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="0.5">
                  <line x1="144" y1="-1" x2="144" y2="37" />
                  <line x1="147" y1="-1" x2="147" y2="37" />
                </g>
                <circle cx="146" cy="3.5" r="2.6" fill="url(#hubcap)" filter="url(#metalBevel)" />
                <circle cx="146" cy="31.5" r="2.6" fill="url(#hubcap)" filter="url(#metalBevel)" />
              </g>

              {/* Fuel tank + step, chrome bands */}
              <rect x="127" y="0" width="13" height="4.5" fill="url(#chrome)" rx="1.5" filter="url(#metalBevel)" />
              <rect x="127" y="31.5" width="13" height="4.5" fill="url(#chrome)" rx="1.5" filter="url(#metalBevel)" />

              {/* Exhaust stacks, offset behind cab shoulders */}
              <rect x="130" y="-6" width="3" height="7" rx="1" fill="url(#chrome)" filter="url(#metalBevel)" />
              <rect x="130" y="35" width="3" height="7" rx="1" fill="url(#chrome)" filter="url(#metalBevel)" />
              <rect x="130.4" y="-7.5" width="2.2" height="2" rx="1" fill="#4B5563" />
              <rect x="130.4" y="42" width="2.2" height="2" rx="1" fill="#4B5563" />

              {/* Cab body shell */}
              <path
                d="M 126 4 L 148 4 C 154 4 156 8 156 18 C 156 28 154 32 148 32 L 126 32 Z"
                fill="url(#cabBody)"
                filter="url(#bevel)"
              />
              {/* Specular sweep across the door panel */}
              <path
                d="M 126 4 L 148 4 C 154 4 156 8 156 18 C 156 28 154 32 148 32 L 126 32 Z"
                fill="url(#glossSweep)"
                opacity="0.6"
              />

              {/* Roof fairing / air deflector, sits above the doors */}
              <path
                d="M 128 6.5 L 142 6.5 C 145.2 6.5 146.3 10.4 146.3 18 C 146.3 25.6 145.2 29.5 142 29.5 L 128 29.5 Z"
                fill="url(#cabRoof)"
              />
              <path
                d="M 128 6.5 L 142 6.5 C 145.2 6.5 146.3 10.4 146.3 18 C 146.3 25.6 145.2 29.5 142 29.5 L 128 29.5 Z"
                fill="none"
                stroke="#0B1528"
                strokeWidth="0.6"
              />
              {/* Roof centerline seam for extra dimensionality */}
              <line x1="130" y1="18" x2="145" y2="18" stroke="#0B1528" strokeWidth="0.5" opacity="0.6" />

              {/* Windshield */}
              <path d="M 143 6.5 L 148.5 7.5 C 151.5 11.5 151.5 24.5 148.5 28.5 L 143 29.5 Z" fill="url(#windshield)" />
              <path d="M 144 7.5 L 147 8 C 148.5 11 148.5 13 147.5 14 L 144 9.5 Z" fill="#BAE6FD" opacity="0.5" />

              {/* Side windows */}
              <rect x="135" y="3.2" width="7" height="2" fill="#020617" rx="0.5" />
              <rect x="135" y="30.8" width="7" height="2" fill="#020617" rx="0.5" />

              {/* Sun visor above windshield */}
              <path d="M 141 5 L 149 6 C 150 6.2 150 7 149 7 L 141 6.3 Z" fill="#050B18" opacity="0.85" />

              {/* Side mirrors, chrome-backed */}
              <rect x="144.5" y="-2" width="4.5" height="6.5" fill="url(#chrome)" rx="1.2" filter="url(#metalBevel)" />
              <rect x="144.5" y="31.5" width="4.5" height="6.5" fill="url(#chrome)" rx="1.2" filter="url(#metalBevel)" />

              {/* Hood */}
              <path
                d="M 148 7 L 155.5 8 C 157.8 8.2 159.5 12 159.5 18 C 159.5 24 157.8 27.8 155.5 28 L 148 29 Z"
                fill="url(#cabBody)"
                filter="url(#bevel)"
              />
              <line x1="150" y1="8.5" x2="156" y2="9.2" stroke="#0B1528" strokeWidth="0.5" opacity="0.7" />
              <line x1="150" y1="27.5" x2="156" y2="26.8" stroke="#0B1528" strokeWidth="0.5" opacity="0.7" />

              {/* Chrome grille */}
              <rect x="157.5" y="10.5" width="3.2" height="15" fill="url(#chrome)" rx="1" filter="url(#metalBevel)" />
              <g stroke="#4B5563" strokeWidth="0.4" opacity="0.8">
                <line x1="158" y1="12" x2="160.2" y2="12" />
                <line x1="158" y1="14" x2="160.2" y2="14" />
                <line x1="158" y1="16" x2="160.2" y2="16" />
                <line x1="158" y1="18" x2="160.2" y2="18" />
                <line x1="158" y1="20" x2="160.2" y2="20" />
                <line x1="158" y1="22" x2="160.2" y2="22" />
                <line x1="158" y1="24" x2="160.2" y2="24" />
              </g>

              {/* Headlights with warm glow */}
              <rect x="155.5" y="8" width="4" height="3.8" fill="#FEF9C3" rx="1" filter="url(#metalBevel)" />
              <rect x="155.5" y="24.2" width="4" height="3.8" fill="#FEF9C3" rx="1" filter="url(#metalBevel)" />
              <rect x="156" y="8.4" width="1.4" height="3" fill="#FFFFFF" opacity="0.8" rx="0.5" />
              <rect x="156" y="24.6" width="1.4" height="3" fill="#FFFFFF" opacity="0.8" rx="0.5" />

              {/* Front chrome bumper */}
              <rect x="158.5" y="6" width="2" height="24" fill="url(#chrome)" rx="1" filter="url(#metalBevel)" opacity="0.9" />

              {/* Steps / running boards */}
              <rect x="127" y="-1" width="12" height="3.5" fill="url(#chrome)" rx="1" filter="url(#metalBevel)" />
              <rect x="127" y="33.5" width="12" height="3.5" fill="url(#chrome)" rx="1" filter="url(#metalBevel)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const yPara = useTransform(scrollY, [0, 500], [0, 100]);
  const opaPara = useTransform(scrollY, [0, 350], [1, 0]);

  const pins = [
    { x: 20, y: 30, delay: 0.9 },
    { x: 52, y: 15, delay: 1.2 },
    { x: 75, y: 50, delay: 1.5 },
    { x: 35, y: 65, delay: 1.8 },
    { x: 62, y: 70, delay: 1.1 },
    { x: 88, y: 28, delay: 0.8 },
    { x: 10, y: 55, delay: 1.4 },
  ];

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: C.mapBg }}
    >
      {/* Full dark map background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 8%, ${C.gold}22 0%, transparent 68%)`,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${C.gold}18 1px, transparent 1px), linear-gradient(90deg, ${C.gold}18 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.45,
        }}
      />

      {/* Gold road network */}
      <motion.div
        className="absolute inset-0"
        style={{ y: yPara, opacity: opaPara }}
      >
        {/* Map card — floating */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden"
        >
          {/* Dark map background */}
          <div
            className="w-full h-full relative"
            style={{ background: C.mapBg }}
          >
            {/* Grid streets removed as requested */}
            {/* Roads removed as requested */}
            {/* Animated 3D Truck on Figure 8 */}
            <TopDownTruck3D />
            {/* Overlay vignette */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(26,31,46,0.22) 0%, rgba(26,31,46,0.7) 56%, rgba(26,31,46,0.92) 100%)",
              }}
            />
          </div>
        </motion.div>

        {/* Mini stat floating cards */}
        {[
          {
            label: "Active Vehicles",
            val: "66",
            badge: "Online",
            x: "5%",
            y: "20%",
          },
          {
            label: "Deliveries Today",
            val: "1,544",
            badge: "+12.4%",
            x: "5%",
            y: "62%",
          },
        ].map((fc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute hidden lg:block"
            style={{ left: fc.x, top: fc.y }}
          >
            <Card
              className="px-4 py-3 min-w-[170px]"
              hover={false}
              style={{
                background: "rgba(255,255,255,0.10)",
                borderColor: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "rgba(255,255,255,0.74)" }}
              >
                {fc.label}
              </div>
              <div className="flex items-end gap-2">
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: "#FFFFFF" }}
                >
                  {fc.val}
                </span>
                <StatusBadge text={fc.badge} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center pt-24 lg:pt-20">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-7 text-sm font-semibold"
          style={{
            borderColor: C.gold + "55",
            background: "rgba(255,244,204,0.92)",
            color: C.goldDark,
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: C.gold }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          Live tracking active — 2,400+ vehicles online
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight mb-6"
          style={{ color: "#FFFFFF" }}
        >
          Command Your{" "}
          <span className="relative inline-block">
            <GradientText>Fleet</GradientText>
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
              style={{
                background: `linear-gradient(90deg, ${C.goldDark}, ${C.goldBright})`,
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 1.1,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.72)" }}>In Real-Time</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.74)" }}
        >
          GPS-powered fleet intelligence for travel companies. Track every
          vehicle, monitor every driver, and optimize operations — all from one
          unified command center.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl text-white font-bold text-base flex items-center gap-2"
            style={{
              background: C.gold,
              boxShadow: `0 8px 28px ${C.gold}45`,
            }}
          >
            Start Free Trial <Icon path={icons.arrow} size={17} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2.5 border"
            style={{
              color: C.goldDark,
              borderColor: C.gold + "35",
              background: "rgba(255,255,255,0.94)",
              boxShadow: C.shadow,
            }}
          >
            Watch Demo
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: C.goldLight }}
            >
              <div
                className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-t-transparent border-b-transparent ml-0.5"
                style={{ borderLeftColor: C.gold }}
              />
            </div>
          </motion.button>
        </motion.div>

        {/* Stats row — like ArgoLogics dashboard stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {[
            { val: 2400, suf: "+", label: "Active Vehicles" },
            { val: 98, suf: "%", label: "Uptime SLA" },
            { val: 500, suf: "+", label: "Companies" },
            { val: 12000, suf: "+", label: "Drivers Monitored" },
          ].map((s, i) => (
            <Card
              key={i}
              hover={false}
              className="text-center py-4 px-2"
              style={{
                background: "rgba(255,255,255,0.10)",
                borderColor: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-2xl font-extrabold"
                style={{ color: C.gold }}
              >
                <AnimatedCounter to={s.val} suffix={s.suf} />
              </div>
              <div
                className="text-xs mt-1 font-medium"
                style={{ color: "rgba(255,255,255,0.74)" }}
              >
                {s.label}
              </div>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: C.gold + "70" }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{ background: C.gold }}
          />
        </motion.div>
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "rgba(255,255,255,0.52)" }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const Features = () => {
  const features = [
    {
      icon: icons.map,
      title: "Real-Time GPS Tracking",
      desc: "See every vehicle's exact location live on an interactive map. Sub-second updates, zero blind spots.",
      color: C.gold,
    },
    {
      icon: icons.zap,
      title: "Speed Monitoring",
      desc: "Track speed in real-time with instant alerts for over-speeding. Full timestamp history for compliance.",
      color: C.goldDark,
    },
    {
      icon: icons.shield,
      title: "Driver Safety Score",
      desc: "AI-powered behavior analysis scores each driver. Harsh braking, acceleration, and route adherence.",
      color: C.gold,
    },
    {
      icon: icons.bar,
      title: "Fleet Analytics",
      desc: "Rich dashboards with KPIs, trends, and performance metrics. Export reports in one click.",
      color: C.goldBright,
    },
    {
      icon: icons.bell,
      title: "Smart Alerts",
      desc: "Instant push notifications for geofence exits, idling, speeding, and critical events.",
      color: C.gold,
    },
    {
      icon: icons.users,
      title: "Driver Management",
      desc: "Register drivers with ID proofs, licenses, and vehicle assignments. Full audit trail.",
      color: C.goldDark,
    },
  ];

  return (
    <Section id="features" className="py-24" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionLabel text="Core Features" />
          <SectionTitle>
            Everything to Run
            <br />
            <GradientText>Smarter Fleets</GradientText>
          </SectionTitle>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: C.textMuted }}
          >
            Purpose-built tools for travel companies to maximize efficiency,
            safety, and control.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                delay: i * 0.09,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Card className="p-6 h-full group cursor-pointer overflow-hidden transition-all duration-300 relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                  style={{ background: f.color + "18" }}
                >
                  <Icon path={f.icon} size={21} style={{ color: f.color }} />
                </div>
                
                <h3
                  className="font-bold text-[15px] mb-2 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: C.text }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed transition-opacity duration-300 group-hover:opacity-80"
                  style={{ color: C.textMuted }}
                >
                  {f.desc}
                </p>
                
                {/* Background glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${f.color}15 0%, transparent 70%)`
                  }}
                />

                {/* Bottom accent line expanding on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─── DASHBOARD PREVIEW ────────────────────────────────────────────────────────
const DashboardPreview = () => {
  const barRef = useRef(null);
  const barsInView = useInView(barRef, { once: true });

  const vehicles = [
    {
      id: "TN-01-AB-1234",
      driver: "Rajan Kumar",
      speed: 62,
      status: "Moving",
      x: 28,
      y: 32,
    },
    {
      id: "TN-02-CD-5678",
      driver: "Priya Sharma",
      speed: 0,
      status: "Idle",
      x: 54,
      y: 52,
    },
    {
      id: "TN-03-EF-9012",
      driver: "Arun Raj",
      speed: 78,
      status: "Moving",
      x: 72,
      y: 22,
    },
    {
      id: "TN-04-GH-3456",
      driver: "Lakshmi V",
      speed: 45,
      status: "Moving",
      x: 18,
      y: 68,
    },
  ];

  const speedData = [
    40, 55, 62, 58, 70, 65, 72, 68, 60, 55, 63, 67, 71, 64, 58, 60, 66, 72, 68,
    62, 58, 55, 60, 64, 70, 66, 62, 58, 54, 60,
  ];
  const sparkData = [
    44, 52, 48, 60, 55, 68, 63, 72, 65, 70, 75, 68, 72, 80, 76, 82, 78, 85,
  ];

  return (
    <Section id="dashboard" className="py-24" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="Dashboard Preview" />
          <SectionTitle>
            Your Fleet Command <GradientText>Center</GradientText>
          </SectionTitle>
        </div>

        {/* Main dashboard frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border overflow-hidden"
          style={{
            background: C.surface,
            borderColor: C.border,
            boxShadow: C.shadowLg,
          }}
        >
          {/* Browser chrome bar */}
          <div
            className="flex items-center gap-2 px-5 py-3.5 border-b"
            style={{ background: C.surfaceAlt, borderColor: C.border }}
          >
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
            <div
              className="ml-3 flex items-center gap-2 px-4 py-1 rounded-lg text-xs font-medium"
              style={{ background: C.border, color: C.textMuted }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: C.green }}
              />
              FleetIQ Dashboard — Live View
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: C.green }}
              />
              <span className="text-xs font-bold" style={{ color: C.green }}>
                LIVE
              </span>
            </div>
          </div>

          <div className="p-4 lg:p-5">
            {/* Map section — like ArgoLogics */}
            <div
              className="rounded-2xl overflow-hidden relative mb-4"
              style={{ height: 220, background: C.mapBg }}
            >
              {/* City grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(${C.green}15 1px, transparent 1px), linear-gradient(90deg, ${C.green}15 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />
              <svg className="absolute inset-0 w-full h-full">
                {/* Cyan river */}
                <motion.path
                  d="M 0,45% Q 20%,38% 40%,42% T 70%,38% T 100%,35%"
                  fill="none"
                  stroke={C.greenBright}
                  strokeWidth="18"
                  strokeOpacity="0.45"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.8, delay: 0.5, ease: "easeOut" }}
                />
                {/* Green roads */}
                <RoadLine
                  x1={0}
                  y1={35}
                  x2={100}
                  y2={35}
                  color={C.green}
                  delay={0.4}
                />
                <RoadLine
                  x1={0}
                  y1={65}
                  x2={100}
                  y2={65}
                  color={C.green}
                  delay={0.6}
                />
                <RoadLine
                  x1={20}
                  y1={0}
                  x2={20}
                  y2={100}
                  color={C.green}
                  delay={0.5}
                />
                <RoadLine
                  x1={50}
                  y1={0}
                  x2={50}
                  y2={100}
                  color={C.green}
                  delay={0.7}
                />
                <RoadLine
                  x1={78}
                  y1={0}
                  x2={78}
                  y2={100}
                  color={C.green}
                  delay={0.8}
                />
              </svg>
              {/* Search bar overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium"
                  style={{
                    background: C.surface,
                    boxShadow: C.shadow,
                    color: C.textMuted,
                  }}
                >
                  📍 Chennai, Tamil Nadu
                </div>
                <StatusBadge text="In Transit" />
              </div>
              {/* Pins */}
              {vehicles.map((v, i) => (
                <MapPin
                  key={i}
                  x={v.x}
                  y={v.y}
                  color={v.status === "Moving" ? C.green : "#F59E0B"}
                  delay={0.5 + i * 0.2}
                />
              ))}
              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                {["+", "−"].map((btn) => (
                  <div
                    key={btn}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: C.surface,
                      boxShadow: C.shadow,
                      color: C.greenDark,
                    }}
                  >
                    {btn}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: "Delivery volume",
                  val: "1,544",
                  sub: "Delivered this month",
                  change: "96%",
                  changeSub: "Successful deliveries",
                  spark: true,
                },
                {
                  label: "Orders in transit",
                  val: "482",
                  sub: "",
                  change: null,
                  changeSub: null,
                  spark: false,
                },
                {
                  label: "Delayed deliveries",
                  val: "14",
                  sub: "",
                  badge: "4% of all deliveries",
                  spark: false,
                },
                {
                  label: "Fuel cost this month",
                  val: "$18,420",
                  sub: "",
                  spark: false,
                  up: true,
                },
              ].map((stat, i) => (
                <Card key={i} className="p-4 col-span-1">
                  <div
                    className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                    style={{ color: C.textMuted }}
                  >
                    <Icon
                      path={
                        i === 0 ? icons.bar : i === 2 ? icons.bell : icons.truck
                      }
                      size={13}
                      style={{ color: C.green }}
                    />
                    {stat.label}
                  </div>
                  <div
                    className="text-2xl font-extrabold mb-1"
                    style={{ color: C.text }}
                  >
                    {stat.val}
                  </div>
                  {stat.change && (
                    <div className="flex items-end gap-3">
                      <div>
                        <div
                          className="text-xl font-extrabold"
                          style={{ color: C.text }}
                        >
                          {stat.change}
                        </div>
                        <div
                          className="text-[11px]"
                          style={{ color: C.textLight }}
                        >
                          {stat.changeSub}
                        </div>
                      </div>
                    </div>
                  )}
                  {stat.badge && <StatusBadge text={stat.badge} />}
                  {stat.spark && (
                    <div className="mt-2">
                      <Sparkline data={sparkData} />
                    </div>
                  )}
                  {stat.up && (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.green }}
                    >
                      ↑ vs last month
                    </span>
                  )}
                </Card>
              ))}
            </div>

            {/* Speed history */}
            <Card className="p-4" hover={false}>
              <div ref={barRef} className="">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      path={icons.bar}
                      size={14}
                      style={{ color: C.green }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.text }}
                    >
                      Speed History
                    </span>
                    <span className="text-xs" style={{ color: C.textLight }}>
                      (Last 30 min)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {[
                      { label: "Normal", color: "#D1D5DB" },
                      { label: "Mid", color: "#86EFAC" },
                      { label: "Peak", color: C.green },
                    ].map((leg) => (
                      <div key={leg.label} className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ background: leg.color }}
                        />
                        <span
                          className="text-[10px]"
                          style={{ color: C.textLight }}
                        >
                          {leg.label}
                        </span>
                      </div>
                    ))}
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.green }}
                    >
                      Avg: 58 km/h
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {speedData.map((h, i) => (
                    <SpeedBar
                      key={i}
                      height={h}
                      index={i}
                      isInView={barsInView}
                      isActive={i === 29}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {["30m ago", "20m ago", "10m ago", "Now"].map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-mono"
                      style={{ color: C.textLight }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Vehicle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
              {vehicles.slice(0, 3).map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Card className="p-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: C.greenLight }}
                    >
                      <Icon
                        path={icons.truck}
                        size={18}
                        style={{ color: C.green }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-bold truncate"
                        style={{ color: C.text }}
                      >
                        {v.id}
                      </div>
                      <div
                        className="text-[11px] truncate"
                        style={{ color: C.textMuted }}
                      >
                        {v.driver}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Icon
                          path={icons.zap}
                          size={10}
                          style={{ color: C.green }}
                        />
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: C.green }}
                        >
                          {v.speed} km/h
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      text={v.status}
                      color={v.status === "Moving" ? C.green : "#F59E0B"}
                    />
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

// ─── DRIVER APP ───────────────────────────────────────────────────────────────
const DriverApp = () => {
  const [screen, setScreen] = useState(0);
  const screens = ["Login", "Speed", "Location"];

  return (
    <Section
      id="driver-app"
      className="py-24"
      style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel text="Driver Mobile App" />
            <SectionTitle>
              Drivers Stay <GradientText>Connected &amp; Safe</GradientText>
            </SectionTitle>
            <p
              className="mt-4 text-base leading-relaxed mb-10"
              style={{ color: C.textMuted }}
            >
              The FleetIQ driver app is beautifully simple. Login with your
              Driver ID, and we handle everything — live location broadcasting,
              speed tracking, and safety alerts.
            </p>
            <div className="space-y-5">
              {[
                {
                  icon: icons.phone,
                  title: "Instant Login",
                  desc: "Driver ID + Vehicle Number login. No complicated setup.",
                  color: C.green,
                },
                {
                  icon: icons.map,
                  title: "Live Location Sync",
                  desc: "Your GPS streams to the company dashboard in real-time.",
                  color: "#3B82F6",
                },
                {
                  icon: icons.zap,
                  title: "Speed Tracking",
                  desc: "Automatic speed monitoring with visual alerts for safe driving.",
                  color: "#F59E0B",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -25, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: item.color + "15",
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <Icon
                      path={item.icon}
                      size={19}
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <div
                      className="font-bold text-sm mb-1"
                      style={{ color: C.text }}
                    >
                      {item.title}
                    </div>
                    <div className="text-sm" style={{ color: C.textMuted }}>
                      {item.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2 mt-10">
              {screens.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => setScreen(i)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={
                    screen === i
                      ? {
                          background: C.green,
                          color: "#fff",
                          boxShadow: `0 4px 14px ${C.green}50`,
                        }
                      : { background: C.border, color: C.textMuted }
                  }
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-[40px] blur-3xl"
                style={{ background: `${C.green}22` }}
              />
              <div
                className="w-64 h-[520px] rounded-[40px] border overflow-hidden relative"
                style={{
                  background: C.surface,
                  borderColor: C.green + "35",
                  boxShadow:
                    "0 32px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                {/* Status bar */}
                <div
                  className="flex justify-between items-center px-5 pt-4 pb-2"
                  style={{ background: C.surfaceAlt }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: C.text }}
                  >
                    9:41
                  </span>
                  <div className="w-20 h-5 rounded-full bg-black absolute top-2 left-1/2 -translate-x-1/2" />
                  <div className="flex gap-1 items-center">
                    <div
                      className="w-3 h-2 rounded-sm"
                      style={{ background: C.textLight }}
                    />
                    <div
                      className="w-0.5 h-1.5 rounded-full"
                      style={{ background: C.textLight }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {screen === 0 && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-5 pt-5"
                    >
                      <div className="flex items-center gap-2 mb-7">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: C.green }}
                        >
                          <Icon
                            path={icons.truck}
                            size={14}
                            className="text-white"
                          />
                        </div>
                        <span
                          className="font-extrabold text-sm"
                          style={{ color: C.text }}
                        >
                          FleetIQ Driver
                        </span>
                      </div>
                      <h3
                        className="font-extrabold text-xl mb-6"
                        style={{ color: C.text }}
                      >
                        Welcome Back
                      </h3>
                      {["Driver ID", "Vehicle No.", "Full Name"].map((l, i) => (
                        <div key={i} className="mb-3.5">
                          <div
                            className="text-[10px] mb-1 font-semibold uppercase tracking-widest"
                            style={{ color: C.textMuted }}
                          >
                            {l}
                          </div>
                          <div
                            className="rounded-xl px-3 py-2.5 text-xs font-semibold"
                            style={{
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                              color: C.greenDark,
                            }}
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
                        className="mt-5 py-3 rounded-xl text-white text-sm font-bold text-center cursor-pointer"
                        style={{
                          background: C.green,
                          boxShadow: `0 4px 16px ${C.green}50`,
                        }}
                      >
                        Start Driving
                      </motion.div>
                    </motion.div>
                  )}
                  {screen === 1 && (
                    <motion.div
                      key="speed"
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-5 pt-4 text-center"
                    >
                      <div
                        className="font-bold mb-3 text-sm text-left"
                        style={{ color: C.text }}
                      >
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
                            stroke={C.border}
                            strokeWidth="10"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={C.green}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray="251"
                            initial={{ strokeDashoffset: 251 }}
                            animate={{
                              strokeDashoffset: 251 - (62 / 120) * 251,
                            }}
                            transition={{ duration: 1.8, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className="text-3xl font-extrabold"
                            style={{ color: C.text }}
                          >
                            62
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: C.textMuted }}
                          >
                            km/h
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {[
                          ["Max Today", "84 km/h"],
                          ["Avg Speed", "58 km/h"],
                          ["Distance", "124 km"],
                          ["Trips", "3"],
                        ].map(([l, v], i) => (
                          <div
                            key={i}
                            className="rounded-xl p-2.5"
                            style={{
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <div
                              className="text-[9px] font-semibold uppercase tracking-wide"
                              style={{ color: C.textLight }}
                            >
                              {l}
                            </div>
                            <div
                              className="text-xs font-bold mt-0.5"
                              style={{ color: C.text }}
                            >
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
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-5 pt-4"
                    >
                      <div
                        className="font-bold mb-3 text-sm"
                        style={{ color: C.text }}
                      >
                        Live Location
                      </div>
                      <div
                        className="rounded-2xl overflow-hidden relative h-48"
                        style={{ background: C.bg }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `linear-gradient(${C.green}12 1px, transparent 1px), linear-gradient(90deg, ${C.green}12 1px, transparent 1px)`,
                            backgroundSize: "22px 22px",
                          }}
                        />
                        <svg className="absolute inset-0 w-full h-full">
                          <RoadLine
                            x1={10}
                            y1={55}
                            x2={90}
                            y2={55}
                            color={C.green}
                            delay={0}
                          />
                          <RoadLine
                            x1={50}
                            y1={10}
                            x2={50}
                            y2={90}
                            color={C.green}
                            delay={0.2}
                          />
                        </svg>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                          <motion.div
                            animate={{
                              scale: [1, 2.6, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: C.green }}
                          />
                          <div
                            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center relative z-10"
                            style={{
                              background: C.surface,
                              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ background: C.green }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="mt-3 rounded-xl p-3"
                        style={{
                          background: C.surfaceAlt,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          className="text-[10px] mb-1"
                          style={{ color: C.textLight }}
                        >
                          Current Address
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: C.text }}
                        >
                          Anna Nagar, Chennai
                        </div>
                        <div
                          className="text-[10px] mt-0.5 font-mono"
                          style={{ color: C.textLight }}
                        >
                          13.0827° N, 80.2707° E
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Floating labels */}
              <motion.div
                animate={{ x: [0, -5, 0], y: [0, 3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -right-20 top-20 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.green,
                  boxShadow: C.shadow,
                }}
              >
                📍 Location synced
              </motion.div>
              <motion.div
                animate={{ x: [0, 5, 0], y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.2 }}
                className="absolute -left-20 bottom-28 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: "#22C55E",
                  boxShadow: C.shadow,
                }}
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
const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      title: "Register Your Company",
      desc: "Create your FleetIQ account and configure your profile in under 5 minutes.",
      icon: icons.settings,
      color: C.green,
    },
    {
      num: "02",
      title: "Add Vehicles & Drivers",
      desc: "Upload vehicle numbers, driver IDs, license info, and assignments.",
      icon: icons.truck,
      color: "#3B82F6",
    },
    {
      num: "03",
      title: "Driver Logs In via App",
      desc: "Drivers download the app, log in with their ID and vehicle number.",
      icon: icons.phone,
      color: "#8B5CF6",
    },
    {
      num: "04",
      title: "Track in Real-Time",
      desc: "Your command dashboard goes live. Every vehicle, every route, every second.",
      icon: icons.map,
      color: C.green,
    },
  ];
  return (
    <Section id="how-it-works" className="py-24" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <SectionLabel text="How It Works" />
          <SectionTitle>
            Up and Running in <GradientText>Minutes</GradientText>
          </SectionTitle>
        </div>
        <div className="relative">
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-[2px] hidden lg:block rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${C.green}30, transparent)` }} />
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-[2px] hidden lg:block rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="w-full h-full relative"
              style={{
                background: `linear-gradient(90deg, transparent, ${C.green}, ${C.greenBright}, transparent)`,
              }}
            >
               <motion.div 
                 className="absolute top-0 bottom-0 w-32"
                 style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }}
                 animate={{ left: ["-100%", "200%"] }}
                 transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
               />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.13,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  whileHover: { duration: 0.2 }
                }}
                className="text-center relative group cursor-pointer"
              >
                <div className="flex justify-center mb-6 relative">
                  {/* Glowing background blob */}
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4 }}
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full blur-xl z-0"
                    style={{ background: s.color }}
                  />
                  {/* Floating container */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    className="z-10"
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center relative bg-white/70 backdrop-blur-md transition-colors duration-300 group-hover:bg-white"
                      style={{
                        border: `2px solid ${s.color}35`,
                        boxShadow: `0 8px 32px ${s.color}25`,
                      }}
                    >
                      <Icon path={s.icon} size={26} style={{ color: s.color }} className="transition-transform duration-300 group-hover:scale-110" />
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], boxShadow: [`0 0 0 ${s.color}40`, `0 0 14px ${s.color}90`, `0 0 0 ${s.color}40`] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
                        className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center text-white border-2 border-white"
                        style={{
                          background: s.color,
                        }}
                      >
                        {s.num}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
                <h3
                  className="font-bold mb-2 text-[16px] transition-colors duration-300 group-hover:text-black"
                  style={{ color: C.text }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed transition-opacity duration-300 opacity-75 group-hover:opacity-100"
                  style={{ color: C.textMuted }}
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
const Benefits = () => {
  const benefits = [
    {
      icon: icons.shield,
      title: "40% Safety Improvement",
      desc: "AI-powered behavior monitoring reduces accidents and driver incidents significantly.",
      color: C.green,
    },
    {
      icon: icons.fuel,
      title: "25% Fuel Savings",
      desc: "Route optimization and idle-time monitoring cuts fuel costs from day one.",
      color: "#3B82F6",
    },
    {
      icon: icons.eye,
      title: "100% Fleet Visibility",
      desc: "Never lose track of a vehicle. Full 24/7 coverage across your entire fleet.",
      color: "#F59E0B",
    },
    {
      icon: icons.zap,
      title: "60% Less Risk",
      desc: "Early warning alerts and compliance tracking reduce operational and legal risk.",
      color: "#EF4444",
    },
  ];
  return (
    <Section id="benefits" className="py-24" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel text="Business Value" />
            <SectionTitle>
              Real Results for <GradientText>Real Companies</GradientText>
            </SectionTitle>
            <p
              className="mt-5 text-base leading-relaxed"
              style={{ color: C.textMuted }}
            >
              FleetIQ isn&apos;t just software — it&apos;s a measurable ROI
              engine. Travel companies report dramatic improvements across
              safety, cost, and efficiency.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 px-7 py-3.5 rounded-xl text-white font-bold flex items-center gap-2"
              style={{
                background: C.green,
                boxShadow: `0 6px 24px ${C.green}45`,
              }}
            >
              View Case Studies <Icon path={icons.arrow} size={16} />
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.88, y: 18 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Card className="p-5 h-full">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: b.color + "14" }}
                  >
                    <Icon path={b.icon} size={20} style={{ color: b.color }} />
                  </div>
                  <h3
                    className="font-bold text-sm mb-1"
                    style={{ color: C.text }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: C.textMuted }}
                  >
                    {b.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const Testimonials = () => {
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
    <Section id="pricing" className="py-24" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="Trusted By Leaders" />
          <SectionTitle>
            Companies That <GradientText>Trust FleetIQ</GradientText>
          </SectionTitle>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {logos.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Card
                className="px-5 py-2.5 text-sm font-bold cursor-default"
                style={{ color: C.textMuted }}
                hover
              >
                {l}
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.13,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Card className="p-6 h-full relative overflow-hidden">
                {/* Top green accent */}
                <div
                  className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${C.green}, transparent)`,
                  }}
                />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.stars)].map((_, j) => (
                    <Icon
                      key={j}
                      path={icons.star}
                      size={14}
                      style={{ color: "#F59E0B", fill: "#F59E0B" }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: C.text }}
                >
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold"
                    style={{ background: C.green }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: C.text }}
                    >
                      {r.name}
                    </div>
                    <div className="text-xs" style={{ color: C.textMuted }}>
                      {r.role}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = ({ onGetStarted }) => (
  <Section id="contact" className="py-8" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,0.8)" }}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${C.greenDark}, ${C.green})`,
          boxShadow: `0 20px 60px ${C.green}40`,
        }}
      >
        {/* Subtle grid on green bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mb-4 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
          >
            <Icon path={icons.truck} size={22} className="text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
            Start Managing Your Fleet Today
          </h2>
          <p className="text-base sm:text-lg mb-6 text-white/80">
            Join 500+ travel companies running smarter, safer fleets with
            FleetIQ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl font-bold text-base flex items-center gap-2.5"
              style={{
                background: C.surface,
                color: C.green,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              Start Free Trial <Icon path={icons.arrow} size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-9 py-4 rounded-xl font-semibold text-base text-white/90 border border-white/30 hover:border-white/60 hover:text-white transition-all duration-250"
            >
              Schedule a Demo
            </motion.button>
          </div>
          <p className="text-xs mt-6 text-white/50">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </motion.div>
    </div>
  </Section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer
    className="border-t py-14"
    style={{ background: C.surface, borderColor: C.border }}
  >
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: C.green }}
            >
              <Icon path={icons.truck} size={16} className="text-white" />
            </div>
            <span
              className="font-extrabold text-[17px]"
              style={{ color: C.text }}
            >
              Fleet<span style={{ color: C.green }}>IQ</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
            The intelligent fleet management platform for modern travel
            companies.
          </p>
          <div className="flex gap-3 mt-5">
            {[icons.twitter, icons.linkedin, icons.github].map((ic, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.12, y: -2 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                style={{
                  background: C.surfaceAlt,
                  borderColor: C.green + "35",
                  color: C.textMuted,
                }}
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
            <h4 className="font-bold text-sm mb-4" style={{ color: C.text }}>
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm hover:text-yellow-600 transition-colors"
                    style={{ color: C.textMuted }}
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
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t text-sm"
        style={{ borderColor: C.border, color: C.textLight }}
      >
        <span>© 2025 FleetIQ Technologies. All rights reserved.</span>
        <span className="flex items-center gap-1.5">
          Built for{" "}
          <Icon path={icons.truck} size={14} style={{ color: C.green }} />{" "}
          fleets worldwide
        </span>
      </div>
    </div>
  </footer>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="relative" style={{ background: "#E2E8F0" }}>
      {/* Abstract background for glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px]" style={{ background: "rgba(34,197,94,0.15)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px]" style={{ background: "rgba(34,211,238,0.15)" }} />
        <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full blur-[90px]" style={{ background: "rgba(212,175,55,0.12)" }} />
      </div>
      <div className="relative z-10">
      <style>{`
        /* Inter — same font as ArgoLogics screenshot */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        html { scroll-behavior: smooth; }

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .font-mono { font-family: 'JetBrains Mono', monospace; }

        /* Green scrollbar — ArgoLogics */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F0F4F8; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #22C55E, #16A34A);
          border-radius: 10px;
        }

        ::selection { background: rgba(34,197,94,0.25); color: #111827; }

        a, button {
          transition-property: color, background-color, border-color, transform, box-shadow, opacity;
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          transition-duration: 220ms;
        }
      `}</style>

      <Navbar onGetStarted={() => setShowRegister(true)} />
      <Hero />
      <Features />
      <DashboardPreview />
      <DriverApp />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA onGetStarted={() => setShowRegister(true)} />
      <Footer />

      <RegisterCompanyModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
      />
      </div>
    </div>
  );
}
