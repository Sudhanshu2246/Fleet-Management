import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdCheck } from "react-icons/md";
import { useDispatch } from "react-redux";
import { updateTripStatus } from "../Redux/Thunks/trip.thunks";

export default function UpdateTripStatusModal({ isOpen, onClose, trip }) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setStatus(trip.status);
    }
  }, [trip]);

  if (!isOpen) return null;

  const STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
    { value: "assigned", label: "Assigned", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" },
    { value: "ongoing", label: "Ongoing", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
    { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border border-red-500/20" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status || !trip) return;

    setIsSubmitting(true);
    try {
      await dispatch(updateTripStatus({ id: trip.id, status })).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#111827]/5">
                <h2 className="text-lg font-bold text-[#111827]">
                  Update Status
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#111827]/5 text-[#111827]/40 hover:text-[#111827] transition-colors"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-[#111827]/50 mb-3 uppercase tracking-wider">
                    Select New Status
                  </p>
                  <div className="flex flex-col gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          status === opt.value
                            ? "border-[#111827] bg-[#111827]/5"
                            : "border-transparent hover:bg-[#111827]/5"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${opt.color}`}
                        >
                          {opt.label}
                        </span>
                        {status === opt.value && <MdCheck size={18} className="text-[#111827]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#111827]/70 hover:bg-[#111827]/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || status === trip?.status}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#111827] hover:bg-[#111827]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
