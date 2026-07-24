import { motion } from "framer-motion";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../../Redux/Thunks/auth.thunks";
import { C, Ico, Icons, InputField } from "./AuthShared";

const LoginForm = ({ handleClose, loading, authLoading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
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
      })
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

  const isBtnLoading = loading || authLoading;

  return (
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
            <Ico d={showPass ? Icons.eyeOff : Icons.eye} size={16} />
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
        disabled={isBtnLoading}
        style={{
          marginTop: 12,
          background: isBtnLoading
            ? `${C.cyan}60`
            : `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
          border: "none",
          color: "#fff",
          padding: "13px 24px",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: isBtnLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: isBtnLoading ? "none" : `0 4px 20px ${C.cyan}40`,
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isBtnLoading) e.currentTarget.style.transform = "scale(1.01)";
        }}
        onMouseLeave={(e) => {
          if (!isBtnLoading) e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isBtnLoading ? (
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
  );
};

export default LoginForm;
