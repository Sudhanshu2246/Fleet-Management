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
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div 
        onClick={() => setIsMapOpen(true)}
        className="flex items-center h-11 px-4 rounded-xl bg-white border border-gray-200 hover:border-[#D4AF37] cursor-pointer transition-colors duration-300 group"
      >
        <Icon size={16} className="mr-3 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={displayValue || ""}
          readOnly
          className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-800 placeholder:text-gray-400 cursor-pointer w-full pointer-events-none"
        />
        <MdMap size={18} className="text-gray-400 group-hover:text-[#D4AF37] ml-2 transition-colors" />
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
