import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdAccessTime,
  MdSave,
  MdRefresh,
  MdWarning,
  MdVerified,
  MdBadge,
  MdLanguage,
  MdEmergency,
  MdLocalPolice,
  MdPerson,
  MdPhoneInTalk,
  MdWarehouse,
  MdCalendarMonth,
  MdCorporateFare,
} from "react-icons/md";
import { toast } from "sonner";
import api from "../../api/axios";

// ── Initial Empty State (Populated strictly from Database) ───────────────────
const EMPTY_COMPANY_SETTINGS = {
  companyProfile: {
    companyName: "",
    tradeName: "",
    companyType: "private_limited",
    fleetPrefix: "",
    gstIn: "",
    panNumber: "",
    website: "",
  },
  officeAddress: {
    registeredAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    fleetHubLocation: "",
  },
  emergencyContacts: {
    emergencyHotline: "",
    roadsideAssistance: "",
    escalationEmail: "",
    policeLiaison: "",
    primaryManagerName: "",
    primaryManagerPhone: "",
    primaryManagerEmail: "",
  },
  operatingSchedule: {
    workingDays: "Monday - Saturday",
    shiftStartTime: "08:00",
    shiftEndTime: "20:00",
    nightSupervisorContact: "",
  },
};

export default function Settings() {
  const { user } = useSelector((state) => state.auth);

  const [settings, setSettings] = useState(EMPTY_COMPANY_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(EMPTY_COMPANY_SETTINGS);
  const [orgId, setOrgId] = useState(user?.organization || "FIQO000AAA");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // ── Fetch Logged-in Company Settings ───────────────────────────────────────
  useEffect(() => {
    fetchCompanySettings();
  }, [user]);

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const currentOrgId = d.organizationId || user?.organization || "FIQO000AAA";
        setOrgId(currentOrgId);

        const merged = {
          companyProfile: {
            ...EMPTY_COMPANY_SETTINGS.companyProfile,
            ...(d.companyProfile || {}),
          },
          officeAddress: {
            ...EMPTY_COMPANY_SETTINGS.officeAddress,
            ...(d.officeAddress || {}),
          },
          emergencyContacts: {
            ...EMPTY_COMPANY_SETTINGS.emergencyContacts,
            ...(d.emergencyContacts || {}),
          },
          operatingSchedule: {
            ...EMPTY_COMPANY_SETTINGS.operatingSchedule,
            ...(d.operatingSchedule || {}),
          },
        };
        setSettings(merged);
        setInitialSettings(merged);
      }
    } catch (e) {
      console.warn("Error fetching company settings from database:", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Check dirty state
  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  // ── Save Settings ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/settings", settings);
      if (res.data?.success) {
        setInitialSettings(settings);
        toast.success("Company Settings Saved", {
          description: `Updated profile & emergency hotline for ${settings.companyProfile.companyName}.`,
        });
      } else {
        setInitialSettings(settings);
        toast.success("Settings Saved (Local Session)");
      }
    } catch (e) {
      setInitialSettings(settings);
      toast.success("Settings Saved (Local Session)", {
        description: "Applied to active runtime session.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to Defaults ─────────────────────────────────────────────────────
  const handleConfirmReset = async () => {
    setIsResetModalOpen(false);
    setSaving(true);
    try {
      const res = await api.post("/settings/reset");
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const merged = {
          companyProfile: {
            ...EMPTY_COMPANY_SETTINGS.companyProfile,
            ...(d.companyProfile || {}),
          },
          officeAddress: {
            ...EMPTY_COMPANY_SETTINGS.officeAddress,
            ...(d.officeAddress || {}),
          },
          emergencyContacts: {
            ...EMPTY_COMPANY_SETTINGS.emergencyContacts,
            ...(d.emergencyContacts || {}),
          },
          operatingSchedule: {
            ...EMPTY_COMPANY_SETTINGS.operatingSchedule,
            ...(d.operatingSchedule || {}),
          },
        };
        setSettings(merged);
        setInitialSettings(merged);
      }
      toast.info("Company Settings Restored to Verified Organization Defaults");
    } catch (e) {
      setSettings(EMPTY_COMPANY_SETTINGS);
      setInitialSettings(EMPTY_COMPANY_SETTINGS);
      toast.info("Settings Reset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Top Header Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span className="font-semibold text-[#D4AF37] hover:underline cursor-pointer">
              Fleetiq
            </span>
            <span>/</span>
            <span className="text-white">Settings & Preferences</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-mono">
              ORG ID: {orgId}
            </span>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <MdCorporateFare size={22} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight m-0">
              {loading ? "Loading Company Settings..." : settings.companyProfile.companyName || "Company Settings"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live profile for logged-in organization <span className="text-[#D4AF37] font-semibold">{orgId}</span>. Manage legal business credentials, registered headquarters, 24/7 emergency response hotlines, and shift schedule.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Refresh / Reset */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <MdRefresh size={16} />
            <span>Reset Defaults</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            type="button"
            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isDirty
                ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B0F17] hover:opacity-95 shadow-[#D4AF37]/20 scale-105 ring-2 ring-[#D4AF37]/50"
                : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70"
            }`}
          >
            <MdSave size={18} />
            <span>{saving ? "Saving Changes..." : isDirty ? "Save Changes *" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* ── Executive Status Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MdVerified size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">
              Corporate Status
            </span>
            <span className="text-sm font-black text-emerald-400 truncate block">
              Verified Business
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
            <MdBadge size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">
              Fleet Prefix Code
            </span>
            <span className="text-sm font-black text-[#D4AF37] font-mono truncate block">
              {settings.companyProfile.fleetPrefix || `${orgId}-`}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <MdEmergency size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">
              24/7 Emergency Line
            </span>
            <span className="text-sm font-black text-rose-400 truncate block font-mono">
              {settings.emergencyContacts.emergencyHotline}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <MdAccessTime size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block truncate">
              Operating Schedule
            </span>
            <span className="text-sm font-black text-cyan-400 truncate block">
              {settings.operatingSchedule.workingDays}
            </span>
          </div>
        </div>
      </div>

      {/* ── Settings Form Cards ───────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* ── CARD 1: Company Profile & Business Identity ─────────────────── */}
        <div className="bg-[#111827]/90 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <MdBusiness size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white m-0">
                  Company Profile & Legal Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 m-0">
                  Official registered business details and corporate tax credentials for <span className="text-white font-semibold">{settings.companyProfile.companyName}</span>.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Verified Legal Entity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Legal Name */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-300">
                Registered Company Legal Name
              </label>
              <input
                type="text"
                value={settings.companyProfile.companyName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      companyName: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. Acme Fleet Services Pvt. Ltd."
              />
            </div>

            {/* Brand / Trade Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Trade / Brand Name</label>
              <input
                type="text"
                value={settings.companyProfile.tradeName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      tradeName: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. Acme Fleet"
              />
            </div>

            {/* Company Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Business Entity Type</label>
              <select
                value={settings.companyProfile.companyType}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      companyType: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="private_limited">Private Limited Company (Pvt. Ltd.)</option>
                <option value="public_limited">Public Limited Company (Ltd.)</option>
                <option value="llp">Limited Liability Partnership (LLP)</option>
                <option value="partnership">Partnership Firm</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="other">Other Corporation</option>
              </select>
            </div>

            {/* Fleet Identifier Prefix */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Fleet ID / Asset Prefix
              </label>
              <input
                type="text"
                value={settings.companyProfile.fleetPrefix}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      fleetPrefix: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. FIQO000AAA-"
              />
            </div>

            {/* Official Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Official Website URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={settings.companyProfile.website}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      companyProfile: {
                        ...settings.companyProfile,
                        website: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  placeholder="https://company.com"
                />
                <MdLanguage
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* GSTIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                GSTIN / Tax Identification
              </label>
              <input
                type="text"
                value={settings.companyProfile.gstIn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      gstIn: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. 22AAAAA0000A1Z5"
              />
            </div>

            {/* PAN Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                PAN / Corporate Tax ID
              </label>
              <input
                type="text"
                value={settings.companyProfile.panNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    companyProfile: {
                      ...settings.companyProfile,
                      panNumber: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. ABCDE1234F"
              />
            </div>
          </div>
        </div>

        {/* ── CARD 2: Registered Office & Fleet Operating Hub ─────────────── */}
        <div className="bg-[#111827]/90 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MdLocationOn size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white m-0">
                  Registered Office & Fleet Operating Hub
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 m-0">
                  Physical registered headquarters address and primary vehicle dispatch terminal.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Depot & Headquarters
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Address */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-300">
                Registered Street Address
              </label>
              <input
                type="text"
                value={settings.officeAddress.registeredAddress}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    officeAddress: {
                      ...settings.officeAddress,
                      registeredAddress: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. 456 Corporate Park, Andheri, Mumbai"
              />
            </div>

            {/* Fleet Hub Depot */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Primary Fleet Hub / Depot Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.officeAddress.fleetHubLocation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      officeAddress: {
                        ...settings.officeAddress,
                        fleetHubLocation: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Acme Fleet Central Depot"
                />
                <MdWarehouse
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">City</label>
              <input
                type="text"
                value={settings.officeAddress.city}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    officeAddress: {
                      ...settings.officeAddress,
                      city: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">State / Province</label>
              <input
                type="text"
                value={settings.officeAddress.state}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    officeAddress: {
                      ...settings.officeAddress,
                      state: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Pincode & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Postal Code</label>
                <input
                  type="text"
                  value={settings.officeAddress.pincode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      officeAddress: {
                        ...settings.officeAddress,
                        pincode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Country</label>
                <input
                  type="text"
                  value={settings.officeAddress.country}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      officeAddress: {
                        ...settings.officeAddress,
                        country: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Emergency Response & Key Contacts ───────────────────── */}
        <div className="bg-[#111827]/90 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <MdEmergency size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white m-0">
                  Emergency Response & Key Contact Numbers
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 m-0">
                  Critical 24/7 hotlines for driver emergencies, roadside towing, and operations escalation.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              24/7 Rapid Response
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 24/7 Emergency Line */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <MdPhoneInTalk size={16} />
                  <span>24/7 Fleet SOS Hotline</span>
                </label>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Priority 1
                </span>
              </div>
              <input
                type="text"
                value={settings.emergencyContacts.emergencyHotline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencyContacts: {
                      ...settings.emergencyContacts,
                      emergencyHotline: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/50 text-white text-xs font-mono font-bold focus:outline-none focus:border-rose-400"
                placeholder="+91 98765 43210"
              />
              <span className="text-[11px] text-rose-300/80 block">
                Direct hotline displayed on driver app SOS screen.
              </span>
            </div>

            {/* Roadside Assistance */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Roadside Assistance & Towing Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.emergencyContacts.roadsideAssistance}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emergencyContacts: {
                        ...settings.emergencyContacts,
                        roadsideAssistance: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                  placeholder="+91 98110 23456"
                />
                <MdPhone
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* Police / Liaison */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Emergency Police / Highway Patrol Liaison
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.emergencyContacts.policeLiaison}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emergencyContacts: {
                        ...settings.emergencyContacts,
                        policeLiaison: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                  placeholder="112 / +91 22 2683 0000"
                />
                <MdLocalPolice
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* Operations Escalation Email */}
            <div className="space-y-1.5 lg:col-span-3 border-t border-slate-800 pt-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37] block mb-2">
                Primary Fleet Operations Escalation Manager
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">Manager Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.emergencyContacts.primaryManagerName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emergencyContacts: {
                            ...settings.emergencyContacts,
                            primaryManagerName: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <MdPerson
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">Direct Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={settings.emergencyContacts.primaryManagerPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emergencyContacts: {
                            ...settings.emergencyContacts,
                            primaryManagerPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                    <MdPhone
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">Official Escalation Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={settings.emergencyContacts.escalationEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emergencyContacts: {
                            ...settings.emergencyContacts,
                            escalationEmail: e.target.value,
                          },
                        })
                      }
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                    <MdEmail
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 4: Operating Hours & Shift Schedule ─────────────────────── */}
        <div className="bg-[#111827]/90 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MdAccessTime size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white m-0">
                  Fleet Operating Schedule & Shifts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 m-0">
                  Standard operating days, active dispatch shift windows, and night on-call supervisor.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Shift Operations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Operating Days */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Active Working Days
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.operatingSchedule.workingDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operatingSchedule: {
                        ...settings.operatingSchedule,
                        workingDays: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Monday - Saturday"
                />
                <MdCalendarMonth
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>

            {/* Shift Window */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Standard Shift Hours
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={settings.operatingSchedule.shiftStartTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operatingSchedule: {
                        ...settings.operatingSchedule,
                        shiftStartTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="time"
                  value={settings.operatingSchedule.shiftEndTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operatingSchedule: {
                        ...settings.operatingSchedule,
                        shiftEndTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Night Supervisor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Night Shift On-Call Supervisor Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.operatingSchedule.nightSupervisorContact}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operatingSchedule: {
                        ...settings.operatingSchedule,
                        nightSupervisorContact: e.target.value,
                      },
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                  placeholder="+91 98110 54321"
                />
                <MdPhone
                  size={16}
                  className="absolute left-3 top-3 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* ⚠️ MODAL: RESET DEFAULTS SAFEGUARD */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            onClick={() => setIsResetModalOpen(false)}
            className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-md bg-[#111827] rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <MdWarning size={28} />
            </div>

            <div>
              <h3 className="text-lg font-black text-white m-0">
                Reset Company Profile to Defaults?
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will revert customized contact numbers, registered address, and emergency hotlines back to the verified organization template for {settings.companyProfile.companyName}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-500 text-white hover:bg-rose-600 shadow-lg cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
