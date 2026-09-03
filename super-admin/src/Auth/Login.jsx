import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../Redux/Thunks/auth.thunks";
import { C, Ico, Icons, InputField } from "./AuthShared";
import LoginBG from "../assets/LoginBG.mp4";
import logo from "../assets/logo.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

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
      navigate("/");
    } else {
      err("password", res.payload?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        background: C.darker,
      }}
    >
      {/* LEFT PANE: Video Background (Hidden on small screens) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={LoginBG} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1,
          }}
        />

        {/* Optional branding over the video */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "10%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <img 
              src={logo} 
              alt="FleetIQ" 
              style={{
                height: 48,
                objectFit: "contain",
                marginBottom: 16,
                display: "block"
              }} 
            />
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
              FleetIQ Command Center
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 12, maxWidth: 400, lineHeight: 1.6 }}>
              Advanced telematics, global tracking, and logistics optimization for the modern enterprise.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANE: Full Height Login Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 480, // Fixed width for the login pane on desktop
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "40px",
          background: C.dark, 
          borderLeft: `1px solid rgba(0,0,0,0.05)`,
          zIndex: 10,
          boxShadow: "-20px 0 40px rgba(0,0,0,0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%" }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <img 
              src={logo} 
              alt="FleetIQ Logo" 
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                margin: "0 auto 20px",
                display: "block"
              }} 
            />
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: C.text,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Super Admin Login
            </h1>
            <p
              style={{
                fontSize: 15,
                color: C.textSec,
                marginTop: 10,
                margin: 0,
              }}
            >
              Secure access to the FleetIQ control panel
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <InputField
              label="Email Address"
              name="email"
              type="email"
              icon="mail"
              placeholder="admin@fleetiq.com"
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
                  <Ico d={showPass ? Icons.eyeOff : Icons.eye} size={18} />
                </button>
              }
              value={form.password}
              error={errors.password}
              onChange={(v) => {
                set("password", v);
                clearErr("password");
              }}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                marginTop: 20,
                background: loading
                  ? `${C.cyan}60`
                  : `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
                border: "none",
                color: "#fff",
                padding: "16px 24px",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: loading ? "none" : `0 8px 25px ${C.cyan}40`,
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard →"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
