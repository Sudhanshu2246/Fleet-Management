import { useState } from "react";
import { createVehicle } from "../Redux/Thunks/vehicle.thunks";
import CustomDropdown from "../shared/CustomDropdown";
import { MdClose, MdCheck, MdDirectionsCar } from "react-icons/md";

const TYPE_ICON = { truck: MdDirectionsCar, van: MdDirectionsCar, bike: MdDirectionsCar, shuttle: MdDirectionsCar };
const TYPE_LABEL = { truck: "Heavy Truck", van: "Delivery Van", bike: "Delivery Bike", shuttle: "Passenger Shuttle" };

export default function AddVehicleModal({ onClose, dispatch, loading }) {
  const [form, setForm] = useState({ name: "", type: "truck", vehicleNumber: "", chassisNumber: "" });
  const [files, setFiles] = useState({ registrationImage: null, rcImage: null, insuranceImage: null, pollutionImage: null });
  
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] }));

  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    Object.keys(files).forEach((k) => {
      if (files[k]) formData.append(k, files[k]);
    });
    dispatch(createVehicle(formData));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="rounded-2xl w-full max-w-3xl bg-white border border-[#111827]/10 shadow-[0_32px_64px_rgba(0,0,0,0.15)] pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#111827]/6">
            <div>
              <h3 className="text-[15px] font-black text-[#111827]">Add New Vehicle</h3>
              <p className="text-[11px] text-[#111827]/35 mt-0.5">Register a new vehicle to the fleet</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#111827]/35 hover:bg-[#111827]/8 transition-colors cursor-pointer">
              <MdClose size={17} />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ModalField label="Vehicle Name"    placeholder="e.g. Truck Alpha"  value={form.name}      onChange={set("name")} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#111827]/45 uppercase tracking-wider">Vehicle Type</label>
                <CustomDropdown
                  value={form.type}
                  onChange={(val) => setForm(f => ({ ...f, type: val }))}
                  options={Object.entries(TYPE_LABEL).map(([val, label]) => ({ value: val, label }))}
                  icon={TYPE_ICON[form.type] || MdDirectionsCar}
                  className="h-9"
                  dropdownClassName="max-h-60 overflow-y-auto"
                />
              </div>
              <ModalField label="Vehicle Number"  placeholder="e.g. MH 01 AB 1234" value={form.vehicleNumber} onChange={set("vehicleNumber")} mono />
              <ModalField label="Chassis Number"  placeholder="17-digit Chassis No" value={form.chassisNumber} onChange={set("chassisNumber")} mono />
            </div>

            {/* Document Uploads */}
            <div>
              <h4 className="text-[12px] font-bold text-[#111827]/70 mb-2 border-b border-[#111827]/10 pb-1">Vehicle Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <ModalFileField 
                  label="Registration" 
                  file={files.registrationImage}
                  onChange={setFile("registrationImage")} 
                  onRemove={() => setFiles(f => ({ ...f, registrationImage: null }))}
                />
                <ModalFileField 
                  label="RC Document"  
                  file={files.rcImage}
                  onChange={setFile("rcImage")} 
                  onRemove={() => setFiles(f => ({ ...f, rcImage: null }))}
                />
                <ModalFileField 
                  label="Insurance"    
                  file={files.insuranceImage}
                  onChange={setFile("insuranceImage")} 
                  onRemove={() => setFiles(f => ({ ...f, insuranceImage: null }))}
                />
                <ModalFileField 
                  label="Pollution"    
                  file={files.pollutionImage}
                  onChange={setFile("pollutionImage")} 
                  onRemove={() => setFiles(f => ({ ...f, pollutionImage: null }))}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-[#111827]/6">
            <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/70 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all cursor-pointer">
              Cancel
            </button>
            <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/35 transition-shadow disabled:opacity-50 cursor-pointer">
              <MdCheck size={14} /> {loading ? "Registering..." : "Register Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalFileField({ label, file, onChange, onRemove }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[#111827]/45 uppercase tracking-wider">{label}</label>
      {file ? (
        <div className="flex items-center justify-between h-9 px-2.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <span className="text-[11px] font-bold text-[#D4AF37] truncate pr-2">{file.name}</span>
          <button 
            onClick={onRemove}
            className="text-red-400 hover:text-red-500 transition-colors shrink-0 flex items-center justify-center w-5 h-5 bg-red-400/10 rounded cursor-pointer"
            title="Remove file"
          >
            <MdClose size={13} />
          </button>
        </div>
      ) : (
        <div className="relative flex items-center h-9 px-1.5 rounded-lg bg-[#111827]/5 border border-[#111827]/8 transition-all hover:border-[#111827]/20 overflow-hidden cursor-pointer">
          <input
            type="file"
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Choose file"
          />
          <div className="flex items-center gap-2 w-full pointer-events-none">
            <span className="py-1 px-2.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold">Choose File</span>
            <span className="text-[11px] text-[#111827]/50 truncate">No file chosen</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalField({ label, placeholder, value, onChange, mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[#111827]/45 uppercase tracking-wider">{label}</label>
      <div className={`flex items-center h-9 px-3 rounded-lg bg-[#111827]/5 border transition-all ${focused ? "border-[#D4AF37]/40 shadow-[0_0_0_3px_rgba(212,175,55,0.06)]" : "border-[#111827]/8"}`}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-[#111827] placeholder:text-[#111827]/25 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}
