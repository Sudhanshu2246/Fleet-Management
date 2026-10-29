import { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  icon: Icon,
  className = "",
  dropdownClassName = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2 bg-slate-900/70 backdrop-blur-md border ${
          isOpen ? "border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]" : "border-slate-700/60 hover:border-slate-600"
        } rounded-lg text-sm text-slate-200 focus:outline-none transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} font-medium h-full`}
      >
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
        )}
        <span className="truncate">{selectedOption?.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <MdKeyboardArrowDown className="text-slate-400" size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-full mt-2 bg-[#1E293B]/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 ${dropdownClassName}`}
            style={{ top: "100%", left: 0 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  value === option.value
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
