import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdGpsFixed,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdBusiness,
  MdPhone,
  MdArrowForward,
  MdArrowBack,
  MdCheckCircle,
  MdShield,
  MdCheck,
} from "react-icons/md";
import { RiSignalTowerFill } from "react-icons/ri";

/* ── Step definitions ─────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Account",      icon: MdPerson   },
  { id: 2, label: "Organisation", icon: MdBusiness },
  { id: 3, label: "Security",     icon: MdShield   },
];

/* ── Role options ─────────────────────────────────────────────────────────── */
const ROLES = [
  { value: "super_admin", label: "Super Admin",   desc: "Full system access"         },
  { value: "fleet_mgr",   label: "Fleet Manager", desc: "Manage vehicles & tracking" },
  { value: "dispatcher",  label: "Dispatcher",    desc: "Monitor live operations"    },
];

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  /* Form state */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    orgName: "",
    orgSize: "",
    role: "super_admin",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  /* Password visibility */
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Focus states */
  const [focused, setFocused] = useState({});
  const focusProps = (name) => ({
    onFocus: () => setFocused((f) => ({ ...f, [name]: true })),
    onBlur:  () => setFocused((f) => ({ ...f, [name]: false })),
  });

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  /* Password strength */
  const passStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passStrength];
  const strengthColor = ["", "#AB2E3C", "#FFC107", "#0DCAF0", "#198754"][passStrength];

  /* Validation per step */
  const validate = () => {
    if (step === 1) {
      if (!form.firstName.trim()) return "First name is required.";
      if (!form.email.trim())     return "Email address is required.";
      if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    }
    if (step === 2) {
      if (!form.orgName.trim()) return "Organisation name is required.";
      if (!form.orgSize)        return "Please select your fleet size.";
    }
    if (step === 3) {
      if (!form.password)                           return "Password is required.";
      if (form.password.length < 8)                 return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword)   return "Passwords do not match.";
      if (!form.agree)                              return "You must accept the terms to continue.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validate();
    if (err) return setError(err);
    setError("");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setDone(true);
  };

  /* ── Success screen ─────────────────────────────────────────────────── */
  if (done) {
    return (
      <div style={{ ...styles.root, justifyContent: "center", alignItems: "center" }}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <MdCheckCircle size={40} color="#198754" />
          </div>
          <h2 style={{ ...styles.formHeading, textAlign: "center", marginBottom: 8 }}>
            Account Created!
          </h2>
          <p style={{ ...styles.formSub, textAlign: "center", marginBottom: 28 }}>
            Welcome to Fleetiq. Your organisation <strong style={{ color: "#f0f2f8" }}>{form.orgName}</strong> has been set up successfully.
          </p>
          <button
            className="fleet-btn-primary"
            style={{ width: "100%", justifyContent: "center", height: 46, fontSize: 14 }}
            onClick={() => navigate("/login")}
          >
            Go to Login <MdArrowForward size={16} />
          </button>
        </div>
        <style>{AUTH_STYLES}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div style={styles.panel}>
        <div style={styles.grid} />
        <div style={{ ...styles.blob, top: "5%",   left: "15%",  background: "rgba(13,202,240,0.12)", width: 300, height: 300 }} />
        <div style={{ ...styles.blob, bottom: "10%", right: "5%", background: "rgba(175,23,99,0.15)",  width: 280, height: 280 }} />
        <div style={{ ...styles.blob, top: "45%",  left: "40%",   background: "rgba(13,110,253,0.08)", width: 220, height: 220, transform: "translate(-50%,-50%)" }} />

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

          {/* Main copy */}
          <div style={{ marginTop: "auto" }}>
            <div style={styles.panelEyebrow}>
              <RiSignalTowerFill size={13} color="#0DCAF0" />
              <span>Get Started Today</span>
            </div>
            <h1 style={styles.panelHeading}>
              Start tracking<br />
              <span style={{ color: "#0DCAF0" }}>your fleet now.</span>
            </h1>
            <p style={styles.panelSub}>
              Set up your organisation in under 3 minutes. Connect your first device and go live immediately.
            </p>

            {/* Steps preview */}
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 16 }}>
              {STEPS.map((s) => {
                const Icon = s.icon;
                const isComplete = step > s.id;
                const isActive   = step === s.id;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isComplete
                          ? "rgba(25,135,84,0.18)"
                          : isActive
                          ? "rgba(175,23,99,0.2)"
                          : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${isComplete ? "rgba(25,135,84,0.4)" : isActive ? "rgba(175,23,99,0.4)" : "rgba(255,255,255,0.07)"}`,
                        transition: "all 0.3s",
                        flexShrink: 0,
                      }}
                    >
                      {isComplete
                        ? <MdCheck size={16} color="#198754" />
                        : <Icon size={16} color={isActive ? "#AF1763" : "rgba(255,255,255,0.3)"} />
                      }
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: isComplete ? "#198754" : isActive ? "#f0f2f8" : "rgba(255,255,255,0.3)",
                          transition: "color 0.3s",
                        }}
                      >
                        Step {s.id}: {s.label}
                      </div>
                      {isActive && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          Currently filling
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={styles.panelFade} />
      </div>

      {/* ── Right: Multi-step form ──────────────────────────────────────── */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>

          {/* Mobile logo */}
          <div style={{ ...styles.mobileLogo, marginBottom: 24 }}>
            <div style={styles.logoIcon}>
              <MdGpsFixed size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f2f8", fontFamily: "Sora, sans-serif" }}>
             Fleetiq
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              {STEPS.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: step > s.id
                        ? "#198754"
                        : step === s.id
                        ? "#AF1763"
                        : "rgba(255,255,255,0.07)",
                      color: step >= s.id ? "#fff" : "#5a6380",
                      transition: "all 0.3s",
                      border: `1.5px solid ${step === s.id ? "#AF1763" : "transparent"}`,
                      boxShadow: step === s.id ? "0 0 0 3px rgba(175,23,99,0.2)" : "none",
                    }}
                  >
                    {step > s.id ? <MdCheck size={13} /> : s.id}
                  </div>
                  <span style={{ fontSize: 12, color: step >= s.id ? "#a8b0c8" : "#5a6380", transition: "color 0.3s" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Track */}
            <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #AF1763, #0D6EFD)",
                  width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                  transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={styles.formHeading}>
              {step === 1 && "Create your account"}
              {step === 2 && "Your organisation"}
              {step === 3 && "Secure your account"}
            </h2>
            <p style={styles.formSub}>
              {step === 1 && "Enter your personal details to get started"}
              {step === 2 && "Tell us about your fleet operation"}
              {step === 3 && "Set a strong password to protect your admin account"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <MdShield size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* ── STEP 1: Account details ─────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FieldWrap label="First Name" icon={MdPerson} focused={focused.firstName}>
                  <input
                    placeholder="John"
                    value={form.firstName}
                    onChange={set("firstName")}
                    {...focusProps("firstName")}
                    style={styles.input}
                  />
                </FieldWrap>
                <FieldWrap label="Last Name" icon={MdPerson} focused={focused.lastName}>
                  <input
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={set("lastName")}
                    {...focusProps("lastName")}
                    style={styles.input}
                  />
                </FieldWrap>
              </div>

              <FieldWrap label="Email Address" icon={MdEmail} focused={focused.email}>
                <input
                  type="email"
                  placeholder="admin@yourfleet.com"
                  value={form.email}
                  onChange={set("email")}
                  {...focusProps("email")}
                  style={styles.input}
                  autoComplete="email"
                />
              </FieldWrap>

              <FieldWrap label="Phone Number (optional)" icon={MdPhone} focused={focused.phone}>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={set("phone")}
                  {...focusProps("phone")}
                  style={styles.input}
                />
              </FieldWrap>
            </div>
          )}

          {/* ── STEP 2: Organisation ────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FieldWrap label="Organisation Name" icon={MdBusiness} focused={focused.orgName}>
                <input
                  placeholder="Acme Logistics Pvt. Ltd."
                  value={form.orgName}
                  onChange={set("orgName")}
                  {...focusProps("orgName")}
                  style={styles.input}
                />
              </FieldWrap>

              {/* Fleet size */}
              <div>
                <label style={styles.label}>Fleet Size</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { value: "1-50",    label: "1 – 50",    sub: "Small fleet"    },
                    { value: "50-200",  label: "50 – 200",  sub: "Medium fleet"   },
                    { value: "200-500", label: "200 – 500", sub: "Large fleet"    },
                    { value: "500+",    label: "500+",      sub: "Enterprise"     },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, orgSize: opt.value }))}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 9,
                        border: `1.5px solid ${form.orgSize === opt.value ? "rgba(175,23,99,0.55)" : "rgba(255,255,255,0.08)"}`,
                        background: form.orgSize === opt.value ? "rgba(175,23,99,0.1)" : "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        boxShadow: form.orgSize === opt.value ? "0 0 0 3px rgba(175,23,99,0.1)" : "none",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: form.orgSize === opt.value ? "#f0f2f8" : "#a8b0c8" }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 10, color: "#5a6380", marginTop: 2 }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={styles.label}>Your Role</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 14px",
                        borderRadius: 9,
                        border: `1.5px solid ${form.role === r.value ? "rgba(175,23,99,0.55)" : "rgba(255,255,255,0.07)"}`,
                        background: form.role === r.value ? "rgba(175,23,99,0.08)" : "rgba(255,255,255,0.03)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: `2px solid ${form.role === r.value ? "#AF1763" : "rgba(255,255,255,0.2)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "border-color 0.15s",
                        }}
                      >
                        {form.role === r.value && (
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#AF1763" }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: form.role === r.value ? "#f0f2f8" : "#a8b0c8" }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#5a6380" }}>{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Security ────────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Password */}
              <div>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrap(focused.password)}>
                  <MdLock size={17} style={{ color: focused.password ? "#AF1763" : "#5a6380", flexShrink: 0, transition: "color 0.2s" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    {...focusProps("password")}
                    style={styles.input}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                    {showPass ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background: i <= passStrength ? strengthColor : "rgba(255,255,255,0.07)",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColor, fontWeight: 500 }}>
                      {strengthLabel}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrap(focused.confirmPassword)}>
                  <MdLock size={17} style={{ color: focused.confirmPassword ? "#AF1763" : "#5a6380", flexShrink: 0, transition: "color 0.2s" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    {...focusProps("confirmPassword")}
                    style={styles.input}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                    {showConfirm ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <div style={{ fontSize: 11, color: "#AB2E3C", marginTop: 5 }}>
                    Passwords do not match
                  </div>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div style={{ fontSize: 11, color: "#198754", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                    <MdCheck size={13} /> Passwords match
                  </div>
                )}
              </div>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => setForm((f) => ({ ...f, agree: !f.agree }))}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: `1.5px solid ${form.agree ? "#AF1763" : "rgba(255,255,255,0.15)"}`,
                    background: form.agree ? "#AF1763" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {form.agree && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#a8b0c8", lineHeight: 1.5, userSelect: "none" }}>
                  I agree to the{" "}
                  <a href="#" style={{ color: "#AF1763", textDecoration: "none" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "#AF1763", textDecoration: "none" }}>Privacy Policy</a>.
                  Fleetiq stores data securely with HTTPS and AES-256 encryption.
                </span>
              </label>
            </div>
          )}

          {/* ── Navigation buttons ──────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  ...styles.backBtn,
                  flex: step === STEPS.length ? "0 0 auto" : 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              >
                <MdArrowBack size={16} /> Back
              </button>
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                style={{ ...styles.nextBtn, flex: 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#8d1250")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#AF1763")}
              >
                Continue <MdArrowForward size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...styles.nextBtn, flex: 1, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? (
                  <span style={styles.spinner} />
                ) : (
                  <>Create Account <MdArrowForward size={16} /></>
                )}
              </button>
            )}
          </div>

          {/* Sign in link */}
          <p style={{ ...styles.switchText, marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>

          {/* Security note */}
          <div style={styles.securityNote}>
            <MdShield size={13} style={{ color: "#198754", flexShrink: 0 }} />
            <span>Your data is encrypted with AES-256 at rest</span>
          </div>
        </div>
      </div>

      <style>{AUTH_STYLES}</style>
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────────────────────── */
function FieldWrap({ label, icon: Icon, focused, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrap(focused)}>
        <Icon size={17} style={{ color: focused ? "#AF1763" : "#5a6380", flexShrink: 0, transition: "color 0.2s" }} />
        {children}
      </div>
    </div>
  );
}

/* ── Shared styles object ────────────────────────────────────────────────── */
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f1117",
    fontFamily: "'DM Sans', sans-serif",
  },
  panel: {
    flex: "0 0 44%",
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
      "linear-gradient(rgba(13,110,253,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(13,110,253,0.06) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    animation: "gridMove 22s linear infinite",
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
    height: 100,
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
  logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" },
  logoIcon: {
    width: 40, height: 40, borderRadius: 11,
    background: "linear-gradient(135deg, #AF1763, #7b0e44)",
    boxShadow: "0 4px 16px rgba(175,23,99,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoName: {
    fontSize: 17, fontWeight: 700, color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em", lineHeight: 1.1,
  },
  logoBadge: { fontSize: 9, fontWeight: 700, color: "#AF1763", letterSpacing: "0.12em", marginTop: 2 },
  panelEyebrow: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 600, color: "#0DCAF0",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
  },
  panelHeading: {
    fontSize: 34, fontWeight: 700, color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif", lineHeight: 1.2, letterSpacing: "-0.02em",
  },
  panelSub: {
    fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65, marginTop: 12, maxWidth: 360,
  },
  formSide: {
    flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "40px 24px", overflowY: "auto",
  },
  formCard: {
    width: "100%", maxWidth: 440,
    animation: "slideUp 0.45s cubic-bezier(0.4,0,0.2,1) both",
    paddingTop: 20,
  },
  mobileLogo: {
    display: "none", alignItems: "center", gap: 10, justifyContent: "center",
  },
  formHeading: {
    fontSize: 24, fontWeight: 700, color: "#f0f2f8",
    fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 5,
  },
  formSub: { fontSize: 13, color: "#5a6380" },
  label: {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#a8b0c8", marginBottom: 6, letterSpacing: "0.02em",
  },
  inputWrap: (focused) => ({
    display: "flex", alignItems: "center", gap: 10,
    height: 44, padding: "0 13px", borderRadius: 9,
    background: "rgba(255,255,255,0.04)",
    border: `1.5px solid ${focused ? "rgba(175,23,99,0.55)" : "rgba(255,255,255,0.08)"}`,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? "0 0 0 3px rgba(175,23,99,0.1)" : "none",
  }),
  input: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    fontSize: 13, color: "#f0f2f8", fontFamily: "'DM Sans', sans-serif",
    caretColor: "#AF1763", minWidth: 0,
  },
  eyeBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#5a6380", display: "flex", padding: 2,
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: 9,
    background: "rgba(171,46,60,0.12)", border: "1px solid rgba(171,46,60,0.3)",
    color: "#e07b88", fontSize: 13, marginBottom: 4,
  },
  nextBtn: {
    height: 44, borderRadius: 9,
    background: "#AF1763", color: "#fff", border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    boxShadow: "0 4px 16px rgba(175,23,99,0.35)",
    transition: "background 0.15s",
  },
  backBtn: {
    height: 44, borderRadius: 9,
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    color: "#a8b0c8", fontSize: 13, fontWeight: 500,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    transition: "background 0.15s", padding: "0 18px",
  },
  spinner: {
    width: 18, height: 18,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.75s linear infinite",
  },
  switchText: { fontSize: 13, color: "#5a6380", textAlign: "center" },
  switchLink: { color: "#AF1763", textDecoration: "none", fontWeight: 600 },
  securityNote: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 6, fontSize: 11, color: "#5a6380", marginTop: 16,
  },
  successCard: {
    width: "100%", maxWidth: 400,
    background: "#191C24",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 40,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    animation: "slideUp 0.4s ease both",
  },
  successIcon: {
    width: 72, height: 72, borderRadius: "50%",
    background: "rgba(25,135,84,0.12)",
    border: "2px solid rgba(25,135,84,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  },
};

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
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .auth-panel { display: none !important; }
  }
`;