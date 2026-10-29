import { MdDirectionsCar, MdClose, MdMyLocation, MdHistory, MdDelete, MdPerson, MdLocationOn } from "react-icons/md";

const TYPE_ICON = { truck: MdDirectionsCar, van: MdDirectionsCar, bike: MdDirectionsCar, shuttle: MdDirectionsCar };
const TYPE_LABEL = { truck: "Heavy Truck", van: "Delivery Van", bike: "Delivery Bike", shuttle: "Passenger Shuttle" };
const STATUS_MAP = {
  active:    { label: "Active",    badgeCls: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20", dotCls: "bg-[#D4AF37]", pulseCls: "animate-pulse" },
  idle:      { label: "Idle",      badgeCls: "bg-amber-500/10  text-amber-400  border border-amber-500/20",  dotCls: "bg-amber-400",   pulseCls: "" },
  maintenance:{label: "Maintenance",badgeCls: "bg-red-500/10    text-red-400    border border-red-500/20",    dotCls: "bg-red-400",     pulseCls: "" },
};

export default function VehicleDrawer({ vehicle: v, onClose, onDelete }) {
  const TypeIcon = TYPE_ICON[v.type] || MdDirectionsCar;
  const st = STATUS_MAP[v.status] || STATUS_MAP.active;

  const statusBannerCls = v.status === "active"
    ? "bg-[#D4AF37]/8 border-[#D4AF37]/25"
    : v.status === "idle"
    ? "bg-amber-500/8 border-amber-500/25"
    : "bg-red-500/8 border-red-500/25";

  const statusTextCls = v.status === "active" ? "text-[#D4AF37]" : v.status === "idle" ? "text-amber-400" : "text-red-400";

  return (
    <>
      <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#151D2C] backdrop-blur-md border-l border-slate-800 z-50 flex flex-col shadow-[-4px_0_40px_rgba(0,0,0,0.6)] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <TypeIcon size={20} className="text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[14px] font-black text-white">{v.name}</div>
              <div className="text-[11px] font-bold text-[#D4AF37] font-mono">{v.id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <MdClose size={17} />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mx-5 mt-4 flex items-center justify-between px-4 py-3 rounded-xl border ${statusBannerCls}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${st.dotCls} ${st.pulseCls}`} />
            <span className={`text-[13px] font-bold ${statusTextCls}`}>{st.label}</span>
          </div>
          <span className="text-[11px] text-slate-400">Last seen: {v.lastSeen}</span>
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {[
            { label: "Speed",   value: v.speed > 0 ? `${v.speed}` : "—", unit: "km/h",  colorCls: "text-[#D4AF37]" },
            { label: "Battery", value: `${v.battery || 0}`,              unit: "%",     colorCls: (v.battery || 0) <= 20 ? "text-red-400" : (v.battery || 0) <= 50 ? "text-amber-400" : "text-[#D4AF37]" },
            { label: "Trips",   value: `${v.trips || 0}`,                unit: "total", colorCls: "text-[#D4AF37]" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className={`text-xl font-black font-mono ${m.colorCls}`}>{m.value}</span>
              <span className="text-[9px] text-slate-400 mt-0.5">{m.unit}</span>
              <span className="text-[9px] text-slate-400">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Detail sections */}
        <div className="px-5 flex flex-col gap-4 pb-5">
          <DrawerSection title="Driver Information" icon={MdPerson}>
            <DrawerRow label="Full Name" value={v.driverAssigned?.name || "Unassigned"} />
            <DrawerRow label="Phone"     value={v.driverAssigned?.phone || "—"} mono />
          </DrawerSection>

          <DrawerSection title="Current Location" icon={MdLocationOn}>
            <DrawerRow label="Address"   value={v.locationAddress || "Unknown"} />
            <DrawerRow label="Latitude"  value={v.locationLat != null ? Number(v.locationLat).toFixed(4) : "—"} mono />
            <DrawerRow label="Longitude" value={v.locationLng != null ? Number(v.locationLng).toFixed(4) : "—"} mono />
          </DrawerSection>

          <DrawerSection title="Vehicle Details" icon={MdDirectionsCar}>
            <DrawerRow label="Type"     value={TYPE_LABEL[v.type] || "Unknown"} />
            <DrawerRow label="Total KM" value={v.distance} mono />
            <DrawerRow label="IMEI"     value={v.imei} mono />
            <DrawerRow label="SIM"      value={v.sim}  mono />
          </DrawerSection>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 p-5 border-t border-slate-800 shrink-0 mt-auto">
          <button className="flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-bold bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/35 transition-shadow cursor-pointer">
            <MdMyLocation size={15} /> Live Track
          </button>
          <button className="flex items-center justify-center gap-2 flex-1 h-9 rounded-lg text-[12px] font-semibold text-slate-300 border border-slate-700/60 hover:border-slate-600 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 transition-all cursor-pointer">
            <MdHistory size={15} /> Trip History
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 transition-colors shrink-0 cursor-pointer"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
        <Icon size={13} className="text-[#D4AF37]" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function DrawerRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-slate-400 shrink-0">{label}</span>
      <span className={`text-[11px] text-right text-white break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
