import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createDriver } from "../Redux/Thunks/driver.thunks";
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

export default function AddDriverModal({ onClose, dispatch, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    name: "", email: "", phone: "", 
    licenseNumber: "", licenseType: "", vehicleCategories: "", licenseExpiryDate: "", 
    aadhaarCard: "", panCard: "", driverType: "" 
  });
  const [files, setFiles] = useState({ licenseImage: null, aadhaarImage: null, panImage: null });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    Object.keys(files).forEach((k) => {
      if (files[k]) formData.append(k, files[k]);
    });
    dispatch(createDriver(formData));
    toast.success("Registering driver...");
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
          className="rounded-3xl w-full max-w-5xl bg-white backdrop-blur-none border border-[#111827]/10 shadow-[0_24px_80px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden flex flex-col md:flex-row h-[600px]"
        >
          {/* Left Side: Preview & Progress */}
          <div className="w-full md:w-80 bg-white border-r border-[#111827]/5 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-[#111827] flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                  <MdPersonAdd size={18} className="text-[#D4AF37]" />
                </div>
                Onboarding
              </h3>
              <p className="text-xs text-[#111827]/40 leading-relaxed">Complete the steps to register a new driver into the system.</p>

              <div className="mt-10 flex flex-col gap-6">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const active = step >= s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-4 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${active ? "bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "border-[#111827]/10"}`}>
                        {active && step > s.id ? <MdCheckCircle size={16} className="text-white" /> : <Icon size={14} className={active ? "text-white" : "text-[#111827]/20"} />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-[#D4AF37]" : "text-[#111827]/20"}`}>Step 0{s.id}</span>
                        <span className={`text-xs font-bold ${active ? "text-[#111827]" : "text-[#111827]/30"}`}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#D4AF37] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-2xl p-4 border border-[#111827]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br bg-[#D4AF37] flex items-center justify-center text-sm font-black text-white">
                    {form.name ? form.name.substring(0, 2).toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111827] truncate w-32">{form.name || "Driver Name"}</div>
                    <div className="text-[10px] text-[#D4AF37]/70 font-mono">ID: PENDING</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-[#111827]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] w-1/3" />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-[#111827]/30 uppercase tracking-tighter">
                    <span>{form.driverType || "Driver"}</span>
                    <span>{form.licenseType || "License"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
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
                      <h4 className="text-lg font-bold text-[#111827]">Personal Information</h4>
                      <p className="text-xs text-[#111827]/40">Enter the basic identification details for the driver.</p>
                    </div>
                    <div className="col-span-2">
                      <ModalField label="Full Name" icon={MdPerson} placeholder="e.g. Rahul Sharma" value={form.name} onChange={set("name")} />
                    </div>
                    <ModalField label="Email Address" icon={MdEmail} placeholder="rahul@fleet.com" value={form.email} onChange={set("email")} />
                    <ModalField label="Phone Number" icon={MdPhone} placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} mono />
                    <ModalField label="Driver Type" icon={MdPersonAdd} placeholder="e.g. co-driver" value={form.driverType} onChange={set("driverType")} />
                    <ModalField label="Aadhaar Card" icon={MdShield} placeholder="12-digit number" value={form.aadhaarCard} onChange={set("aadhaarCard")} mono />
                    <div className="col-span-2">
                      <ModalField label="PAN Card" icon={MdShield} placeholder="10-digit alphanumeric" value={form.panCard} onChange={set("panCard")} mono />
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
                      <h4 className="text-lg font-bold text-[#111827]">Document Verification</h4>
                      <p className="text-xs text-[#111827]/40">Upload high-quality scans of required legal documents.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <ModalField label="License No." icon={MdDirectionsCar} placeholder="DL-1234567890" value={form.licenseNumber} onChange={set("licenseNumber")} mono />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <ModalField label="License Type" icon={MdDirectionsCar} placeholder="e.g. CDL" value={form.licenseType} onChange={set("licenseType")} />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <ModalField label="Vehicle Categories" icon={MdLocalShipping} placeholder="e.g. HMV_HTV" value={form.vehicleCategories} onChange={set("vehicleCategories")} />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <CustomCalendar 
                          label="License Expiry" 
                          icon={MdCalendarToday} 
                          placeholder="YYYY-MM-DD" 
                          value={form.licenseExpiryDate} 
                          onChange={val => setForm(f => ({ ...f, licenseExpiryDate: val }))} 
                          includeTime={false} 
                        />
                      </div>
                      
                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <ModalFileField label="License Image" icon={MdDirectionsCar} file={files.licenseImage} onChange={setFile("licenseImage")} />
                        <ModalFileField label="Aadhaar Image" icon={MdPerson} file={files.aadhaarImage} onChange={setFile("aadhaarImage")} />
                        <ModalFileField label="PAN Image" icon={MdShield} file={files.panImage} onChange={setFile("panImage")} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-xs font-bold text-[#111827]/40 hover:text-[#111827] transition-colors"
              >
                Close
              </button>
              <div className="flex gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all bg-white shadow-sm"
                  >
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all shadow-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    disabled={loading} 
                    onClick={handleSubmit} 
                    className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 transition-all disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
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

function ModalFileField({ label, icon: Icon, file, onChange }) {
  return (
    <div className="group">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
      <div className={`relative h-20 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center px-6 gap-4 ${file ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? "bg-[#D4AF37]/20" : "bg-white border border-gray-200 shadow-sm"}`}>
          <Icon size={18} className={file ? "text-[#D4AF37]" : "text-gray-400"} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold ${file ? "text-[#D4AF37]" : "text-[#111827]/60"}`}>
            {file ? file.name : `Upload ${label}`}
          </p>
          <p className="text-[10px] text-[#111827]/20 mt-0.5">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, JPG, PNG"}</p>
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

function ModalField({ label, icon: Icon, placeholder, value, onChange, mono, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div className={`flex items-center h-11 px-4 rounded-xl bg-gray-50 border transition-all duration-300 ${focused ? "border-[#D4AF37] bg-white shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "border-gray-200 hover:border-gray-300"}`}>
        <Icon size={16} className={`mr-3 transition-colors ${focused ? "text-[#D4AF37]" : "text-gray-400"}`} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-gray-800 placeholder:text-gray-400 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}
