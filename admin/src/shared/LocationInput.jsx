import { useState } from "react";
import { MdLocationOn, MdMap } from "react-icons/md";
import MapLocationModal from "../modals/MapLocationModal";

export default function LocationInput({ label, icon: Icon = MdLocationOn, placeholder, value, onChange, required, initialLocation }) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  // We display either the object's address property (if it's an object) or the string value
  const displayValue = typeof value === 'object' && value !== null ? value.address : value;

  const handleConfirmLocation = (locationData) => {
    // locationData contains { address, lat, lng }
    onChange(locationData);
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div 
        onClick={() => setIsMapOpen(true)}
        className="flex items-center h-11 px-4 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-[#D4AF37] cursor-pointer transition-colors duration-300 group shadow-sm"
      >
        <Icon size={16} className="mr-3 text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue || ""}
          readOnly
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-200 placeholder:text-slate-500 cursor-pointer w-full pointer-events-none"
        />
        <MdMap size={18} className="text-slate-400 group-hover:text-[#D4AF37] ml-2 transition-colors" />
      </div>

      <MapLocationModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleConfirmLocation}
        initialLocation={initialLocation}
      />
    </div>
  );
}
