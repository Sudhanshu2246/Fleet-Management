import { motion } from "framer-motion";
import {
  MdAssignment,
  MdClose,
  MdLocalShipping,
  MdLocationOn,
  MdCalendarToday,
} from "react-icons/md";

const STATUS_MAP = {
  active:    { label: "Active",    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20" },
  completed: { label: "Completed", badgeCls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  scheduled: { label: "Scheduled", badgeCls: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
};

export default function AssignmentDetailsModal({ assignment, onClose }) {
  if (!assignment) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#111827]/80 backdrop-blur-md z-[70]" 
        onClick={onClose} 
      />
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="rounded-3xl w-full max-w-lg bg-white border border-[#111827]/10 shadow-[0_24px_80px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                <MdAssignment size={18} className="text-[#D4AF37]" />
              </div>
              Assignment Details
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
              <MdClose size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">
            
            {/* ID and Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignment ID</p>
                <p className="text-lg font-black text-gray-900">{assignment.id}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold tracking-wide capitalize ${STATUS_MAP[assignment.status]?.badgeCls}`}>
                {STATUS_MAP[assignment.status]?.label}
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  <MdLocalShipping size={20} className="text-gray-400" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle</p>
                  <p className="text-sm font-bold text-gray-900">{assignment.vehicleNumber} <span className="text-gray-400 font-normal ml-1 capitalize">({assignment.vehicleType})</span></p>
               </div>
            </div>

            {/* Route */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Route Details</p>
              <div className="flex items-center gap-3">
                <MdLocationOn size={18} className="text-[#D4AF37]" />
                <span className="text-sm font-semibold text-gray-900">{assignment.tripFrom}</span>
                <span className="text-gray-300">→</span>
                <span className="text-sm font-semibold text-gray-900">{assignment.tripTo}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <MdCalendarToday size={14} /> Started: {new Date(assignment.tripStartDate).toLocaleString()}
              </div>
            </div>

            {/* Personnel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Driver</p>
                <p className="text-sm font-bold text-gray-900">{assignment.driverName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{assignment.driverPhone}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Co-Pilot</p>
                <p className="text-sm font-bold text-gray-900">{assignment.coDriverName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{assignment.coDriverPhone}</p>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#111827] text-white hover:bg-black transition-all shadow-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
