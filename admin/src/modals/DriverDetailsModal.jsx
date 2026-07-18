import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { getDriverById } from "../Redux/Thunks/driver.thunks";
import { 
  MdClose, MdPerson, MdPhone, MdEmail, MdShield, 
  MdDirectionsCar, MdCheckCircle, MdWarning, MdCalendarToday 
} from "react-icons/md";

export default function DriverDetailsModal({ driverId, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("DriverDetailsModal mounted with driverId:", driverId);
    dispatch(getDriverById(driverId))
      .unwrap()
      .then((res) => {
        console.log("Driver details fetched successfully:", res);
        // Handle cases where the backend might wrap the response in { data: ... } or { driver: ... }
        setData(res.data || res.driver || res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch driver details", err);
        setLoading(false);
      });
  }, [dispatch, driverId]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" style={{ pointerEvents: 'auto' }}>
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
      />
      
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 rounded-full border-4 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mb-4" />
            <div className="text-sm font-bold text-[#111827]/50">Loading comprehensive profile...</div>
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <MdWarning size={48} className="text-red-400 mb-4" />
            <div className="text-lg font-bold text-[#111827]">Failed to load driver</div>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-[#111827]/5 rounded-lg text-sm font-semibold">Close</button>
          </div>
        ) : (
          <DriverProfileContent data={data} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body
  );
}

function DriverProfileContent({ data, onClose }) {
  const [activeTab, setActiveTab] = useState("details");
  const driver = data.Driver || {};
  const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown Driver";
  const avatar = name.substring(0, 2).toUpperCase();
  const joinDate = new Date(data.createdAt).toLocaleDateString();
  const isActive = driver.isActive;
  const isVerified = driver.isVerified;

  const renderImageThumbnails = (images) => {
    let imgArray = [];
    if (typeof images === "string") imgArray = [images];
    else if (Array.isArray(images)) imgArray = images;

    if (!imgArray.length) return <span className="text-[11px] text-[#111827]/30 italic">No document uploaded</span>;
    return (
      <div className="flex gap-3 mt-2 flex-wrap">
        {imgArray.map((img, i) => (
          <a 
            key={i} 
            href={img}
            target="_blank"
            rel="noopener noreferrer"
            className="w-20 h-20 rounded-xl bg-[#111827]/5 border border-[#111827]/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:shadow-md transition-all group relative"
          >
            <img src={img} alt={`Document ${i+1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#111827]/0 group-hover:bg-[#111827]/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md text-xs font-bold transition-opacity">View</span>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-6 pb-4 bg-gradient-to-br from-white to-[#111827]/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-[#D4AF37]/20">
            {avatar}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#111827] tracking-tight leading-none">{name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] font-bold text-[#D4AF37] font-mono tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded-md">ID: {data.id}</span>
              <span className="text-[11px] font-bold text-[#111827]/40 uppercase tracking-widest">{driver.driverType?.replace("_", " ") || "DRIVER"}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#111827]/30 hover:bg-[#111827]/5 hover:text-[#111827]/70 transition-all bg-white border border-[#111827]/5 shadow-sm">
          <MdClose size={20} />
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[#111827]/10 px-6 bg-white shrink-0">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "details" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-[#111827]/40 hover:text-[#111827]/70"
          }`}
        >
          Basic Details
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "documents" ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-[#111827]/40 hover:text-[#111827]/70"
          }`}
        >
          Documents
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div className="flex flex-wrap gap-4">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-600"}`}>
                {isActive ? <MdCheckCircle size={18} /> : <MdWarning size={18} />}
                <span className="text-sm font-bold">{isActive ? "Active Account" : "Suspended"}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isVerified ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600"}`}>
                {isVerified ? <MdCheckCircle size={18} /> : <MdWarning size={18} />}
                <span className="text-sm font-bold">{isVerified ? "Verified Identity" : "Pending Verification"}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white border-[#111827]/10 text-[#111827]/60">
                <MdCalendarToday size={16} className="text-[#111827]/40" />
                <span className="text-[12px] font-semibold">Onboarded {joinDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Details */}
              <div className="bg-white rounded-2xl border border-[#111827]/6 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-4 pb-3 border-b border-[#111827]/6">
                  <MdPerson className="text-[#D4AF37]" size={18} /> Contact Information
                </h3>
                <div className="space-y-3">
                  <DetailRow label="Email Address" value={data.email} />
                  <DetailRow label="Phone Number" value={data.phone} mono />
                  <DetailRow label="Role" value={data.role} capitalize />
                </div>
              </div>

              {/* Assignments */}
              <div className="bg-white rounded-2xl border border-[#111827]/6 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-4 pb-3 border-b border-[#111827]/6">
                  <MdDirectionsCar className="text-[#D4AF37]" size={18} /> Current Assignment
                </h3>
                {driver.vehicleAssignedId ? (
                  <div className="space-y-3">
                    <DetailRow label="Assigned Vehicle ID" value={driver.vehicleAssignedId} mono />
                    <DetailRow label="Device ID" value={driver.deviceId || "None"} mono />
                  </div>
                ) : (
                  <div className="py-4 text-center text-[12px] text-[#111827]/40 italic bg-[#111827]/2 rounded-lg border border-[#111827]/5">
                    This driver does not have a vehicle assigned currently.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Details & Scans */}
            <div className="bg-white rounded-2xl border border-[#111827]/6 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-4 pb-3 border-b border-[#111827]/6">
                <MdDirectionsCar className="text-[#D4AF37]" size={18} /> Driving License
              </h3>
              <div className="space-y-3">
                <DetailRow label="License Number" value={driver.licenseNumber} mono />
                <DetailRow label="License Type" value={driver.licenseType} />
                <DetailRow label="Vehicle Categories" value={driver.vehicleCategories} />
                <DetailRow label="Expiry Date" value={driver.licenseExpiryDate} />
              </div>
              <div className="mt-4 pt-3 border-t border-[#111827]/6">
                <span className="text-[11px] font-bold text-[#111827]/40 uppercase tracking-widest block mb-1">License Scans</span>
                {renderImageThumbnails(driver.licenseImage)}
              </div>
            </div>

            {/* Identity Details & Scans */}
            <div className="bg-white rounded-2xl border border-[#111827]/6 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-4 pb-3 border-b border-[#111827]/6">
                <MdShield className="text-[#D4AF37]" size={18} /> Government Identity
              </h3>
              
              <div className="mb-5">
                <DetailRow label="Aadhaar Number" value={driver.aadhaarCard} mono />
                <div className="mt-2">
                  <span className="text-[11px] font-bold text-[#111827]/40 uppercase tracking-widest block mb-1">Aadhaar Scans</span>
                  {renderImageThumbnails(driver.aadharImage)}
                </div>
              </div>

              <div className="pt-4 border-t border-[#111827]/6">
                <DetailRow label="PAN Number" value={driver.panCard} mono />
                <div className="mt-2">
                  <span className="text-[11px] font-bold text-[#111827]/40 uppercase tracking-widest block mb-1">PAN Scans</span>
                  {renderImageThumbnails(driver.panImage)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer / Actions */}
      <div className="shrink-0 p-5 border-t border-[#111827]/6 bg-white flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#111827]/60 hover:bg-[#111827]/5 hover:text-[#111827] transition-colors">
          Close
        </button>
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#111827]/10 text-[#111827] shadow-sm hover:border-[#111827]/20 hover:bg-[#111827]/2 transition-all flex items-center gap-2">
          <MdShield size={16} /> Update Verification
        </button>
      </div>
    </>
  );
}

function DetailRow({ label, value, mono, capitalize }) {
  if (value === null || value === undefined || value === "") {
    value = "—";
  }
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] font-medium text-[#111827]/50 mt-0.5">{label}</span>
      <span className={`text-[13px] font-semibold text-[#111827] text-right ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}
