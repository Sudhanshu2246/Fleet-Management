import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdBusiness, MdAdminPanelSettings } from "react-icons/md";

export default function MyProfile() {
  const { user } = useSelector((state) => state.auth);

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const roleLabel = (role) => {
    if (role === "super_admin") return "Super Admin";
    if (role === "company_admin") return "Company Admin";
    return "Admin";
  };

  return (
    <div className="flex-1 p-6 md:p-8 w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">My Profile</h1>
        <p className="text-sm text-slate-400">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-[#151D2C]/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-[#0B0F17] text-3xl shrink-0 bg-[#D4AF37] ring-4 ring-[#D4AF37]/25 mx-auto md:mx-0 shadow-lg">
            {getInitials(user?.name)}
          </div>

          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <MdPerson className="text-slate-400" size={18} />
                  <span className="text-sm font-medium text-white">{user?.name || "N/A"}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <MdEmail className="text-slate-400" size={18} />
                  <span className="text-sm font-medium text-white">{user?.email || "N/A"}</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <MdAdminPanelSettings className="text-[#D4AF37]" size={18} />
                  <span className="text-sm font-medium text-white">{roleLabel(user?.role)}</span>
                </div>
              </div>

              {/* Organization */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Organization ID</label>
                <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <MdBusiness className="text-slate-400" size={18} />
                  <span className="text-sm font-medium text-white">{user?.organization || "N/A"}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
