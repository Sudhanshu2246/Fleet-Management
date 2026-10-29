import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createDriver, updateDriver } from "../Redux/Thunks/driver.thunks";
import {
  MdPersonAdd,
  MdCheckCircle,
  MdPerson,
  MdEmail,
  MdPhone,
  MdShield,
  MdDirectionsCar,
  MdLocalShipping,
  MdCalendarToday,
} from "react-icons/md";
import CustomCalendar from "../shared/CustomCalendar";
import CustomDropdown from "../shared/CustomDropdown";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useEffect } from "react";
import {
  DRIVER_TYPE_OPTIONS,
  LICENSE_TYPES,
  VEHICLE_CATEGORY_OPTIONS,
} from "../utils/constants";

export default function AddDriverModal({
  onClose,
  dispatch,
  loading,
  editDriverData,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseType: "",
    vehicleCategories: "",
    licenseExpiryDate: "",
    aadhaarCard: "",
    panCard: "",
    driverType: "driver",
  });
  const [files, setFiles] = useState({
    licenseImage: null,
    aadhaarImage: null,
    panImage: null,
  });

  useEffect(() => {
    if (editDriverData && editDriverData.raw) {
      const raw = editDriverData.raw;
      const driver = raw.Driver || {};
      setForm({
        name: `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
        email: raw.email || "",
        phone: raw.phone || "",
        licenseNumber: driver.licenseNumber || "",
        licenseType: driver.licenseType || "",
        vehicleCategories: driver.vehicleCategories || "",
        licenseExpiryDate: driver.licenseExpiryDate || "",
        aadhaarCard: driver.aadhaarCard || "",
        panCard: driver.panCard || "",
        driverType: driver.driverType || "driver",
      });
    }
  }, [editDriverData]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) =>
    setFiles((f) => ({ ...f, [k]: e.target.files[0] }));

  const handleContinue = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.driverType ||
      !form.aadhaarCard ||
      !form.panCard
    ) {
      toast.error("Please fill all personal information fields");
      return;
    }
    if (form.aadhaarCard.length !== 12) {
      toast.error("Aadhaar card must be exactly 12 digits");
      return;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panRegex.test(form.panCard)) {
      toast.error("Invalid PAN card format");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    if (
      !form.licenseNumber ||
      !form.licenseType ||
      !form.vehicleCategories ||
      !form.licenseExpiryDate
    ) {
      toast.error("Please fill all document fields");
      return;
    }
    if (
      !editDriverData &&
      (!files.licenseImage || !files.aadhaarImage || !files.panImage)
    ) {
      toast.error("Please upload all required document images");
      return;
    }
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    Object.keys(files).forEach((k) => {
      if (files[k]) formData.append(k, files[k]);
    });

    if (editDriverData) {
      dispatch(updateDriver({ id: editDriverData.id, formData }));
      toast.success("Updating driver...");
    } else {
      dispatch(createDriver(formData));
      toast.success("Registering driver...");
    }
  };

  const steps = [
    { id: 1, label: "Profile Info", icon: MdPerson },
    { id: 2, label: "Documents", icon: MdShield },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#111827]/80 backdrop-blur-md z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="rounded-3xl w-full max-w-5xl bg-[#151D2C] backdrop-blur-none border border-slate-800 shadow-[0_24px_80px_rgba(0,0,0,0.5)] pointer-events-auto overflow-y-auto md:overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]"
        >
          {/* Left Side: Preview & Progress */}
          <div className="w-full md:w-80 bg-[#1E293B]/60 border-r border-slate-800 p-8 flex flex-col justify-between shrink-0">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                  <MdPersonAdd size={18} className="text-[#D4AF37]" />
                </div>
                Onboarding
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete the steps to register a new driver into the system.
              </p>

              <div className="mt-10 flex flex-col gap-6">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const active = step >= s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-4 group">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "border-slate-700"}`}
                      >
                        {active && step > s.id ? (
                          <MdCheckCircle size={16} className="text-white" />
                        ) : (
                          <Icon
                            size={14}
                            className={
                              active ? "text-white" : "text-slate-500"
                            }
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-[#D4AF37]" : "text-slate-500"}`}
                        >
                          Step 0{s.id}
                        </span>
                        <span
                          className={`text-xs font-bold ${active ? "text-white" : "text-slate-400"}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#D4AF37] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#151D2C] rounded-2xl p-4 border border-slate-700/60 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-[#D4AF37] flex items-center justify-center text-sm font-black text-white">
                    {form.name ? form.name.substring(0, 2).toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate w-32">
                      {form.name || "Driver Name"}
                    </div>
                    <div className="text-[10px] text-[#D4AF37]/90 font-mono">
                      ID: PENDING
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] w-1/3" />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>{form.driverType || "Driver"}</span>
                    <span>{form.licenseType || "License"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex-1 flex flex-col md:overflow-hidden bg-[#151D2C]">
            <div className="flex-1 p-8 md:overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-2 gap-5"
                  >
                    <div className="col-span-2 mb-2">
                      <h4 className="text-lg font-bold text-white">
                        Personal Information
                      </h4>
                      <p className="text-xs text-slate-400">
                        Enter the basic identification details for the driver.
                      </p>
                    </div>
                    <div className="col-span-2">
                      <ModalField
                        label="Full Name"
                        icon={MdPerson}
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={set("name")}
                        required
                      />
                    </div>
                    <ModalField
                      label="Email Address"
                      icon={MdEmail}
                      placeholder="rahul@fleet.com"
                      value={form.email}
                      onChange={set("email")}
                    />
                    <ModalPhoneField
                      label="Phone Number"
                      value={form.phone}
                      onChange={(val) => setForm((f) => ({ ...f, phone: val }))}
                      required
                    />
                    <ModalDropdownField
                      label="Driver Type"
                      icon={MdPersonAdd}
                      value={form.driverType}
                      onChange={(val) =>
                        setForm((f) => ({ ...f, driverType: val }))
                      }
                      options={DRIVER_TYPE_OPTIONS}
                      required
                    />
                    <ModalField
                      label="Aadhaar Card"
                      icon={MdShield}
                      placeholder="12-digit number"
                      value={form.aadhaarCard}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);
                        setForm((f) => ({ ...f, aadhaarCard: val }));
                      }}
                      mono
                      required
                    />
                    <div className="col-span-2">
                      <ModalField
                        label="PAN Card"
                        icon={MdShield}
                        placeholder="10-digit alphanumeric"
                        value={form.panCard}
                        onChange={(e) => {
                          const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 10);
                          setForm((f) => ({ ...f, panCard: val }));
                        }}
                        mono
                        required
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="mb-2">
                      <h4 className="text-lg font-bold text-white">
                        Document Verification
                      </h4>
                      <p className="text-xs text-slate-400">
                        Upload high-quality scans of required legal documents.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <ModalField
                          label="License No."
                          icon={MdDirectionsCar}
                          placeholder="DL-1234567890"
                          value={form.licenseNumber}
                          onChange={set("licenseNumber")}
                          mono
                          required
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <ModalDropdownField
                          label="License Type"
                          icon={MdDirectionsCar}
                          value={form.licenseType}
                          onChange={(val) =>
                            setForm((f) => ({ ...f, licenseType: val }))
                          }
                          options={LICENSE_TYPES}
                          required
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <ModalDropdownField
                          label="Vehicle Categories"
                          icon={MdLocalShipping}
                          value={form.vehicleCategories}
                          onChange={(val) =>
                            setForm((f) => ({ ...f, vehicleCategories: val }))
                          }
                          options={VEHICLE_CATEGORY_OPTIONS}
                          required
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <CustomCalendar
                          label="License Expiry"
                          icon={MdCalendarToday}
                          placeholder="YYYY-MM-DD"
                          value={form.licenseExpiryDate}
                          onChange={(val) =>
                            setForm((f) => ({ ...f, licenseExpiryDate: val }))
                          }
                          includeTime={false}
                        />
                      </div>

                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <ModalFileField
                          label="License Image"
                          icon={MdDirectionsCar}
                          file={files.licenseImage}
                          onChange={setFile("licenseImage")}
                          required
                        />
                        <ModalFileField
                          label="Aadhaar Image"
                          icon={MdPerson}
                          file={files.aadhaarImage}
                          onChange={setFile("aadhaarImage")}
                          required
                        />
                        <ModalFileField
                          label="PAN Image"
                          icon={MdShield}
                          file={files.panImage}
                          onChange={setFile("panImage")}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-800 bg-[#1E293B]/40 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-300 border border-slate-700/60 hover:bg-slate-800 transition-all bg-[#151D2C] shadow-sm"
                  >
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button
                    onClick={handleContinue}
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-all disabled:opacity-50"
                  >
                    {loading
                      ? editDriverData
                        ? "Updating..."
                        : "Registering..."
                      : editDriverData
                        ? "Update Driver"
                        : "Complete Registration"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ModalFileField({ label, icon: Icon, file, onChange, required }) {
  return (
    <div className="group">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`relative h-20 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center px-6 gap-4 ${file ? "border-[#D4AF37]/50 bg-[#D4AF37]/10" : "border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900/80"}`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? "bg-[#D4AF37]/20" : "bg-slate-800 border border-slate-700/60 shadow-sm"}`}
        >
          <Icon
            size={18}
            className={file ? "text-[#D4AF37]" : "text-slate-400"}
          />
        </div>
        <div className="flex-1">
          <p
            className={`text-xs font-bold ${file ? "text-[#D4AF37]" : "text-slate-200"}`}
          >
            {file ? file.name : `Upload ${label}`}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : "Supports PDF, JPG, PNG"}
          </p>
        </div>
        <input
          type="file"
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {file && <MdCheckCircle size={20} className="text-[#D4AF37]" />}
      </div>
    </div>
  );
}

function ModalDropdownField({
  label,
  icon,
  value,
  onChange,
  options,
  required,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="h-11">
        <CustomDropdown
          value={value}
          onChange={onChange}
          options={options}
          icon={icon}
          className="h-full"
        />
      </div>
    </div>
  );
}

function ModalPhoneField({ label, value, onChange, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`relative z-10 flex items-center h-11 px-4 rounded-xl bg-slate-900/70 border transition-all duration-300 ${focused ? "border-[#D4AF37] bg-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.15)]" : "border-slate-700/60 hover:border-slate-600"}`}
      >
        <MdPhone
          size={16}
          className={`mr-1 transition-colors z-10 ${focused ? "text-[#D4AF37]" : "text-slate-400"}`}
        />
        <div className="flex-1 h-full phone-input-wrapper flex items-center">
          <PhoneInput
            country={"in"}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            containerStyle={{ height: "100%", width: "100%", border: "none" }}
            inputStyle={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              paddingLeft: "40px",
              fontSize: "13px",
              color: "#f1f5f9",
              fontFamily: "monospace",
              outline: "none",
            }}
            buttonStyle={{
              border: "none",
              background: "transparent",
              paddingLeft: "0",
              paddingRight: "0",
            }}
            dropdownStyle={{
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "#151D2C",
              color: "#f1f5f9",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  mono,
  type = "text",
  required,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`flex items-center h-11 px-4 rounded-xl bg-slate-900/70 border transition-all duration-300 ${focused ? "border-[#D4AF37] bg-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.15)]" : "border-slate-700/60 hover:border-slate-600"}`}
      >
        <Icon
          size={16}
          className={`mr-3 transition-colors ${focused ? "text-[#D4AF37]" : "text-slate-400"}`}
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-slate-100 placeholder:text-slate-500 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}
