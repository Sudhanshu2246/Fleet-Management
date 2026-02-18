import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdGpsFixed,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
  MdShield,
  MdCircle,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Live stats shown on the left panel ────────────────────────────────────── */
const PANEL_STATS = [
  { label: "Devices Online", value: "3,842", color: "#198754" },
  { label: "GPS Updates / sec", value: "1,000", color: "#0DCAF0" },
  { label: "Organisations", value: "48", color: "#AF1763" },
];

/* ── Feature list ─────────────────────────────────────────────────────────── */
const FEATURES = [
  "Real-time GPS tracking at < 2s latency",
  "5,000+ concurrent device support",
  "Geofence entry / exit alerts",
  "SOS emergency response system",
  "Multi-organisation SaaS support",
];

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email address is required.");
    if (!password) return setError("Password is required.");

    setLoading(true);
    /* Simulate API call — replace with real auth */
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div style={styles.root}>
      {/* ── Left: Branded panel ──────────────────────────────────────────── */}
      <div style={styles.panel}>
        {/* Animated GPS grid */}
        <div style={styles.grid} />

        {/* Radial glow blobs */}
        <div
          style={{
            ...styles.blob,
            top: "10%",
            left: "20%",
            background: "rgba(175,23,99,0.18)",
            width: 320,
            height: 320,
          }}
        />
        <div
          style={{
            ...styles.blob,
            bottom: "15%",
            right: "10%",
            background: "rgba(13,110,253,0.12)",
            width: 260,
            height: 260,
          }}
        />
        <div
          style={{
            ...styles.blob,
            top: "50%",
            left: "50%",
            background: "rgba(13,202,240,0.08)",
            width: 200,
            height: 200,
            transform: "translate(-50%,-50%)",
          }}
        />

        {/* Content */}
        <div style={styles.panelContent}>
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <MdGpsFixed size={22} color="#fff" />
            </div>
            <div>
              <div style={styles.logoName}>Fleetiq</div>
              <div style={styles.logoBadge}>ADMIN</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginTop: "auto", marginBottom: 0 }}>
            <div style={styles.panelEyebrow}>
              <RiSignalTowerFill size={13} color="#0DCAF0" />
              <span>Live Operations Platform</span>
            </div>

            <h1 style={styles.panelHeading}>
              Command your fleet
              <br />
              <span style={{ color: "#AF1763" }}>in real-time.</span>
            </h1>

            <p style={styles.panelSub}>
              Track 5,000+ devices simultaneously with sub-2-second GPS updates,
              geofencing, SOS alerts, and full trip analytics — all in one
              dashboard.
            </p>

            {/* Feature list */}
            <ul
              style={{
                listStyle: "none",
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {FEATURES.map((f) => (
                <li key={f} style={styles.featureItem}>
                  <MdCircle
                    size={6}
                    style={{ color: "#AF1763", flexShrink: 0, marginTop: 2 }}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div style={styles.panelFade} />
      </div>

      {/* ── Right: Login form ────────────────────────────────────────────── */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <div style={styles.logoIcon}>
              <MdGpsFixed size={18} color="#fff" />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#f0f2f8",
                fontFamily: "var(--font-sora, 'Sora', sans-serif)",
              }}
            >
              Fleetiq
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={styles.formHeading}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your admin account</p>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <MdShield size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Email */}
            <div>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap(emailFocus)}>
                <MdEmail
                  size={17}
                  style={{
                    color: emailFocus ? "#AF1763" : "#5a6380",
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                />
                <input
                  type="email"
                  placeholder="admin@fleetiq.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  autoComplete="email"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div style={styles.inputWrap(passFocus)}>
                <MdLock
                  size={17}
                  style={{
                    color: passFocus ? "#AF1763" : "#5a6380",
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  autoComplete="current-password"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {showPass ? (
                    <MdVisibilityOff size={17} />
                  ) : (
                    <MdVisibility size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={styles.checkRow}>
              <div
                onClick={() => setRemember((v) => !v)}
                style={{
                  ...styles.checkbox,
                  background: remember ? "#AF1763" : "transparent",
                  borderColor: remember ? "#AF1763" : "rgba(255,255,255,0.15)",
                }}
              >
                {remember && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "#a8b0c8",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn(loading)}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#8d1250";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#AF1763";
              }}
            >
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                <>
                  Sign In to Dashboard
                  <MdArrowForward size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Register link */}
          <p style={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.switchLink}>
              Create account
            </Link>
          </p>

          {/* Security note */}
          <div style={styles.securityNote}>
            <MdShield size={13} style={{ color: "#198754", flexShrink: 0 }} />
            <span>Secured with JWT authentication & HTTPS encryption</span>
          </div>
        </div>
      </div>

      <style>{AUTH_STYLES}</style>
    </div>
  );
}

/* ── Inline style objects ─────────────────────────────────────────────────── */
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f1117",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Left panel */
  panel: {
    flex: "0 0 46%",
    position: "relative",
    overflow: "hidden",
    background: "#191C24",
    display: "flex",
    flexDirection: "column",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(13,110,253,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(13,110,253,0.07) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    animation: "gridMove 20s linear infinite",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  panelFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    background: "linear-gradient(to top, #191C24, transparent)",
    pointerEvents: "none",
  },
  panelContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    padding: "40px 48px 48px",
    height: "100%",
  },

  /* Logo */
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: "auto",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    background: "linear-gradient(135deg, #AF1763 0%, #7b0e44 100%)",
    boxShadow: "0 4px 16px rgba(175,23,99,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoName: {
    fontSize: 17,
    fontWeight: 700,
    color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif",
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
  },
  logoBadge: {
    fontSize: 9,
    fontWeight: 700,
    color: "#AF1763",
    letterSpacing: "0.12em",
    marginTop: 2,
  },

  /* Panel text */
  panelEyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: "#0DCAF0",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  panelHeading: {
    fontSize: 36,
    fontWeight: 700,
    color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  panelSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.65,
    marginTop: 14,
    maxWidth: 380,
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.4,
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginTop: 32,
  },
  statChip: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)",
  },

  /* Right form side */
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    overflowY: "auto",
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
    animation: "slideUp 0.5s cubic-bezier(0.4,0,0.2,1) both",
  },

  /* Mobile logo (hidden on desktop) */
  mobileLogo: {
    display: "none",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
    justifyContent: "center",
  },

  /* Form elements */
  formHeading: {
    fontSize: 26,
    fontWeight: 700,
    color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif",
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    marginBottom: 6,
  },
  formSub: {
    fontSize: 14,
    color: "#5a6380",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#a8b0c8",
    marginBottom: 6,
    letterSpacing: "0.02em",
  },
  inputWrap: (focused) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 46,
    padding: "0 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: `1.5px solid ${focused ? "rgba(175,23,99,0.55)" : "rgba(255,255,255,0.08)"}`,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(175,23,99,0.1)" : "none",
  }),
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#f0f2f8",
    fontFamily: "'DM Sans', sans-serif",
    caretColor: "#AF1763",
    minWidth: 0,
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#5a6380",
    display: "flex",
    padding: 2,
    transition: "color 0.15s",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
  submitBtn: (loading) => ({
    height: 46,
    borderRadius: 10,
    background: loading ? "#6b0d3c" : "#AF1763",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    boxShadow: "0 4px 18px rgba(175,23,99,0.35)",
    transition: "background 0.15s, transform 0.1s",
    opacity: loading ? 0.85 : 1,
  }),
  spinner: {
    width: 18,
    height: 18,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.75s linear infinite",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 14px",
    borderRadius: 9,
    background: "rgba(171,46,60,0.12)",
    border: "1px solid rgba(171,46,60,0.3)",
    color: "#e07b88",
    fontSize: 13,
    marginBottom: 4,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.07)",
  },
  dividerText: {
    fontSize: 12,
    color: "#5a6380",
    flexShrink: 0,
  },
  forgotLink: {
    fontSize: 12,
    color: "#AF1763",
    textDecoration: "none",
    fontWeight: 500,
  },
  switchText: {
    fontSize: 13,
    color: "#5a6380",
    textAlign: "center",
  },
  switchLink: {
    color: "#AF1763",
    textDecoration: "none",
    fontWeight: 600,
  },
  securityNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 11,
    color: "#5a6380",
    marginTop: 20,
  },
};

/* ── Shared auth CSS keyframes ────────────────────────────────────────────── */
const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  @keyframes gridMove {
    0%   { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blobPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.08); opacity: 0.85; }
  }

  .auth-input::placeholder { color: #3a4060; }

  /* Responsive: hide panel on small screens */
  @media (max-width: 900px) {
    .auth-panel { display: none !important; }
    .auth-mobile-logo { display: flex !important; }
  }
`;
