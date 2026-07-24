import { MdDelete } from "react-icons/md";

export default function DeleteDriverModal({ driver: d, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-[#111827]/65 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="rounded-2xl w-full max-w-sm bg-white backdrop-blur-none border border-red-500/25 shadow-[0_24px_64px_rgba(0,0,0,0.12)] pointer-events-auto">
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              <MdDelete size={28} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#111827]">Delete Driver?</h3>
              <p className="text-[12px] text-[#111827]/45 mt-2 leading-relaxed">
                Permanently delete <span className="text-[#111827] font-bold">{d.name}</span>{" "}
                (<span className="font-mono text-[#D4AF37]">{d.id}</span>) from the fleet?
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-5 border-t border-[#111827]/6">
            <button onClick={onCancel} className="flex-1 h-9 rounded-lg text-[12px] font-semibold text-[#111827]/50 border border-[#111827]/10 hover:border-[#111827]/20 hover:text-[#111827]/70 bg-[#111827]/5 hover:bg-[#111827]/10 transition-all flex items-center justify-center cursor-pointer">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 h-9 rounded-lg text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <MdDelete size={14} /> Delete Driver
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
