import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from "react-icons/md";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomCalendar({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  icon: Icon = MdCalendarToday,
  label = "",
  disablePast = true,
  minDate,
  required
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  
  // To avoid invalid dates if value is empty initially
  const parsedValue = value ? new Date(value) : null;
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [activeSelector, setActiveSelector] = useState(null); // 'month', 'year'

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array.from({ length: firstDay }).map((_, i) => i);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const prevMonth = () => {
    const minD = minDate ? new Date(minDate) : (disablePast ? today : null);
    if (minD && currentYear === minD.getFullYear() && currentMonth <= minD.getMonth()) return;
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    // Format as YYYY-MM-DD
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!parsedValue || isNaN(parsedValue)) return "";
    const y = parsedValue.getFullYear();
    const m = String(parsedValue.getMonth() + 1).padStart(2, '0');
    const d = String(parsedValue.getDate()).padStart(2, '0');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center h-11 px-4 rounded-xl bg-slate-900/70 backdrop-blur-md border transition-all duration-300 cursor-pointer ${isOpen ? "border-[#D4AF37] bg-slate-900 shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "border-slate-700/60 hover:border-slate-600"}`}
      >
        <Icon size={16} className={`mr-3 transition-colors ${isOpen ? "text-[#D4AF37]" : "text-slate-400"}`} />
        <span className={`flex-1 text-[13px] ${displayValue() ? "text-slate-200" : "text-slate-500"}`}>
          {displayValue() || placeholder}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 bg-[#1E293B] backdrop-blur-xl border border-slate-700 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-4 w-72 text-white"
            style={{ top: "100%", left: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={prevMonth} 
                disabled={disablePast && currentYear === today.getFullYear() && currentMonth <= today.getMonth()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${disablePast && currentYear === today.getFullYear() && currentMonth <= today.getMonth() ? "text-slate-600 cursor-not-allowed" : "hover:bg-slate-800 text-slate-300"}`}
              >
                <MdChevronLeft size={20} />
              </button>
              <div className="flex gap-2 items-center relative">
                <div
                  onClick={() => setActiveSelector(activeSelector === 'month' ? null : 'month')}
                  className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-200 cursor-pointer hover:bg-slate-800 px-2 py-1 rounded-md"
                >
                  {MONTHS[currentMonth]}
                </div>
                <div
                  onClick={() => setActiveSelector(activeSelector === 'year' ? null : 'year')}
                  className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-200 cursor-pointer hover:bg-slate-800 px-2 py-1 rounded-md"
                >
                  {currentYear}
                </div>
              </div>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-300 cursor-pointer">
                <MdChevronRight size={20} />
              </button>
            </div>

            {/* Selectors or Calendar */}
            {activeSelector === 'month' ? (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, i) => {
                  const isDisabled = disablePast && currentYear === today.getFullYear() && i < today.getMonth();
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        if (isDisabled) return;
                        setCurrentDate(new Date(currentYear, i, 1));
                        setActiveSelector(null);
                      }}
                      className={`p-2 rounded-lg text-[12px] font-bold ${isDisabled ? "text-slate-600 cursor-not-allowed" : currentMonth === i ? "bg-[#D4AF37] text-slate-950" : "hover:bg-slate-800 text-slate-300 cursor-pointer"}`}
                    >
                      {m.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            ) : activeSelector === 'year' ? (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {Array.from({ length: 30 }).map((_, i) => {
                  const y = disablePast ? today.getFullYear() + i : new Date().getFullYear() - 10 + i;
                  return (
                    <button
                      key={y}
                      onClick={() => {
                        setCurrentDate(new Date(y, currentMonth, 1));
                        setActiveSelector(null);
                      }}
                      className={`p-2 rounded-lg text-[12px] font-bold ${currentYear === y ? "bg-[#D4AF37] text-slate-950" : "hover:bg-slate-800 text-slate-300 cursor-pointer"}`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map(b => (
                    <div key={`blank-${b}`} className="w-8 h-8" />
                  ))}
                  {days.map(d => {
                    const cellDate = new Date(currentYear, currentMonth, d);
                    const minDateObj = minDate ? new Date(minDate) : null;
                    if (minDateObj) minDateObj.setHours(0, 0, 0, 0);
                    
                    const isPast = (disablePast && cellDate < today) || (minDateObj && cellDate < minDateObj);
                    const isSelected = parsedValue && 
                                       parsedValue.getDate() === d && 
                                       parsedValue.getMonth() === currentMonth && 
                                       parsedValue.getFullYear() === currentYear;
                    const isToday = today.getDate() === d && 
                                    today.getMonth() === currentMonth && 
                                    today.getFullYear() === currentYear;

                    return (
                      <button
                        key={d}
                        onClick={() => {
                          if (!isPast) handleDayClick(d);
                        }}
                        disabled={isPast}
                        className={`w-8 h-8 rounded-lg text-[12px] flex items-center justify-center transition-colors 
                          ${isPast ? "text-slate-600 cursor-not-allowed" : "cursor-pointer"}
                          ${isSelected ? "bg-[#D4AF37] text-slate-950 font-black shadow-md shadow-[#D4AF37]/30" : 
                            isToday && !isSelected ? "bg-slate-800 text-[#D4AF37] font-bold border border-[#D4AF37]/30" : 
                            !isPast && !isSelected ? "text-slate-300 hover:bg-slate-800 hover:text-white" : ""}
                        `}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
