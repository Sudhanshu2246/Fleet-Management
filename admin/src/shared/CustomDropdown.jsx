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
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2 bg-white/65 backdrop-blur-md border ${
          isOpen ? "border-[#D4AF37]" : "border-[#111827]/10"
        } rounded-lg text-sm text-[#111827] focus:outline-none transition-colors cursor-pointer font-medium h-full`}
      >
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
        )}
        <span className="truncate">{selectedOption?.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <MdKeyboardArrowDown className="text-gray-500" size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-[#111827]/10 rounded-xl shadow-lg overflow-hidden py-1 ${dropdownClassName}`}
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
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold"
                    : "text-[#111827] hover:bg-[#111827]/5"
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
