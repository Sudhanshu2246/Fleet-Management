import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { C, Ico, Icons, RightContent } from "./components/AuthShared";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

const RegisterCompanyModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { loading: authLoading } = useSelector((state) => state.auth);

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [registeredCompanyName, setRegisteredCompanyName] = useState("");

  const handleClose = () => {
    setMode("login");
    setStep(1);
    setSuccess(false);
    onClose();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setSuccess(false);
  };

  const handleSuccess = (status, companyName) => {
    setSuccess(status);
    if (companyName) setRegisteredCompanyName(companyName);
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
                
                {/* Tabs (Only show if not in success state) */}
                {!success && (
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
                )}
              </div>

              {/* Forms */}
              <div style={{ flex: 1 }}>
                {success ? (
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
                        {registeredCompanyName}
                      </span>{" "}
                      is now live on FleetIQ.
                      <br />
                      Check your email to verify your account.
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate("/dashboard");
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
                ) : mode === "login" ? (
                  <LoginForm handleClose={handleClose} authLoading={authLoading} />
                ) : (
                  <RegisterForm handleClose={handleClose} setSuccess={handleSuccess} authLoading={authLoading} step={step} setStep={setStep} />
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterCompanyModal;
