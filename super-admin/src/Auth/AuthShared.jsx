import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* ─── DESIGN TOKENS (matching home page) ──────────────────────────────────────── */
export const C = {
  dark: "#F0F4F8",
  darker: "#E2E8F0",
  card: "rgba(255, 255, 255, 0.65)",
  card2: "rgba(255, 255, 255, 0.45)",
  border: "rgba(255, 255, 255, 0.6)",
  text: "#111827",
  textSec: "#4B5563",
  textMut: "#6B7280",
  cyan: "#D4AF37",
  blue: "#D4AF37",
  violet: "#B68A1F",
  green: "#D4AF37",
  red: "#ef4444",
  yellow: "#F4D46B",
};

/* ─── ICON PRIMITIVES (unchanged) ────────────────────────────────────────────── */
export const Ico = ({
  d,
  size = 20,
  color = "currentColor",
  fill = "none",
  stroke = 1.6,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

export const Icons = {
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6L6 18M6 6l12 12",
  map: [
    "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  ],
  zap: "M13 10V3L4 14h7v7l9-11h-7z",
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  chart: ["M18 20V10", "M12 20V4", "M6 20v-6"],
  bell: [
    "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9",
    "M13.73 21a2 2 0 01-3.46 0",
  ],
  truck: [
    "M1 3h15v13H1z",
    "M16 8h4l3 3v5h-7V8z",
    "M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    "M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  ],
  user: [
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2",
    "M12 11a4 4 0 100-8 4 4 0 000 8z",
  ],
  lock: [
    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z",
    "M7 11V7a5 5 0 0110 0v4",
  ],
  mail: [
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
    "M22 6l-10 7L2 6",
  ],
  phone: [
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  ],
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff: [
    "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24",
    "M1 1l22 22",
  ],
  database: [
    "M12 2C6.48 2 2 3.79 2 6s4.48 4 10 4 10-1.79 10-4-4.48-4-10-4z",
    "M2 6v6c0 2.21 4.48 4 10 4s10-1.79 10-4V6",
    "M2 12v6c0 2.21 4.48 4 10 4s10-1.79 10-4v-6",
  ],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  building: [
    "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3",
  ],
};

// Shared field components
export const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  required,
  rightEl,
  value,
  onChange,
  error,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.textSec,
        letterSpacing: "0.05em",
      }}
    >
      {label}
      {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <div
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            opacity: 0.4,
          }}
        >
          <Ico d={Icons[icon]} size={15} color={C.textSec} />
        </div>
      )}
      <input
        name={name}
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "#ffffff", // Solid white for inputs on light gray bg
          border: `1px solid ${error ? C.red + "80" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 10,
          color: C.text,
          fontSize: 14,
          padding: icon ? "11px 14px 11px 38px" : "11px 14px",
          paddingRight: rightEl ? 42 : 14,
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = error ? C.red + "80" : C.cyan)
        }
        onBlur={(e) =>
          (e.target.style.borderColor = error ? C.red + "80" : "rgba(0,0,0,0.1)")
        }
      />
      {rightEl}
    </div>
    {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
  </div>
);
