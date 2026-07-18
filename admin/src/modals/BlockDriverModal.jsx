import { MdBlock, MdCheckCircle } from "react-icons/md";

export default function BlockDriverModal({ driver: d, action, onConfirm, onCancel, loading }) {
  const isSuspend = action === "suspend";
  return (
    <>
      <div className="fixed inset-0 bg-[#111827]/65 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className={`rounded-2xl w-full max-w-sm bg-white backdrop-blur-none border shadow-[0_24px_64px_rgba(0,0,0,0.12)] pointer-events-auto ${isSuspend ? "border-amber-500/25" : "border-[#D4AF37]/25"}`}>
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSuspend ? "bg-amber-500/10 border border-amber-500/25" : "bg-[#D4AF37]/10 border border-[#D4AF37]/25"}`}>
              {isSuspend
                ? <MdBlock size={28} className="text-amber-400" />
                : <MdCheckCircle size={28} className="text-[#D4AF37]" />
              }
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#111827]">
                {isSuspend ? "Suspend Driver?" : "Activate Driver?"}
              </h3>
              <p className="text-[12px] text-[#111827]/45 mt-2 leading-relaxed">
                {isSuspend
                  ? <>Are you sure you want to suspend <span className="text-[#111827] font-bold">{d.name}</span>? They will lose access until reactivated.</>
                  : <>Reactivate <span className="text-[#111827] font-bold">{d.name}</span>? They will regain full access to the fleet.</>
                }
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-[#111827]/6">
            <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-[12px] font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/70 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all flex items-center justify-center cursor-pointer">
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={onConfirm}
              className={`flex-1 h-9 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer ${
                isSuspend ? "bg-amber-500 hover:bg-amber-600" : "bg-[#D4AF37] hover:bg-[#D4AF37]/80"
              }`}
            >
              {isSuspend ? <><MdBlock size={14} /> Suspend</> : <><MdCheckCircle size={14} /> Activate</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
