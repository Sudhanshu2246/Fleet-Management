import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdWarning, 
  MdGpsOff, 
  MdBatteryAlert, 
  MdCheckCircle,
  MdSearch, 
  MdFilterList, 
  MdNotificationsActive,
  MdNotifications,
  MdNotificationsOff,
  MdAdd,
  MdRefresh,
  MdLocationOn,
  MdSpeed,
  MdTimer,
  MdClose,
  MdCheck,
  MdOpenInNew,
  MdDirectionsCar,
  MdPerson,
  MdShield,
  MdVolumeUp,
  MdVolumeOff
} from "react-icons/md";
import { toast } from "sonner";
import CustomDropdown from "../../shared/CustomDropdown";
import Pagination from "../../shared/Pagination";
import {
  subscribeToAlerts,
  addFirestoreAlert,
  resolveFirestoreAlert,
  dismissFirestoreAlert,
  requestNotificationPermission,
  onForegroundMessage,
} from "../../config/firebase";
import api from "../../api/axios";

// ── Default Initial Seed Alerts (Added to Firestore if collection is empty) ──
const INITIAL_SEED_ALERTS = [
  {
    id: "ALT-882101",
    alertId: "ALT-882101",
    type: "sos",
    title: "SOS Emergency Triggered",
    message: "Vehicle VH-4821 triggered manual SOS — Delhi-Agra Expressway (NH-44)",
    priority: "Critical",
    severity: "critical",
    status: "Active",
    vehicleId: "VH-4821",
    driverName: "Vikram Malhotra",
    driverId: 103,
    speed: 64,
    battery: 88,
    locationLat: 28.5355,
    locationLng: 77.3910,
    locationAddress: "Noida Sector 62 Interchange, NH-44",
    createdAtIso: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "ALT-882102",
    alertId: "ALT-882102",
    type: "speed",
    title: "Overspeeding Breach",
    message: "Vehicle VH-3310 exceeded 80 km/h limit (recorded 94 km/h in urban zone)",
    priority: "High",
    severity: "high",
    status: "Active",
    vehicleId: "VH-3310",
    driverName: "Rahul Sharma",
    driverId: 104,
    speed: 94,
    battery: 92,
    locationLat: 28.6289,
    locationLng: 77.2065,
    locationAddress: "Barakhamba Road, Connaught Place, New Delhi",
    createdAtIso: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
  },
  {
    id: "ALT-882103",
    alertId: "ALT-882103",
    type: "stoppage",
    title: "Prolonged Stationary Halt (>60s)",
    message: "Vehicle VH-1092 stationary for 4m 20s at unauthorized transit intersection",
    priority: "Medium",
    severity: "medium",
    status: "Active",
    vehicleId: "VH-1092",
    driverName: "Amit Kumar",
    driverId: 105,
    speed: 0,
    battery: 76,
    durationSeconds: 260,
    locationLat: 28.6506,
    locationLng: 77.1906,
    locationAddress: "Karol Bagh Logistics Hub, New Delhi",
    createdAtIso: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "ALT-882104",
    alertId: "ALT-882104",
    type: "geofence",
    title: "Geofence Exit Detected",
    message: "Driver UID-2291 crossed designated corridor boundary — Outer Ring Road",
    priority: "High",
    severity: "high",
    status: "Active",
    vehicleId: "VH-2104",
    driverName: "Priya Patel",
    driverId: 106,
    speed: 52,
    battery: 84,
    locationLat: 28.7041,
    locationLng: 77.1025,
    locationAddress: "Outer Ring Road, Pitampura, New Delhi",
    createdAtIso: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "ALT-882105",
    alertId: "ALT-882105",
    type: "battery",
    title: "Critical Low Battery",
    message: "Telematics Unit DEV-0093 battery dropped to 9% — unit risk of going offline",
    priority: "Medium",
    severity: "medium",
    status: "Active",
    vehicleId: "VH-7740",
    driverName: "Suresh Raina",
    driverId: 107,
    speed: 38,
    battery: 9,
    locationLat: 28.5832,
    locationLng: 77.2274,
    locationAddress: "Lodhi Road Logistics Corridor, New Delhi",
    createdAtIso: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: "ALT-882106",
    alertId: "ALT-882106",
    type: "system",
    title: "System Microservice Normal",
    message: "Redis GPS ingest & WebSocket cluster synchronization running with 28ms latency",
    priority: "Low",
    severity: "low",
    status: "Resolved",
    resolvedBy: "System Health Monitor",
    vehicleId: "FLEET-CORE",
    driverName: "Automated Diagnostics",
    locationLat: 28.6139,
    locationLng: 77.2090,
    locationAddress: "Delhi Cloud Data Center",
    createdAtIso: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  }
];

// ── Web Audio Beep Alert Sound ────────────────────────────────────────────────
function playAlertBeep(isCritical = false) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isCritical) {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio autoplay restrictions non-fatal
  }
}

export default function Alerts() {
  const navigate = useNavigate();

  // ── Component State ─────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  const [isFirebaseSyncActive, setIsFirebaseSyncActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushStatus, setPushStatus] = useState("default"); // 'default', 'granted', 'denied'
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // Audio & Notification Reference
  const prevAlertCountRef = useRef(0);

  // ── 1. Check Notification Permission on Mount ──────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  // ── 2. Real-Time Firebase Firestore Subscription ────────────────────────────
  useEffect(() => {
    let unsubscribeFirestore = () => {};
    let isMounted = true;

    console.log("🔥 [Alerts] Setting up real-time Firebase Firestore listener...");

    try {
      unsubscribeFirestore = subscribeToAlerts(
        (firestoreAlerts) => {
          if (!isMounted) return;

          setIsFirebaseSyncActive(true);
          setLoading(false);

          if (!firestoreAlerts || firestoreAlerts.length === 0) {
            // Seed Firestore with initial realistic alerts so dashboard has rich live data
            console.log("ℹ️ [Firebase] Firestore collection 'alerts' is empty. Seeding initial fleet alerts...");
            INITIAL_SEED_ALERTS.forEach((seed) => {
              addFirestoreAlert(seed);
            });
            setAlerts(INITIAL_SEED_ALERTS);
            return;
          }

          // Check if a new alert just arrived (to play sound & trigger toast)
          if (
            prevAlertCountRef.current > 0 &&
            firestoreAlerts.length > prevAlertCountRef.current
          ) {
            const newest = firestoreAlerts[0];
            const isCritical = newest.priority === "Critical" || newest.type === "sos";

            if (soundEnabled) {
              playAlertBeep(isCritical);
            }

            toast(newest.title, {
              description: newest.message,
              icon: isCritical ? "🚨" : "⚠️",
              action: {
                label: "View",
                onClick: () => setSelectedAlertForDetails(newest),
              },
            });
          }

          prevAlertCountRef.current = firestoreAlerts.length;
          setAlerts(firestoreAlerts);
        },
        (error) => {
          console.warn("⚠️ [Alerts] Firestore subscription error, falling back to local/backend:", error.message);
          setIsFirebaseSyncActive(false);
          setAlerts(INITIAL_SEED_ALERTS);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("❌ [Alerts] Error in subscribeToAlerts:", err);
      setAlerts(INITIAL_SEED_ALERTS);
      setLoading(false);
    }

    // Safety timeout: ensure loader never hangs if Firestore initial handshake takes >1.2s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading((curr) => {
          if (curr) {
            setAlerts((prev) => (prev.length === 0 ? INITIAL_SEED_ALERTS : prev));
            return false;
          }
          return curr;
        });
      }
    }, 1200);

    // ── 3. Foreground Firebase Push Notification Listener ────────────────────
    let unsubscribeForeground = () => {};
    onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || "🚨 Fleet Alert";
      const body = payload.notification?.body || payload.data?.message || "Critical vehicle event reported";
      
      playAlertBeep(true);
      toast.error(title, {
        description: body,
      });
    }).then((unsub) => {
      if (typeof unsub === "function") unsubscribeForeground = unsub;
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribeFirestore();
      if (typeof unsubscribeForeground === "function") unsubscribeForeground();
    };
  }, [soundEnabled]);

  // ── 4. Web Push Notification Enable Handler ─────────────────────────────────
  const handleEnablePush = async () => {
    setIsRegisteringPush(true);
    try {
      const res = await requestNotificationPermission();
      if (res.success) {
        setPushStatus("granted");
        toast.success("Push Notifications Enabled", {
          description: "You will receive instant desktop alerts for critical fleet incidents",
        });
      } else {
        if (res.reason === "permission_denied") {
          setPushStatus("denied");
          toast.error("Notification Permission Denied", {
            description: "Please allow notifications in your browser settings to receive alerts",
          });
        } else {
          toast.info("Notifications Status", {
            description: `Permission: ${res.permission || "not granted"}`,
          });
        }
      }
    } catch (err) {
      toast.error("Notification Setup Failed", { description: err.message });
    } finally {
      setIsRegisteringPush(false);
    }
  };

  // ── 5. Action Handlers (Resolve & Dismiss) ───────────────────────────────────
  const handleResolveAlert = async (alertItem) => {
    try {
      // 1. Update in Firebase Firestore in real-time
      await resolveFirestoreAlert(alertItem.id, "Admin Console");

      // 2. Also notify backend API (if available)
      api.put(`/alerts/${alertItem.id}/resolve`).catch(() => {});

      // 3. Optimistic local state update
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertItem.id
            ? { ...a, status: "Resolved", resolvedBy: "Admin Console", resolvedAt: new Date().toISOString() }
            : a
        )
      );

      if (selectedAlertForDetails?.id === alertItem.id) {
        setSelectedAlertForDetails((prev) => ({
          ...prev,
          status: "Resolved",
          resolvedBy: "Admin Console",
        }));
      }

      toast.success("Alert Marked as Resolved", {
        description: `${alertItem.title} resolved and synchronized with Firebase`,
      });
    } catch (err) {
      toast.error("Failed to resolve alert", { description: err.message });
    }
  };

  const handleDismissAlert = async (alertItem) => {
    try {
      await dismissFirestoreAlert(alertItem.id);

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertItem.id ? { ...a, status: "Dismissed" } : a))
      );

      if (selectedAlertForDetails?.id === alertItem.id) {
        setSelectedAlertForDetails((prev) => ({ ...prev, status: "Dismissed" }));
      }

      toast.info("Alert Dismissed", {
        description: `Alert #${alertItem.id} moved to dismissed status`,
      });
    } catch (err) {
      toast.error("Failed to dismiss alert", { description: err.message });
    }
  };

  // ── 6. Alert Meta & Style Resolver ──────────────────────────────────────────
  const getAlertMeta = (alert) => {
    const typeLower = (alert.type || "").toLowerCase();
    const priorityLower = (alert.priority || alert.severity || "").toLowerCase();

    if (typeLower.includes("sos") || priorityLower === "critical") {
      return {
        icon: MdWarning,
        colorCls: "text-rose-400",
        bgCls: "bg-rose-500/15 border-rose-500/30",
        badgeCls: "bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse",
        category: "SOS Emergency",
      };
    }
    if (typeLower.includes("speed")) {
      return {
        icon: MdSpeed,
        colorCls: "text-red-400",
        bgCls: "bg-red-500/15 border-red-500/30",
        badgeCls: "bg-red-500/15 text-red-400 border border-red-500/30",
        category: "Overspeeding",
      };
    }
    if (typeLower.includes("stop")) {
      return {
        icon: MdTimer,
        colorCls: "text-amber-400",
        bgCls: "bg-amber-500/15 border-amber-500/30",
        badgeCls: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        category: "Stationary Halt (>60s)",
      };
    }
    if (typeLower.includes("geofence")) {
      return {
        icon: MdGpsOff,
        colorCls: "text-purple-400",
        bgCls: "bg-purple-500/15 border-purple-500/30",
        badgeCls: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
        category: "Geofence Exit",
      };
    }
    if (typeLower.includes("battery")) {
      return {
        icon: MdBatteryAlert,
        colorCls: "text-amber-400",
        bgCls: "bg-amber-500/15 border-amber-500/30",
        badgeCls: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        category: "Low Battery",
      };
    }
    return {
      icon: MdCheckCircle,
      colorCls: "text-[#D4AF37]",
      bgCls: "bg-[#D4AF37]/15 border-[#D4AF37]/30",
      badgeCls: "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30",
      category: "System Alert",
    };
  };

  // ── 7. Filtering & Search Logic ─────────────────────────────────────────────
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (alert.title && alert.title.toLowerCase().includes(q)) ||
        (alert.message && alert.message.toLowerCase().includes(q)) ||
        (alert.vehicleId && alert.vehicleId.toLowerCase().includes(q)) ||
        (alert.driverName && alert.driverName.toLowerCase().includes(q)) ||
        (alert.locationAddress && alert.locationAddress.toLowerCase().includes(q));

      const matchesStatus =
        filterStatus === "All" ||
        (alert.status && alert.status.toLowerCase() === filterStatus.toLowerCase());

      const matchesPriority =
        filterPriority === "All" ||
        (alert.priority && alert.priority.toLowerCase() === filterPriority.toLowerCase()) ||
        (alert.severity && alert.severity.toLowerCase() === filterPriority.toLowerCase());

      const matchesType =
        filterType === "All" ||
        (alert.type && alert.type.toLowerCase() === filterType.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [alerts, searchTerm, filterStatus, filterPriority, filterType]);

  const paginatedData = useMemo(() => {
    return filteredAlerts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAlerts, currentPage, itemsPerPage]);

  // ── 8. Real-Time Stats (Derived directly from live Firebase stream) ──────────
  const stats = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter((a) => (a.status || "").toLowerCase() === "active").length;
    const criticalOrHigh = alerts.filter((a) => {
      const p = (a.priority || a.severity || "").toLowerCase();
      return (p === "critical" || p === "high" || a.type === "sos") && (a.status || "").toLowerCase() === "active";
    }).length;
    const resolved = alerts.filter((a) => (a.status || "").toLowerCase() === "resolved").length;

    return { total, active, criticalOrHigh, resolved };
  }, [alerts]);

  return (
    <div className="min-h-screen bg-[#0B0F17] px-4 sm:px-6 py-6 space-y-6">
      {/* ── 1. Top Page Heading & Live Firebase Stream Indicator ─────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <nav className="flex items-center gap-1.5 mb-1.5 text-xs">
            <span className="font-semibold text-[#D4AF37] tracking-wide">FleetIQ</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Telematics Intelligence</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-bold">Alerts</span>
          </nav>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Real-Time Fleet Alerts & Push Console
            </h1>
            
            {/* Live Firebase Sync Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isFirebaseSyncActive ? "🔥 Firebase Live Sync: Connected" : "🟢 Realtime Sync Active"}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Web Push, Sound, Trigger Test Alert */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              soundEnabled
                ? "bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-400/40"
                : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
            title={soundEnabled ? "Alert Sound is ON" : "Alert Sound is MUTED"}
          >
            {soundEnabled ? <MdVolumeUp size={16} /> : <MdVolumeOff size={16} />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio Alert" : "Muted"}</span>
          </button>

          {/* Web Push Notification Button */}
          {pushStatus === "granted" ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <MdNotificationsActive size={16} />
              <span>Web Push Active</span>
            </div>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={isRegisteringPush}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 via-[#D4AF37]/25 to-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 transition-all cursor-pointer shadow-sm"
              title="Click to enable desktop browser push notifications for emergency alerts"
            >
              {isRegisteringPush ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
              ) : (
                <MdNotifications size={16} />
              )}
              <span>Enable Web Push</span>
            </button>
          )}

          {/* Trigger Real-Time Test Alert */}
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 hover:bg-[#c49f2f] shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <MdAdd size={17} />
            <span>+ Trigger Test Alert</span>
          </button>
        </div>
      </div>

      {/* ── 2. Live Stat Cards (Calculated directly from Firebase) ───────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alerts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#151D2C]/90 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Alerts
            </span>
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              {stats.total}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Synced with fleetiq-ce5da</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-inner">
            <MdFilterList size={24} />
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#151D2C]/90 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Active Incidents
            </span>
            <div className="text-3xl font-black font-mono text-rose-400 tracking-tight flex items-baseline gap-2">
              <span>{stats.active}</span>
              {stats.active > 0 && (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                  NEEDS ATTN
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Live telematics triggers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
            <MdNotificationsActive size={24} className="animate-pulse" />
          </div>
        </div>

        {/* Card 3: Critical & High Priority */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#151D2C]/90 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Critical & High
            </span>
            <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">
              {stats.criticalOrHigh}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">SOS, Speed, Stoppage</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <MdWarning size={24} />
          </div>
        </div>

        {/* Card 4: Resolved Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#151D2C]/90 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
              Resolved Today
            </span>
            <div className="text-3xl font-black font-mono text-[#D4AF37] tracking-tight">
              {stats.resolved}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Audit trail recorded</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <MdCheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* ── 3. Filters & Search Bar ───────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#151D2C]/80 border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by vehicle, driver, location, or message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <MdClose size={15} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <div className="w-36">
            <CustomDropdown
              value={filterStatus}
              onChange={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}
              icon={MdFilterList}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Resolved", value: "Resolved" },
                { label: "Dismissed", value: "Dismissed" },
              ]}
              className="h-10 text-xs"
            />
          </div>

          {/* Priority Dropdown */}
          <div className="w-38">
            <CustomDropdown
              value={filterPriority}
              onChange={(val) => {
                setFilterPriority(val);
                setCurrentPage(1);
              }}
              icon={MdWarning}
              options={[
                { label: "All Priorities", value: "All" },
                { label: "Critical", value: "Critical" },
                { label: "High", value: "High" },
                { label: "Medium", value: "Medium" },
                { label: "Low", value: "Low" },
              ]}
              className="h-10 text-xs"
            />
          </div>

          {/* Alert Type Dropdown */}
          <div className="w-40">
            <CustomDropdown
              value={filterType}
              onChange={(val) => {
                setFilterType(val);
                setCurrentPage(1);
              }}
              icon={MdSpeed}
              options={[
                { label: "All Alert Types", value: "All" },
                { label: "SOS Emergency", value: "sos" },
                { label: "Overspeeding", value: "speed" },
                { label: "Stoppage (>60s)", value: "stoppage" },
                { label: "Geofence Exit", value: "geofence" },
                { label: "Low Battery", value: "battery" },
                { label: "System Health", value: "system" },
              ]}
              className="h-10 text-xs"
            />
          </div>
        </div>
      </div>

      {/* ── 4. Dynamic Alerts List Table ──────────────────────────────────── */}
      <div className="bg-[#151D2C]/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Alert & Type</th>
                <th className="px-5 py-3.5">Vehicle & Driver</th>
                <th className="px-5 py-3.5">Incident Location & Details</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="w-8 h-8 rounded-full border-3 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin mx-auto mb-3" />
                    <span className="text-xs font-mono text-slate-400">Connecting to Firebase Realtime Stream...</span>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((alert) => {
                  const meta = getAlertMeta(alert);
                  const Icon = meta.icon;
                  const isActive = (alert.status || "").toLowerCase() === "active";
                  const isResolved = (alert.status || "").toLowerCase() === "resolved";

                  return (
                    <tr
                      key={alert.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAlertForDetails(alert)}
                    >
                      {/* Alert Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bgCls}`}>
                            <Icon size={20} className={meta.colorCls} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                              <span>{alert.title || meta.category}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              #{alert.alertId || alert.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                            <MdDirectionsCar size={13} className="text-[#D4AF37]" />
                            {alert.vehicleId || "Unassigned"}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MdPerson size={12} className="text-slate-500" />
                            {alert.driverName || "Fleet Driver"}
                          </span>
                        </div>
                      </td>

                      {/* Location & Details */}
                      <td className="px-5 py-4">
                        <div className="max-w-md">
                          <p className="text-xs text-slate-200 font-medium truncate" title={alert.message}>
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-1">
                            <MdLocationOn size={12} className="text-[#D4AF37] shrink-0" />
                            <span className="truncate">{alert.locationAddress || "Delhi NCR Transit Corridor"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">{alert.time || "Just now"}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${meta.badgeCls}`}>
                          {alert.priority || "High"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive
                                ? "bg-rose-500 animate-pulse"
                                : isResolved
                                ? "bg-emerald-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span className="text-xs font-semibold text-slate-200">
                            {alert.status || "Active"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAlertForDetails(alert)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-all cursor-pointer"
                            title="Inspect telemetry & trigger details"
                          >
                            Details
                          </button>

                          {isActive && (
                            <button
                              onClick={() => handleResolveAlert(alert)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                              title="Mark this alert as resolved"
                            >
                              <MdCheck size={13} />
                              <span className="hidden sm:inline">Resolve</span>
                            </button>
                          )}

                          {alert.locationLat && alert.locationLng && (
                            <button
                              onClick={() => navigate(`/dashboard/fleet-map?driverId=${alert.driverId || 103}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all cursor-pointer"
                              title="Open on Fleet Map"
                            >
                              <MdOpenInNew size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-500 text-sm">
                    No fleet alerts match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAlerts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ── 5. Alert Full Details Modal ────────────────────────────────────── */}
      {selectedAlertForDetails && (
        <AlertDetailsModal
          alert={selectedAlertForDetails}
          onClose={() => setSelectedAlertForDetails(null)}
          onResolve={() => handleResolveAlert(selectedAlertForDetails)}
          onDismiss={() => handleDismissAlert(selectedAlertForDetails)}
          onNavigateToMap={() => {
            const dId = selectedAlertForDetails.driverId || 103;
            setSelectedAlertForDetails(null);
            navigate(`/dashboard/fleet-map?driverId=${dId}`);
          }}
        />
      )}

      {/* ── 6. Trigger Test Alert Modal (Firebase Real-Time Dispatch) ────────── */}
      {isTriggerModalOpen && (
        <TriggerTestAlertModal
          onClose={() => setIsTriggerModalOpen(false)}
          onSuccess={(newAlert) => {
            setIsTriggerModalOpen(false);
            setAlerts((prev) => [newAlert, ...prev]);
            toast.success("Real-Time Alert Broadcasted", {
              description: "Alert synced to Firebase Firestore and sent to active Web Push clients",
            });
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 👤 ALERT FULL DETAILS MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function AlertDetailsModal({ alert, onClose, onResolve, onDismiss, onNavigateToMap }) {
  const isActive = (alert.status || "").toLowerCase() === "active";
  const isResolved = (alert.status || "").toLowerCase() === "resolved";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xl">
              <MdNotificationsActive size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{alert.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {alert.status || "Active"}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Incident ID: #{alert.alertId || alert.id} • Priority: <span className="text-[#D4AF37] font-bold">{alert.priority || "High"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer">
            <MdClose size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Incident Message Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Incident Report</span>
            <p className="text-sm font-semibold text-white leading-relaxed">{alert.message}</p>
          </div>

          {/* Telematics Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle Unit</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">{alert.vehicleId || "VH-4821"}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver</span>
              <span className="text-sm font-semibold text-white mt-0.5 block truncate">{alert.driverName || "Vikram Malhotra"}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Speed At Event</span>
              <span className="text-sm font-mono font-bold text-white mt-0.5 block">{alert.speed !== undefined ? `${alert.speed} km/h` : "58 km/h"}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Battery Level</span>
              <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">{alert.battery !== undefined ? `${alert.battery}%` : "88%"}</span>
            </div>
          </div>

          {/* Location Card */}
          <div className="p-4 rounded-2xl bg-[#151D2C] border border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <MdLocationOn size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trigger Location</span>
                <p className="text-xs font-semibold text-white mt-0.5">{alert.locationAddress || "Delhi NCR Regional Hub"}</p>
                {alert.locationLat && alert.locationLng && (
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Coordinates: ({alert.locationLat.toFixed(4)}, {alert.locationLng.toFixed(4)})
                  </span>
                )}
              </div>
            </div>
            {alert.locationLat && alert.locationLng && (
              <a
                href={`https://www.google.com/maps?q=${alert.locationLat},${alert.locationLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/25 transition-all shrink-0 flex items-center gap-1"
              >
                <span>Maps</span>
                <MdOpenInNew size={12} />
              </a>
            )}
          </div>

          {/* Resolution Audit Trail */}
          {isResolved && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <MdCheckCircle size={16} /> Incident Resolved
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Resolved by <span className="font-bold text-white">{alert.resolvedBy || "Admin"}</span> • {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : "Audit logged"}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#151D2C] flex items-center justify-between gap-3">
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 hover:bg-[#c49f2f] transition-all cursor-pointer shadow-md"
          >
            <MdDirectionsCar size={15} />
            <span>Open in Fleet Map</span>
          </button>

          <div className="flex items-center gap-2">
            {isActive && (
              <>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={onResolve}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
                >
                  <MdCheck size={14} />
                  <span>Mark Resolved</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ TRIGGER TEST ALERT MODAL (FIREBASE DISPATCH TESTER)
// ─────────────────────────────────────────────────────────────────────────────
function TriggerTestAlertModal({ onClose, onSuccess }) {
  const [alertType, setAlertType] = useState("sos");
  const [vehicleId, setVehicleId] = useState("VH-4821");
  const [driverName, setDriverName] = useState("Vikram Malhotra");
  const [priority, setPriority] = useState("Critical");
  const [customMessage, setCustomMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = {
    sos: {
      title: "SOS Emergency Triggered",
      message: "Emergency SOS button triggered on vehicle near Connaught Place",
      priority: "Critical",
      address: "Barakhamba Road, Connaught Place, New Delhi",
      lat: 28.6304,
      lng: 77.2177,
      speed: 58,
    },
    speed: {
      title: "Overspeeding Breach",
      message: "Vehicle breached 80km/h maximum limit (recorded 96km/h on highway)",
      priority: "High",
      address: "Delhi-Agra Expressway, Sector 62",
      lat: 28.5355,
      lng: 77.3910,
      speed: 96,
    },
    stoppage: {
      title: "Stationary Halt (>60s)",
      message: "Driver stopped for 3m 45s at unauthorized junction (>60s rule)",
      priority: "Medium",
      address: "Karol Bagh Intersection, New Delhi",
      lat: 28.6506,
      lng: 77.1906,
      speed: 0,
    },
    battery: {
      title: "Low Battery Warning",
      message: "GPS telematics unit battery level dropped below 12%",
      priority: "Medium",
      address: "Lodhi Road Regional Hub",
      lat: 28.5832,
      lng: 77.2274,
      speed: 42,
    },
    geofence: {
      title: "Geofence Exit Detected",
      message: "Vehicle exited designated delivery corridor Zone B",
      priority: "High",
      address: "Outer Ring Road, Pitampura",
      lat: 28.7041,
      lng: 77.1025,
      speed: 48,
    },
  };

  const handleTypeSelect = (typeKey) => {
    setAlertType(typeKey);
    const p = presets[typeKey];
    if (p) {
      setPriority(p.priority);
      if (!customMessage) {
        setCustomMessage(p.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const preset = presets[alertType] || presets.sos;
    const alertId = `ALT-${Date.now().toString().slice(-6)}`;

    const newAlert = {
      id: alertId,
      alertId,
      type: alertType,
      title: preset.title,
      message: customMessage.trim() || preset.message,
      priority,
      severity: priority.toLowerCase(),
      status: "Active",
      vehicleId,
      driverName,
      driverId: 103,
      speed: preset.speed,
      battery: 84,
      locationLat: preset.lat,
      locationLng: preset.lng,
      locationAddress: preset.address,
      createdAtIso: new Date().toISOString(),
    };

    try {
      // 1. Add to Firebase Firestore
      await addFirestoreAlert(newAlert);

      // 2. Also notify backend to broadcast FCM push notification
      try {
        await api.post("/alerts/test", newAlert);
      } catch (backendErr) {
        // Backend optional fallback
      }

      onSuccess(newAlert);
    } catch (error) {
      toast.error("Failed to trigger alert", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md" />

      <div className="relative w-full max-w-lg bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <MdAdd size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Trigger Real-Time Test Alert</h3>
                <span className="text-[11px] text-slate-400">Broadcasts via Firebase Firestore & Web Push</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800">
              <MdClose size={16} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4">
            {/* Alert Type Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Alert Incident Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: "sos", label: "🚨 SOS Emergency", priority: "Critical" },
                  { key: "speed", label: "⚡ Overspeeding", priority: "High" },
                  { key: "stoppage", label: "⏱️ Halt (>60s)", priority: "Medium" },
                  { key: "geofence", label: "📍 Geofence Exit", priority: "High" },
                  { key: "battery", label: "🔋 Low Battery", priority: "Medium" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTypeSelect(item.key)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      alertType === item.key
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-sm"
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle & Driver row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vehicle Unit
                </label>
                <input
                  type="text"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Priority Level
              </label>
              <div className="flex gap-2">
                {["Critical", "High", "Medium", "Low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      priority === p
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Description */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Custom Incident Note
              </label>
              <textarea
                rows="2"
                placeholder={presets[alertType]?.message || "Describe the incident..."}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#151D2C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 hover:bg-[#c49f2f] shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                <MdAdd size={16} />
              )}
              <span>Broadcast Real-Time Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
