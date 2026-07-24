import { motion } from "framer-motion";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../../../Redux/Thunks/auth.thunks";
import { C, Ico, Icons, InputField, SelectField } from "./AuthShared";

const RegisterForm = ({
  handleClose,
  setSuccess,
  loading,
  authLoading,
  step,
  setStep,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const err = (k, msg) => setErrors((e) => ({ ...e, [k]: msg }));
  const clearErr = (k) =>
    setErrors((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });

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
    if (!form.companyName.trim()) {
      err("companyName", "Required");
      ok = false;
    }
    if (!form.companyType) {
      err("companyType", "Required");
      ok = false;
    }
    if (!form.companyAddress.trim()) {
      err("companyAddress", "Required");
      ok = false;
    }
    return ok;
  };

  const validateStep3 = () => {
    let ok = true;
    if (!form.gstIn.trim()) {
      err("gstIn", "Required");
      ok = false;
    }
    if (!form.legalName.trim()) {
      err("legalName", "Required");
      ok = false;
    }
    if (!form.gstEmail.trim()) {
      err("gstEmail", "Required");
      ok = false;
    }
    if (!form.gstPhone.trim()) {
      err("gstPhone", "Required");
      ok = false;
    }
    if (!form.gstAddress.trim()) {
      err("gstAddress", "Required");
      ok = false;
    }
    if (!form.panNumber.trim()) {
      err("panNumber", "Required");
      ok = false;
    }
    return ok;
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
      setSuccess(true, form.companyName);
    } else {
      err("companyName", res.payload?.message || "Registration failed");
    }
  };

  const isBtnLoading = loading || authLoading;

  if (step === 1) {
    return (
      <motion.div
        key="step1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>
            Step 1: Admin Account
          </div>
          <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>
            Primary contact and admin login credentials.
          </div>
        </div>
        <InputField
          label="Full Name"
          name="name"
          icon="user"
          placeholder="John Doe"
          required
          value={form.name}
          error={errors.name}
          onChange={(v) => {
            set("name", v);
            clearErr("name");
          }}
        />
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
          label="Phone Number"
          name="phone"
          type="tel"
          icon="phone"
          placeholder="+91 98765 43210"
          value={form.phone}
          error={errors.phone}
          onChange={(v) => {
            set("phone", v);
            clearErr("phone");
          }}
        />
        <InputField
          label="Password"
          name="password"
          type={showPass ? "text" : "password"}
          icon="lock"
          placeholder="Min 8 characters"
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
        <button
          onClick={handleNext}
          style={{
            marginTop: 8,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
            border: "none",
            color: "#fff",
            padding: "13px 24px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 4px 20px ${C.cyan}40`,
          }}
        >
          Continue to Company Details{" "}
          <Ico d={Icons.arrow} color="#fff" size={15} />
        </button>
      </motion.div>
    );
  }

  if (step === 2) {
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>
            Step 2: Company Details
          </div>
          <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>
            General information about the organization.
          </div>
        </div>
        <InputField
          label="Company Name"
          name="companyName"
          icon="building"
          placeholder="Acme Logistics Pvt. Ltd."
          required
          value={form.companyName}
          error={errors.companyName}
          onChange={(v) => {
            set("companyName", v);
            clearErr("companyName");
          }}
        />
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
          value={form.companyType}
          error={errors.companyType}
          onChange={(v) => {
            set("companyType", v);
            clearErr("companyType");
          }}
        />
        <InputField
          label="Company Address"
          name="companyAddress"
          icon="map"
          placeholder="123 Fleet Nagar, Mumbai"
          required
          value={form.companyAddress}
          error={errors.companyAddress}
          onChange={(v) => {
            set("companyAddress", v);
            clearErr("companyAddress");
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={() => setStep(1)}
            style={{
              flex: 1,
              background: "none",
              border: `1px solid ${C.border}`,
              color: C.textSec,
              padding: "13px 16px",
              borderRadius: 10,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
              border: "none",
              color: "#fff",
              padding: "13px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: `0 4px 20px ${C.cyan}40`,
            }}
          >
            Continue to Compliance{" "}
            <Ico d={Icons.arrow} color="#fff" size={15} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>
          Step 3: Compliance & Taxes
        </div>
        <div style={{ fontSize: 13, color: C.textMut, marginTop: 3 }}>
          GST and PAN information.
        </div>
      </div>
      <InputField
        label="GST Number"
        name="gstIn"
        icon="shield"
        placeholder="22AAAAA0000A1Z5"
        required
        value={form.gstIn}
        error={errors.gstIn}
        onChange={(v) => {
          set("gstIn", v);
          clearErr("gstIn");
        }}
      />
      <InputField
        label="GST Legal Name"
        name="legalName"
        icon="building"
        placeholder="Acme Logistics"
        required
        value={form.legalName}
        error={errors.legalName}
        onChange={(v) => {
          set("legalName", v);
          clearErr("legalName");
        }}
      />
      <InputField
        label="GST Email"
        name="gstEmail"
        type="email"
        icon="mail"
        placeholder="finance@company.com"
        required
        value={form.gstEmail}
        error={errors.gstEmail}
        onChange={(v) => {
          set("gstEmail", v);
          clearErr("gstEmail");
        }}
      />
      <InputField
        label="GST Phone"
        name="gstPhone"
        type="tel"
        icon="phone"
        placeholder="+91 98765 43210"
        required
        value={form.gstPhone}
        error={errors.gstPhone}
        onChange={(v) => {
          set("gstPhone", v);
          clearErr("gstPhone");
        }}
      />
      <InputField
        label="GST Address"
        name="gstAddress"
        icon="map"
        placeholder="Registered Address"
        required
        value={form.gstAddress}
        error={errors.gstAddress}
        onChange={(v) => {
          set("gstAddress", v);
          clearErr("gstAddress");
        }}
      />
      <InputField
        label="PAN Number"
        name="panNumber"
        icon="shield"
        placeholder="ABCDE1234F"
        required
        value={form.panNumber}
        error={errors.panNumber}
        onChange={(v) => {
          set("panNumber", v);
          clearErr("panNumber");
        }}
      />

      {/* GST Document Upload */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.textSec,
            letterSpacing: "0.05em",
          }}
        >
          GST Certificate{" "}
          <span style={{ color: C.textMut, fontWeight: 400 }}>
            (PDF or image)
          </span>
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => e.target.files && set("gstDoc", e.target.files[0])}
          style={{ fontSize: 12, color: C.textSec }}
        />
      </div>

      {/* PAN Image Upload */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.textSec,
            letterSpacing: "0.05em",
          }}
        >
          PAN Card Image{" "}
          <span style={{ color: C.textMut, fontWeight: 400 }}>(Image)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && set("panImg", e.target.files[0])}
          style={{ fontSize: 12, color: C.textSec }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={() => setStep(2)}
          style={{
            flex: 1,
            background: "none",
            border: `1px solid ${C.border}`,
            color: C.textSec,
            padding: "13px 16px",
            borderRadius: 10,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isBtnLoading}
          style={{
            flex: 2,
            background: isBtnLoading
              ? `${C.cyan}60`
              : `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
            border: "none",
            color: "#fff",
            padding: "13px 24px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: isBtnLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: isBtnLoading ? "none" : `0 4px 20px ${C.cyan}40`,
          }}
        >
          {isBtnLoading ? "Registering..." : "Complete Registration"}
        </button>
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: C.textMut,
          lineHeight: 1.6,
        }}
      >
        By registering you agree to FleetIQ's{" "}
        <span style={{ color: C.cyan, cursor: "pointer" }}>
          Terms of Service
        </span>{" "}
        &{" "}
        <span style={{ color: C.cyan, cursor: "pointer" }}>Privacy Policy</span>
      </p>
    </motion.div>
  );
};

export default RegisterForm;
