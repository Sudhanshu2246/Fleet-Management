import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MdAssignment,
  MdClose,
  MdLocalShipping,
  MdDirectionsCar,
  MdLocationOn,
  MdCalendarToday,
  MdPerson
} from "react-icons/md";
import CustomDropdown from "../shared/CustomDropdown";
import CustomCalendar from "../shared/CustomCalendar";

export default function AddAssignmentModal({ onClose, onSave, drivers = [] }) {
  const [form, setForm] = useState({
    vehicleType: "truck",
    vehicleNumber: "",
    tripFrom: "",
    tripTo: "",
    tripStartDate: "",
    driverName: "",
    driverPhone: "",
    coDriverName: "",
    coDriverPhone: "",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = () => {
    if (!form.vehicleNumber || !form.tripFrom || !form.tripTo || !form.driverName) {
      toast.error("Please fill required fields");
      return;
    }
    onSave(form);
  };

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
          className="rounded-3xl w-full max-w-2xl bg-white backdrop-blur-none border border-[#111827]/10 shadow-[0_24px_80px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                <MdAssignment size={18} className="text-[#D4AF37]" />
              </div>
              Assign Vehicle
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
              <MdClose size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-bold text-gray-900 mb-2">Vehicle Details</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Vehicle Type</label>
                <CustomDropdown
                  value={form.vehicleType}
                  onChange={(val) => setForm({ ...form, vehicleType: val })}
                  options={[
                    { value: "truck", label: "Truck" },
                    { value: "van", label: "Van" },
                    { value: "shuttle", label: "Shuttle" }
                  ]}
                  icon={MdLocalShipping}
                  className="h-11"
                />
              </div>

              <ModalField label="Vehicle Number" icon={MdDirectionsCar} placeholder="MH 01 AB 1234" value={form.vehicleNumber} onChange={set("vehicleNumber")} />

              <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Trip Details</p>
              </div>

              <ModalField label="Trip From" icon={MdLocationOn} placeholder="Mumbai" value={form.tripFrom} onChange={set("tripFrom")} />
              <ModalField label="Trip To" icon={MdLocationOn} placeholder="Pune" value={form.tripTo} onChange={set("tripTo")} />
              
              <CustomCalendar 
                label="Trip Start Date" 
                icon={MdCalendarToday} 
                placeholder="YYYY-MM-DD" 
                value={form.tripStartDate} 
                onChange={(val) => setForm({ ...form, tripStartDate: val })} 
              />

              <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Driver Assignment</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Driver</label>
                <CustomDropdown
                  value={form.driverPhone}
                  onChange={(val) => {
                    const drv = drivers.find(d => d.phone === val);
                    if(drv) {
                      setForm({ ...form, driverPhone: val, driverName: `${drv.firstName} ${drv.lastName}` });
                    } else {
                      setForm({ ...form, driverPhone: "", driverName: "" });
                    }
                  }}
                  options={[
                    { value: "", label: "Select a driver" },
                    ...drivers.map(d => ({ value: d.phone, label: `${d.firstName} ${d.lastName} (${d.phone})` }))
                  ]}
                  icon={MdPerson}
                  className="h-11"
                  dropdownClassName="max-h-48 overflow-y-auto"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Co-Driver (Optional)</label>
                <CustomDropdown
                  value={form.coDriverPhone}
                  onChange={(val) => {
                    const drv = drivers.find(d => d.phone === val);
                    if(drv) {
                      setForm({ ...form, coDriverPhone: val, coDriverName: `${drv.firstName} ${drv.lastName}` });
                    } else {
                      setForm({ ...form, coDriverPhone: "", coDriverName: "" });
                    }
                  }}
                  options={[
                    { value: "", label: "Select a driver" },
                    ...drivers.map(d => ({ value: d.phone, label: `${d.firstName} ${d.lastName} (${d.phone})` }))
                  ]}
                  icon={MdPerson}
                  className="h-11"
                  dropdownClassName="max-h-48 overflow-y-auto"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-8 py-2.5 rounded-xl text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all shadow-lg cursor-pointer"
            >
              Assign Vehicle
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ModalField({ label, icon: Icon, placeholder, value, onChange, type = "text" }) {
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
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-gray-800 placeholder:text-gray-400 w-full`}
        />
      </div>
    </div>
  );
}


