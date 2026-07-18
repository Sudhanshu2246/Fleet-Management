import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, registerCompany } from "../../Redux/Thunks/auth.thunks";
import { useNavigate } from "react-router-dom";
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

// Shared field components (hoisted to keep focus/state stable across renders)
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
          background: C.dark,
          border: `1px solid ${error ? C.red + "80" : C.border}`,
          borderRadius: 10,
          color: C.text,
          fontSize: 14,
          padding: icon ? "11px 14px 11px 38px" : "11px 14px",
          paddingRight: rightEl ? 42 : 14,
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = error ? C.red + "80" : C.cyan + "60")
        }
        onBlur={(e) =>
          (e.target.style.borderColor = error ? C.red + "80" : C.border)
        }
      />
      {rightEl}
    </div>
    {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
  </div>
);

export const SelectField = ({
  label,
  name,
  options,
  required,
  value,
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
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
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: C.dark,
          border: `1px solid ${error ? C.red + "80" : open ? C.cyan + "60" : C.border}`,
          borderRadius: 10,
          color: value ? C.text : C.textMut,
          fontSize: 14,
          padding: "11px 14px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s",
        }}
      >
        <span>{selectedLabel || "Select company type"}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <Ico d={Icons.arrow} size={14} color={C.textSec} />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div 
              onClick={() => setOpen(false)} 
              style={{ position: "fixed", inset: 0, zIndex: 100 }} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: 6,
                background: C.card,
                backdropFilter: "blur(24px)",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 101,
              }}
            >
              {options.map((o) => (
                <div
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  style={{
                    padding: "12px 14px",
                    fontSize: 14,
                    color: C.text,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {o.label}
                  {value === o.value && (
                    <Ico d={Icons.check} size={14} color={C.cyan} />
                  )}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
    </div>
  );
};

export const RightContent = ({ mode, success, step }) => {
  if (mode === "login") {
    return (
      <div style={{ padding: "32px 24px" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            boxShadow: `0 8px 20px ${C.cyan}40`,
          }}
        >
          <Ico d={Icons.truck} color="#fff" size={24} />
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: C.text,
            marginBottom: 12,
            letterSpacing: -0.5,
          }}
        >
          Welcome back to FleetIQ
        </h2>
        <p
          style={{
            color: C.textSec,
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Sign in to access your fleet command center, monitor vehicles in
          real‑time, and manage drivers.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "map", text: "Live GPS tracking" },
            { icon: "zap", text: "Speed & safety alerts" },
            { icon: "shield", text: "Driver behavior analytics" },
          ].map((item, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${C.cyan}15`,
                  border: `1px solid ${C.cyan}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ico d={Icons[item.icon]} size={16} color={C.cyan} />
              </div>
              <span style={{ color: C.textSec, fontSize: 14 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${C.green}20`,
            border: `1px solid ${C.green}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Ico d={Icons.check} color={C.green} size={32} stroke={2.5} />
        </motion.div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            marginBottom: 12,
          }}
        >
          You're all set!
        </h3>
        <p style={{ color: C.textSec, fontSize: 14, lineHeight: 1.6 }}>
          Your company has been registered. Check your email to verify your
          account.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          boxShadow: `0 8px 20px ${C.cyan}40`,
        }}
      >
        <Ico d={Icons.building} color="#fff" size={24} />
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: C.text,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}
      >
        Join 500+ travel companies
      </h2>
      <p
        style={{
          color: C.textSec,
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Register your company in two simple steps and start managing your fleet
        with real‑time intelligence.
      </p>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: step === 1 ? `${C.cyan}20` : `${C.green}20`,
              border: `1px solid ${step === 1 ? C.cyan : C.green}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: step === 1 ? C.cyan : C.green,
              fontSize: 14,
            }}
          >
            1
          </div>
          <div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>
              Admin Account
            </div>
            <div style={{ fontSize: 12, color: C.textMut }}>
              Your login credentials
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: step === 2 ? `${C.cyan}20` : `${C.textMut}20`,
              border: `1px solid ${step === 2 ? C.cyan : C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: step === 2 ? C.cyan : C.textMut,
              fontSize: 14,
            }}
          >
            2
          </div>
          <div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>
              Company Details
            </div>
            <div style={{ fontSize: 12, color: C.textMut }}>
              Your organization profile
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          background: C.card2,
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <Ico d={Icons.shield} size={18} color={C.cyan} />
          <div>
            <div
              style={{
                fontWeight: 600,
                color: C.text,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Secure & Compliant
            </div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>
              Your data is encrypted and never shared. GST details are verified
              securely.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterCompanyModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading: authLoading,
    error,
    success: authSuccess,
  } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const loading = authLoading;
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    // Login fields
    email: "",
    password: "",
    remember: false,
    // Registration fields
    name: "",
    phone: "",
    companyName: "",
      companyType: "",
      companyAddress: "",
      gstIn: "",
      legalName: "",
      gstEmail: "",
      gstPhone: "",
      gstAddress: "",
      panNumber: "",
      gstDoc: null,
      panImg: null,
  });
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const err = (k, msg) => setErrors((e) => ({ ...e, [k]: msg }));
  const clearErr = (k) =>
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });

  const validateLogin = () => {
    let ok = true;
    if (!form.email.trim()) {
      err("email", "Email is required");
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err("email", "Invalid email address");
      ok = false;
    }
    if (!form.password) {
      err("password", "Password is required");
      ok = false;
    }
    return ok;
  };

  const validateStep1 = () => {
    let ok = true;
    if (!form.name.trim()) {
      err("name", "Full name is required");
      ok = false;
    }
    if (!form.email.trim()) {
      err("email", "Email is required");
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err("email", "Invalid email address");
      ok = false;
    }
    if (!form.password) {
      err("password", "Password is required");
      ok = false;
    } else if (form.password.length < 8) {
      err("password", "Min 8 characters");
      ok = false;
    }
    return ok;
  };

  const validateStep2 = () => {
    let ok = true;
    if (!form.companyName.trim()) { err("companyName", "Required"); ok = false; }
    if (!form.companyType) { err("companyType", "Required"); ok = false; }
    if (!form.companyAddress.trim()) { err("companyAddress", "Required"); ok = false; }
    return ok;
  };

  const validateStep3 = () => {
    let ok = true;
    if (!form.gstIn.trim()) { err("gstIn", "Required"); ok = false; }
    if (!form.legalName.trim()) { err("legalName", "Required"); ok = false; }
    if (!form.gstEmail.trim()) { err("gstEmail", "Required"); ok = false; }
    if (!form.gstPhone.trim()) { err("gstPhone", "Required"); ok = false; }
    if (!form.gstAddress.trim()) { err("gstAddress", "Required"); ok = false; }
    if (!form.panNumber.trim()) { err("panNumber", "Required"); ok = false; }
    return ok;
  };

  const handleLogin = async () => {
    setErrors({});
    if (!validateLogin()) return;

    const res = await dispatch(
      login({
        email: form.email,
        password: form.password,
      }),
    );

    if (res?.meta?.requestStatus === "fulfilled") {
      sessionStorage.setItem("token", res.payload.token); 
      sessionStorage.setItem("user", JSON.stringify(res.payload.user));
      handleClose();
      navigate("/dashboard");
    } else {
      err("password", res.payload?.message || "Login failed");
    }
  };
  const handleNext = () => {
    setErrors({});
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!validateStep3()) return;

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone", form.phone);
    
    formData.append("companyName", form.companyName);
    formData.append("companyType", form.companyType);
    formData.append("companyAddress", form.companyAddress);
    
    formData.append("gstIn", form.gstIn);
    formData.append("legalName", form.legalName);
    formData.append("gstEmail", form.gstEmail);
    formData.append("gstPhone", form.gstPhone);
    formData.append("gstAddress", form.gstAddress);
    formData.append("panNumber", form.panNumber);
    
    if (form.gstDoc) formData.append("gstDoc", form.gstDoc);
    if (form.panImg) formData.append("panImg", form.panImg);

    const res = await dispatch(registerCompany(formData));

    if (res?.meta?.requestStatus === "fulfilled") {
      sessionStorage.setItem("token", res.payload.token);
      sessionStorage.setItem("user", JSON.stringify(res.payload.user)); 
      setSuccess(true);
    } else {
      err("companyName", res.payload?.message || "Registration failed");
    }
  };

  const handleFile = (file) => {
    if (
      file &&
      (file.type === "application/pdf" || file.type.startsWith("image/"))
    ) {
      set("gstFile", file);
    }
  };

  const handleClose = () => {
    setMode("login");
    setStep(1);
    setSuccess(false);
    setForm({
      email: "",
      password: "",
      remember: false,
      name: "",
      phone: "",
      companyName: "",
      companyType: "",
      companyAddress: "",
      gstIn: "",
      legalName: "",
      gstEmail: "",
      gstPhone: "",
      gstAddress: "",
      panNumber: "",
      gstDoc: null,
      panImg: null,
    });
    setErrors({});
    onClose();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setSuccess(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(24px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 1060,
              maxHeight: "90vh",
              overflow: "auto",
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 24,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
              display: "flex",
              flexDirection: "row",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 10,
                background: "none",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.textSec,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.cyan + "60";
                e.currentTarget.style.color = C.cyan;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textSec;
              }}
            >
              <Ico d={Icons.x} size={16} />
            </button>

            {/* Left column - forms */}
            <div
              style={{
                flex: "1 1 55%",
                padding: "32px 28px",
                borderRight: `1px solid ${C.border}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Logo & tabs */}
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ico d={Icons.truck} color="#fff" size={18} />
                  </div>
                  <span
                    style={{ fontWeight: 700, fontSize: 18, color: C.text }}
                  >
                    Fleet<span style={{ color: C.cyan }}>IQ</span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: C.dark,
                    padding: 4,
                    borderRadius: 12,
                  }}
                >
                  <button
                    onClick={() => switchMode("login")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      border: "none",
                      background: mode === "login" ? C.card2 : "transparent",
                      color: mode === "login" ? C.cyan : C.textSec,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => switchMode("register")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      border: "none",
                      background: mode === "register" ? C.card2 : "transparent",
                      color: mode === "register" ? C.cyan : C.textSec,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Forms */}
              <div style={{ flex: 1 }}>
                {mode === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      icon="mail"
                      placeholder="admin@company.com"
                      required
                      value={form.email}
                      error={errors.email}
                      onChange={(v) => {
                        set("email", v);
                        clearErr("email");
                      }}
                    />
                    <InputField
                      label="Password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      icon="lock"
                      placeholder="••••••••"
                      required
                      rightEl={
                        <button
                          onClick={() => setShowPass((p) => !p)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.textMut,
                            padding: 0,
                          }}
                        >
                          <Ico
                            d={showPass ? Icons.eyeOff : Icons.eye}
                            size={16}
                          />
                        </button>
                      }
                      value={form.password}
                      error={errors.password}
                      onChange={(v) => {
                        set("password", v);
                        clearErr("password");
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: C.textSec,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.remember}
                          onChange={(e) => set("remember", e.target.checked)}
                          style={{ accentColor: C.cyan }}
                        />
                        Remember me
                      </label>
                      <a
                        href="#"
                        style={{
                          fontSize: 13,
                          color: C.cyan,
                          textDecoration: "none",
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      style={{
                        marginTop: 12,
                        background: loading
                          ? `${C.cyan}60`
                          : `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
                        border: "none",
                        color: "#fff",
                        padding: "13px 24px",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: loading ? "none" : `0 4px 20px ${C.cyan}40`,
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading)
                          e.currentTarget.style.transform = "scale(1.01)";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading)
                          e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                            }}
                          />
                          Signing in…
                        </>
                      ) : (
                        "Sign In →"
                      )}
                    </button>
                  </motion.div>
                ) : success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", padding: "20px 0" }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: `${C.green}20`,
                        border: `1px solid ${C.green}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <Ico
                        d={Icons.check}
                        color={C.green}
                        size={32}
                        stroke={2.2}
                      />
                    </motion.div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.text,
                        marginBottom: 12,
                      }}
                    >
                      Registration Complete!
                    </div>
                    <div
                      style={{
                        color: C.textSec,
                        fontSize: 14,
                        marginBottom: 28,
                      }}
                    >
                      <span style={{ color: C.cyan, fontWeight: 600 }}>
                        {form.companyName}
                      </span>{" "}
                      is now live on FleetIQ.
                      <br />
                      Check your email to verify your account.
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate("/dashboard"); // ✅ redirect after register
                      }}
                      style={{
                        background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
                        border: "none",
                        color: "#fff",
                        padding: "12px 32px",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Go to Dashboard
                    </button>
                  </motion.div>
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Step 1: Admin Account</div>
                      <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>Primary contact and admin login credentials.</div>
                    </div>
                    <InputField label="Full Name" name="name" icon="user" placeholder="John Doe" required value={form.name} error={errors.name} onChange={(v) => { set("name", v); clearErr("name"); }} />
                    <InputField label="Email Address" name="email" type="email" icon="mail" placeholder="admin@company.com" required value={form.email} error={errors.email} onChange={(v) => { set("email", v); clearErr("email"); }} />
                    <InputField label="Phone Number" name="phone" type="tel" icon="phone" placeholder="+91 98765 43210" value={form.phone} error={errors.phone} onChange={(v) => { set("phone", v); clearErr("phone"); }} />
                    <InputField label="Password" name="password" type={showPass ? "text" : "password"} icon="lock" placeholder="Min 8 characters" required rightEl={<button onClick={() => setShowPass((p) => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMut, padding: 0 }}><Ico d={showPass ? Icons.eyeOff : Icons.eye} size={16} /></button>} value={form.password} error={errors.password} onChange={(v) => { set("password", v); clearErr("password"); }} />
                    <button onClick={handleNext} style={{ marginTop: 8, background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, border: "none", color: "#fff", padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 20px ${C.cyan}40` }}>
                      Continue to Company Details <Ico d={Icons.arrow} color="#fff" size={15} />
                    </button>
                  </motion.div>
                ) : step === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Step 2: Company Details</div>
                      <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>General information about the organization.</div>
                    </div>
                    <InputField label="Company Name" name="companyName" icon="building" placeholder="Acme Logistics Pvt. Ltd." required value={form.companyName} error={errors.companyName} onChange={(v) => { set("companyName", v); clearErr("companyName"); }} />
                    <SelectField
                      label="Company Type"
                      name="companyType"
                      required
                      options={[
                        { value: "private_limited", label: "Private Limited" },
                        { value: "public_limited", label: "Public Limited" },
                        { value: "llp", label: "LLP" },
                        { value: "partnership", label: "Partnership" },
                        { value: "sole_proprietorship", label: "Sole Proprietorship" },
                        { value: "ngo", label: "NGO" },
                        { value: "other", label: "Other" },
                      ]}
                      value={form.companyType} error={errors.companyType} onChange={(v) => { set("companyType", v); clearErr("companyType"); }}
                    />
                    <InputField label="Company Address" name="companyAddress" icon="map" placeholder="123 Fleet Nagar, Mumbai" required value={form.companyAddress} error={errors.companyAddress} onChange={(v) => { set("companyAddress", v); clearErr("companyAddress"); }} />
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button onClick={() => setStep(1)} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, color: C.textSec, padding: "13px 16px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
                      <button onClick={handleNext} style={{ flex: 2, background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, border: "none", color: "#fff", padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 20px ${C.cyan}40` }}>Continue to Compliance <Ico d={Icons.arrow} color="#fff" size={15} /></button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Step 3: Compliance & Taxes</div>
                      <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>GST and PAN information.</div>
                    </div>
                    <InputField label="GST Number" name="gstIn" icon="shield" placeholder="22AAAAA0000A1Z5" required value={form.gstIn} error={errors.gstIn} onChange={(v) => { set("gstIn", v); clearErr("gstIn"); }} />
                    <InputField label="GST Legal Name" name="legalName" icon="building" placeholder="Acme Logistics" required value={form.legalName} error={errors.legalName} onChange={(v) => { set("legalName", v); clearErr("legalName"); }} />
                    <InputField label="GST Email" name="gstEmail" type="email" icon="mail" placeholder="finance@company.com" required value={form.gstEmail} error={errors.gstEmail} onChange={(v) => { set("gstEmail", v); clearErr("gstEmail"); }} />
                    <InputField label="GST Phone" name="gstPhone" type="tel" icon="phone" placeholder="+91 98765 43210" required value={form.gstPhone} error={errors.gstPhone} onChange={(v) => { set("gstPhone", v); clearErr("gstPhone"); }} />
                    <InputField label="GST Address" name="gstAddress" icon="map" placeholder="Registered Address" required value={form.gstAddress} error={errors.gstAddress} onChange={(v) => { set("gstAddress", v); clearErr("gstAddress"); }} />
                    <InputField label="PAN Number" name="panNumber" icon="shield" placeholder="ABCDE1234F" required value={form.panNumber} error={errors.panNumber} onChange={(v) => { set("panNumber", v); clearErr("panNumber"); }} />
                    
                    {/* GST Document Upload */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, letterSpacing: "0.05em" }}>GST Certificate <span style={{ color: C.textMut, fontWeight: 400 }}>(PDF or image)</span></label>
                      <input type="file" accept=".pdf,image/*" onChange={(e) => e.target.files && set("gstDoc", e.target.files[0])} style={{fontSize:12,color:C.textSec}}/>
                    </div>

                    {/* PAN Image Upload */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.textSec, letterSpacing: "0.05em" }}>PAN Card Image <span style={{ color: C.textMut, fontWeight: 400 }}>(Image)</span></label>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files && set("panImg", e.target.files[0])} style={{fontSize:12,color:C.textSec}}/>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button onClick={() => setStep(2)} style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, color: C.textSec, padding: "13px 16px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
                      <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, background: loading ? `${C.cyan}60` : `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, border: "none", color: "#fff", padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : `0 4px 20px ${C.cyan}40` }}>
                        {loading ? "Registering..." : "Complete Registration"}
                      </button>
                    </div>
                    <p style={{ textAlign: "center", fontSize: 12, color: C.textMut, lineHeight: 1.6 }}>By registering you agree to FleetIQ's <span style={{ color: C.cyan, cursor: "pointer" }}>Terms of Service</span> & <span style={{ color: C.cyan, cursor: "pointer" }}>Privacy Policy</span></p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right column - contextual info */}
            <div
              style={{
                flex: "1 1 45%",
                background: C.darker,
                borderRadius: "0 24px 24px 0",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <RightContent mode={mode} success={success} step={step} />
            </div>

            {/* Responsive: on small screens stack? We'll handle with CSS media queries later if needed, but for now it's a row */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterCompanyModal;
