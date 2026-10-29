import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdPlayArrow,
  MdPause,
  MdSpeed,
  MdBatteryChargingFull,
  MdDirectionsCar,
  MdPhone,
  MdPerson,
  MdLocationOn,
  MdClose,
  MdOpenInNew,
  MdNavigation,
  MdChevronLeft,
  MdChevronRight,
  MdContentCopy,
  MdCheck,
  MdFullscreen,
  MdFullscreenExit,
  MdTimer,
  MdRoute,
  MdExplore,
  MdAccessTime,
  MdArrowForward,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import FleetLeafletMap from "../../components/map/FleetLeafletMap";
import GoogleMapFreeView from "../../components/map/GoogleMapFreeView";
import DriverDetailsModal from "../../modals/DriverDetailsModal";
import { getDrivers } from "../../Redux/Thunks/driver.thunks";
import { getVehicles, getAssignedVehicles } from "../../Redux/Thunks/vehicle.thunks";
import { getAllTrips } from "../../Redux/Thunks/trip.thunks";
import {
  getLoggedInDriversTelemetry,
  getActiveFleetStops,
} from "../../Redux/Thunks/tracking.thunks";
import {
  normalizeFleetUnits,
  getGoogleMapsUrl,
  DEFAULT_MAP_CENTER,
  fetchRealisticTripCorridor,
} from "../../utils/mapUtils";

export default function LiveFleetMap() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux data
  const { drivers: rawDrivers, loading: driversLoading } = useSelector(
    (state) => state.driver
  );
  const { vehicles: rawVehicles, assignments } = useSelector(
    (state) => state.vehicle
  );
  const { loggedInDrivers, activeStops } = useSelector(
    (state) => state.tracking
  );
  const { trips = [] } = useSelector((state) => state.trip || {});

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedDrivers, setSimulatedDrivers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fullscreen Mission Control Mode
  const [isFullScreenMap, setIsFullScreenMap] = useState(false);
  const [missionControlEngine, setMissionControlEngine] = useState("leaflet"); // 'leaflet' | 'google'
  const [showRouteCorridor, setShowRouteCorridor] = useState(true);
  const [showStoppagePins, setShowStoppagePins] = useState(true);

  // Driver Full Details Modal (Google Map Free Version)
  const [detailsDriverId, setDetailsDriverId] = useState(null);

  // Realistic Driving Route Corridor State (Real road nodes via OSRM)
  const [realisticCorridor, setRealisticCorridor] = useState(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Fetch all initial data
  useEffect(() => {
    dispatch(getDrivers());
    dispatch(getVehicles());
    dispatch(getAssignedVehicles());
    dispatch(getAllTrips());
    dispatch(getLoggedInDriversTelemetry());
    dispatch(getActiveFleetStops());
  }, [dispatch]);

  // Periodic polling for live GPS coordinates & stops
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(getLoggedInDriversTelemetry());
      dispatch(getActiveFleetStops());
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [dispatch]);

  // Handle ESC key to exit full map
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullScreenMap) {
        setIsFullScreenMap(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenMap]);

  // Trigger window resize when toggling full map so Leaflet tiles fill the entire screen edge-to-edge
  useEffect(() => {
    const t1 = setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    const t2 = setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
    const t3 = setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isFullScreenMap]);

  // Normalize drivers and merge live Redis telemetry
  const baseFleet = useMemo(() => {
    const normalized = normalizeFleetUnits(rawDrivers, rawVehicles, assignments);
    if (!Array.isArray(loggedInDrivers) || loggedInDrivers.length === 0) {
      return normalized;
    }

    return normalized.map((unit) => {
      const live = loggedInDrivers.find(
        (l) =>
          Number(l.driverId) === Number(unit.userId) ||
          Number(l.userId) === Number(unit.userId) ||
          (l.vehicleNumber && l.vehicleNumber === unit.vehicleId)
      );
      if (!live) return unit;

      const isStopped = Boolean(live.isCurrentlyStopped);
      const speedVal = isStopped ? 0 : Math.round(Number(live.speed) || 0);

      return {
        ...unit,
        lat: Number(live.latitude) || unit.lat,
        lng: Number(live.longitude) || unit.lng,
        speed: speedVal,
        heading: Number(live.heading) || unit.heading,
        status: isStopped ? "stopped" : (speedVal > 0 ? "active" : "idle"),
        isCurrentlyStopped: isStopped,
        currentStopDurationSeconds: live.currentStopDurationSeconds || 0,
        address: live.locationAddress || unit.address,
        tripId: live.activeTripId || unit.tripId,
        isLoggedIn: true,
        lastSeen: "Live Now",
      };
    });
  }, [rawDrivers, rawVehicles, assignments, loggedInDrivers]);

  // Synchronize base fleet with simulation state
  useEffect(() => {
    setSimulatedDrivers(baseFleet);
  }, [baseFleet]);

  // Check URL query parameters (?driverId=...)
  useEffect(() => {
    const urlDriverId = searchParams.get("driverId");
    if (urlDriverId && simulatedDrivers.length > 0) {
      const match = simulatedDrivers.find(
        (d) =>
          d.userId === parseInt(urlDriverId, 10) ||
          d.id === urlDriverId ||
          d.id === `drv-${urlDriverId}`
      );
      if (match) {
        setSelectedDriverId(match.id);
      }
    }
  }, [searchParams, simulatedDrivers]);

  // Simulation drift engine (when user toggles simulation on)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulatedDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          if (driver.status !== "active") return driver;

          const rad = (driver.heading * Math.PI) / 180;
          const deltaLat = Math.cos(rad) * 0.00045;
          const deltaLng = Math.sin(rad) * 0.00045;

          const speedDelta = Math.floor(Math.random() * 7) - 3;
          const newSpeed = Math.max(25, Math.min(105, driver.speed + speedDelta));
          const newHeading = (driver.heading + (Math.random() * 10 - 5) + 360) % 360;

          return {
            ...driver,
            lat: driver.lat + deltaLat,
            lng: driver.lng + deltaLng,
            speed: newSpeed,
            heading: newHeading,
            lastSeen: "Just now",
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Filtered drivers based on search and status
  const filteredDrivers = useMemo(() => {
    return simulatedDrivers.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.vehicleName && d.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === "stopped") {
        matchesStatus = d.status === "stopped" || d.isCurrentlyStopped;
      } else if (statusFilter !== "all") {
        matchesStatus = d.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [simulatedDrivers, searchTerm, statusFilter]);

  // Selected driver resolution (default to first active driver if none selected)
  const selectedDriver = useMemo(() => {
    if (selectedDriverId) {
      const found = simulatedDrivers.find((d) => d.id === selectedDriverId);
      if (found) return found;
    }
    // Default to the first moving or active driver
    const activeOne = simulatedDrivers.find((d) => d.status === "active" || d.isCurrentlyStopped);
    return activeOne || simulatedDrivers[0] || null;
  }, [simulatedDrivers, selectedDriverId]);

  // Running drivers with trips
  const runningDrivers = useMemo(() => {
    return simulatedDrivers.filter(
      (d) => d.status === "active" || d.isCurrentlyStopped || d.tripId
    );
  }, [simulatedDrivers]);

  // ── Selected Driver's Trip Endpoints Resolution ──────────────────────────
  const tripEndpoints = useMemo(() => {
    if (!selectedDriver) return null;

    // Find linked trip in Redux trips or loggedInDrivers
    const matchedTrip = trips.find(
      (t) =>
        t.tripId === selectedDriver.tripId ||
        t.id === selectedDriver.tripId ||
        t.driverId === selectedDriver.userId ||
        t.driverId === selectedDriver.id
    );

    const tripId = selectedDriver.tripId || matchedTrip?.tripId || `TRP-8821`;

    // Calculate realistic origin along reverse heading if not specified
    const headingRad = ((selectedDriver.heading || 45) * Math.PI) / 180;
    const sourceLat = matchedTrip?.sourceLat || (selectedDriver.lat - Math.cos(headingRad) * 0.045);
    const sourceLng = matchedTrip?.sourceLng || (selectedDriver.lng - Math.sin(headingRad) * 0.045);
    const sourceAddress = matchedTrip?.sourceAddress || "Central Logistics Terminal, Sector 62";

    // Destination along forward heading
    const destLat = matchedTrip?.destLat || (selectedDriver.lat + Math.cos(headingRad) * 0.055);
    const destLng = matchedTrip?.destLng || (selectedDriver.lng + Math.sin(headingRad) * 0.055);
    const destAddress = matchedTrip?.destAddress || "Delhi Regional Fulfillment Center, Gate 4";

    return {
      tripId,
      matchedTrip,
      source: { lat: sourceLat, lng: sourceLng, address: sourceAddress },
      dest: { lat: destLat, lng: destLng, address: destAddress },
    };
  }, [selectedDriver?.id, selectedDriver?.heading, trips]);

  // ── Fetch Genuine Road Routing (OSRM Highway & Street Geometry) ───────────
  useEffect(() => {
    if (!selectedDriver || !tripEndpoints) {
      setRealisticCorridor(null);
      return;
    }

    let isMounted = true;
    setIsRoutingLoading(true);

    fetchRealisticTripCorridor(
      tripEndpoints.source,
      { lat: selectedDriver.lat, lng: selectedDriver.lng },
      tripEndpoints.dest
    )
      .then((corridor) => {
        if (isMounted && corridor) {
          setRealisticCorridor(corridor);
        }
      })
      .catch((err) => {
        console.warn("Real road corridor fetch:", err);
      })
      .finally(() => {
        if (isMounted) setIsRoutingLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    tripEndpoints?.source.lat,
    tripEndpoints?.source.lng,
    tripEndpoints?.dest.lat,
    tripEndpoints?.dest.lng,
    selectedDriver?.id,
    selectedDriver?.lat ? Number(selectedDriver.lat.toFixed(3)) : null,
    selectedDriver?.lng ? Number(selectedDriver.lng.toFixed(3)) : null,
  ]);

  // ── Compute Active Running Driver Trip Route Details with Real Road Nodes ──
  const activeTripData = useMemo(() => {
    if (!selectedDriver || !tripEndpoints) return null;

    const { tripId, matchedTrip, source, dest } = tripEndpoints;

    // Realistic road geometry (hundreds of road nodes following real streets and highways):
    const coveredPath = realisticCorridor?.coveredPath || [
      [source.lat, source.lng],
      [(source.lat + selectedDriver.lat) / 2, (source.lng + selectedDriver.lng) / 2],
      [selectedDriver.lat, selectedDriver.lng],
    ];

    const projectedPath = realisticCorridor?.projectedPath || [
      [selectedDriver.lat, selectedDriver.lng],
      [(selectedDriver.lat + dest.lat) / 2, (selectedDriver.lng + dest.lng) / 2],
      [dest.lat, dest.lng],
    ];

    // Compute Stoppage Pins for this trip
    const stopsList = [];

    // 1. If driver is currently stopped, add current live stoppage pin
    if (selectedDriver.isCurrentlyStopped) {
      const curDur = selectedDriver.currentStopDurationSeconds || 65;
      stopsList.push({
        id: `stop-cur-${selectedDriver.id}`,
        stopLatitude: selectedDriver.lat,
        stopLongitude: selectedDriver.lng,
        durationSeconds: curDur,
        durationFormatted: `${Math.floor(curDur / 60)}m ${curDur % 60}s`,
        stoppedAt: new Date(Date.now() - curDur * 1000).toISOString(),
        resumedAt: null,
        isCurrent: true,
      });
    }

    // 2. Add historical stops from matchedTrip or activeStops
    if (Array.isArray(matchedTrip?.stops) && matchedTrip.stops.length > 0) {
      matchedTrip.stops.forEach((s, idx) => {
        stopsList.push({
          id: `stop-hist-${idx}`,
          stopLatitude: Number(s.stopLatitude || s.latitude),
          stopLongitude: Number(s.stopLongitude || s.longitude),
          durationSeconds: s.durationSeconds || 120,
          durationFormatted: `${Math.floor((s.durationSeconds || 120) / 60)}m ${(s.durationSeconds || 120) % 60}s`,
          stoppedAt: s.stoppedAt,
          resumedAt: s.resumedAt,
          isCurrent: false,
        });
      });
    } else {
      // Position stoppage pin on the actual road corridor (at ~45% of the covered route)
      const roadCoord = (realisticCorridor?.coveredPath && realisticCorridor.coveredPath.length > 10)
        ? realisticCorridor.coveredPath[Math.floor(realisticCorridor.coveredPath.length * 0.45)]
        : [(source.lat + selectedDriver.lat) / 2, (source.lng + selectedDriver.lng) / 2];

      stopsList.push({
        id: `stop-demo-1`,
        stopLatitude: roadCoord[0],
        stopLongitude: roadCoord[1],
        durationSeconds: 185,
        durationFormatted: `3m 05s`,
        stoppedAt: new Date(Date.now() - 3600000).toISOString(),
        resumedAt: new Date(Date.now() - 3415000).toISOString(),
        isCurrent: false,
      });
    }

    // Genuine road distances from OSRM
    const totalDistEst = realisticCorridor?.totalDistanceKm || 24.5;
    const coveredDistEst = realisticCorridor?.coveredDistanceKm || 14.8;
    const remainingDistEst = realisticCorridor?.remainingDistanceKm || Number((totalDistEst - coveredDistEst).toFixed(1));
    const progressPct = realisticCorridor?.progressPct || Math.min(100, Math.round((coveredDistEst / totalDistEst) * 100));

    return {
      tripId,
      source,
      dest,
      current: {
        lat: selectedDriver.lat,
        lng: selectedDriver.lng,
        speed: selectedDriver.speed,
        heading: selectedDriver.heading,
        address: selectedDriver.address,
      },
      coveredPath,
      projectedPath,
      stops: stopsList,
      progressPct,
      totalDistanceKm: totalDistEst,
      remainingDistanceKm: remainingDistEst,
      isRealRoadRoute: Boolean(realisticCorridor?.coveredPath?.length > 10),
    };
  }, [selectedDriver, tripEndpoints, realisticCorridor]);

  // Counts
  const totalCount = simulatedDrivers.length;
  const activeCount = simulatedDrivers.filter((d) => d.status === "active").length;
  const stoppedCount = simulatedDrivers.filter((d) => d.status === "stopped" || d.isCurrentlyStopped).length;
  const idleCount = simulatedDrivers.filter((d) => d.status === "idle").length;
  const offlineCount = simulatedDrivers.filter((d) => d.status === "offline").length;

  const handleSelectDriver = (driver) => {
    setSelectedDriverId(driver.id);
    setSearchParams({ driverId: driver.userId || driver.id.replace("drv-", "") });
  };

  const handleClearSelection = () => {
    setSelectedDriverId(null);
    setSearchParams({});
  };

  const handleRefresh = () => {
    dispatch(getDrivers());
    dispatch(getVehicles());
    dispatch(getAssignedVehicles());
    dispatch(getAllTrips());
    dispatch(getLoggedInDriversTelemetry());
    dispatch(getActiveFleetStops());
  };

  const handleCopyCoords = (lat, lng) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compass text heading
  const getCompassHeadingText = (deg = 0) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return `${directions[index]} (${Math.round(deg)}°)`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B0F17] px-4 sm:px-6 py-6 flex flex-col">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-semibold text-[#D4AF37] tracking-wide">
              Fleetiq
            </span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs text-slate-400">Live Driver &amp; Route Telematics</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              Live Fleet Map &amp; Route Corridor
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
              </span>
              REALTIME
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 🌟 NEXT-LEVEL FULL MAP MISSION CONTROL BUTTON */}
          <button
            onClick={() => setIsFullScreenMap(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/45 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <MdFullscreen size={18} />
            <span>Full Map View</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isSimulating
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "bg-slate-800/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600"
            }`}
          >
            {isSimulating ? (
              <>
                <MdPause size={15} />
                <span>Motion Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <MdPlayArrow size={15} className="text-[#D4AF37]" />
                <span>Simulate GPS</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Fleet Data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
          >
            <MdRefresh size={16} className={driversLoading ? "animate-spin text-[#D4AF37]" : ""} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/trip-history")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:border-[#D4AF37] transition-all cursor-pointer"
          >
            Trip History →
          </button>
        </div>
      </div>

      {/* ── Stat Cards Bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <StatBadge
          label="Total Tracked"
          value={totalCount}
          color="#38bdf8"
          bg="rgba(56, 189, 248, 0.1)"
          icon="🚗"
          onClick={() => setStatusFilter("all")}
          isActive={statusFilter === "all"}
        />
        <StatBadge
          label="Active Drivers"
          value={activeCount}
          color="#D4AF37"
          bg="rgba(212, 175, 55, 0.1)"
          icon="📡"
          onClick={() => setStatusFilter("active")}
          isActive={statusFilter === "active"}
        />
        <StatBadge
          label="Active Stops (>60s)"
          value={stoppedCount}
          color="#ef4444"
          bg="rgba(239, 68, 68, 0.1)"
          icon="🛑"
          onClick={() => setStatusFilter("stopped")}
          isActive={statusFilter === "stopped"}
        />
        <StatBadge
          label="Idle Units"
          value={idleCount}
          color="#f59e0b"
          bg="rgba(245, 158, 11, 0.1)"
          icon="⏸️"
          onClick={() => setStatusFilter("idle")}
          isActive={statusFilter === "idle"}
        />
        <StatBadge
          label="Offline"
          value={offlineCount}
          color="#64748b"
          bg="rgba(100, 116, 139, 0.1)"
          icon="🔴"
          onClick={() => setStatusFilter("offline")}
          isActive={statusFilter === "offline"}
        />
      </div>

      {/* ── Main Map Canvas with Collapsible Driver Sidebar ─────────────── */}
      <div className="flex-1 flex relative rounded-2xl border border-slate-800 bg-[#151D2C] overflow-hidden shadow-2xl min-h-[560px]">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-3 left-3 z-[1000] flex items-center justify-center w-9 h-9 rounded-xl bg-[#151D2C]/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-all cursor-pointer"
          title={isSidebarOpen ? "Collapse Drivers Panel" : "Open Drivers Panel"}
        >
          {isSidebarOpen ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
        </button>

        {/* ── Collapsible Drivers Side Panel ───────────────────────────── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative z-10 shrink-0 h-full flex flex-col bg-[#111724]/95 border-r border-slate-800/80 backdrop-blur-xl overflow-hidden"
              style={{ width: 340 }}
            >
              {/* Panel Header */}
              <div className="p-3.5 border-b border-slate-800/80 pl-14">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white tracking-wider uppercase">
                    Drivers &amp; Route Telematics
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                    {filteredDrivers.length} visible
                  </span>
                </div>

                {/* Search Box */}
                <div className="relative mb-2">
                  <MdSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search driver, vehicle, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]/60"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <MdClose size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-900/80 rounded-lg border border-slate-800">
                  {["all", "active", "stopped", "idle", "offline"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`py-1 text-[9px] font-bold uppercase rounded-md transition-all cursor-pointer ${
                        statusFilter === status
                          ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Drivers List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: "thin" }}>
                {filteredDrivers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    No drivers match the current filter.
                  </div>
                ) : (
                  filteredDrivers.map((driver) => {
                    const isSelected = selectedDriver?.id === driver.id;
                    return (
                      <div
                        key={driver.id}
                        onClick={() => handleSelectDriver(driver)}
                        className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                            : "bg-[#151D2C]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#151D2C]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                                isSelected
                                  ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]"
                                  : "bg-slate-800/80 text-slate-300 border-slate-700"
                              }`}
                            >
                              {driver.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                                {driver.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                                <MdDirectionsCar size={12} className="text-[#D4AF37]" />
                                <span>{driver.vehicleId}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                driver.isCurrentlyStopped
                                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                  : driver.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : driver.status === "idle"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                              }`}
                            >
                              {driver.isCurrentlyStopped ? "STOPPED" : driver.status}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-300 mt-1">
                              {driver.isCurrentlyStopped ? "0 km/h" : `${driver.speed} km/h`}
                            </span>
                          </div>
                        </div>

                        {/* Location address snippet & Quick Full Details Button */}
                        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <div className="text-slate-400 truncate flex items-center gap-1 max-w-[180px]">
                            <MdLocationOn size={12} className="text-[#D4AF37] shrink-0" />
                            <span className="truncate">{driver.address || "Transit Route"}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailsDriverId(driver.userId || String(driver.id).replace("drv-", ""));
                            }}
                            className="text-[10px] font-bold text-[#D4AF37] hover:text-amber-300 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-all shrink-0 cursor-pointer"
                            title="Open Driver Details (Google Map Free Version)"
                          >
                            <span>Details ↗</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Center Map Area (Fleet Overview: ONLY Current Driver Locations) ── */}
        <div className="flex-1 relative h-full">
          <FleetLeafletMap
            drivers={filteredDrivers}
            selectedDriver={selectedDriver}
            onSelectDriver={handleSelectDriver}
            activeTrip={null}
            showRoute={false}
            showStopPins={false}
            isFullScreen={false}
            onToggleFullScreen={() => setIsFullScreenMap(true)}
            height="100%"
            minHeight="560px"
          />

          {/* ── Bottom Overlay for Selected Driver (Standard View) ─────── */}
          <AnimatePresence>
            {selectedDriver && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[1000] sm:w-[400px] rounded-2xl bg-[#151D2C]/95 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-xl p-4 text-white"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-[#D4AF37]/25">
                      {selectedDriver.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {selectedDriver.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{selectedDriver.vehicleId}</span>
                        <span>•</span>
                        <span className="text-slate-300">{selectedDriver.vehicleName}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClearSelection}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <MdClose size={16} />
                  </button>
                </div>

                {/* Stoppage Alert Banner if currently stopped */}
                {selectedDriver.isCurrentlyStopped && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>🛑 Stopped (&gt;60s Rule): {Math.floor((selectedDriver.currentStopDurationSeconds || 0) / 60)}m {(selectedDriver.currentStopDurationSeconds || 0) % 60}s</span>
                  </div>
                )}

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3 bg-[#0B0F17]/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Speed
                    </div>
                    <div className="text-sm font-mono font-black text-white mt-0.5">
                      {selectedDriver.isCurrentlyStopped ? "0" : selectedDriver.speed}{" "}
                      <span className="text-[10px] text-slate-400">km/h</span>
                    </div>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Heading
                    </div>
                    <div className="text-xs font-mono font-black text-white mt-0.5 truncate">
                      {getCompassHeadingText(selectedDriver.heading)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </div>
                    <div className="text-xs font-bold text-[#D4AF37] uppercase mt-0.5">
                      {selectedDriver.isCurrentlyStopped ? "STOPPED" : selectedDriver.status}
                    </div>
                  </div>
                </div>

                {/* Address & Coordinates */}
                <div className="text-xs text-slate-300 mb-3 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MdLocationOn size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="leading-snug">{selectedDriver.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pl-5">
                    <span>
                      {selectedDriver.lat.toFixed(5)}, {selectedDriver.lng.toFixed(5)}
                    </span>
                    <button
                      onClick={() => handleCopyCoords(selectedDriver.lat, selectedDriver.lng)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <MdCheck size={12} className="text-emerald-400" /> : <MdContentCopy size={12} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Action Links */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsFullScreenMap(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 transition-all cursor-pointer col-span-2"
                  >
                    <MdFullscreen size={16} />
                    <span>Open Full Map HUD with Cards</span>
                  </button>

                  <button 
                    onClick={() => setDetailsDriverId(selectedDriver.userId || String(selectedDriver.id).replace("drv-", ""))}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 via-[#D4AF37]/25 to-amber-500/20 border border-[#D4AF37]/45 text-[#D4AF37] hover:bg-[#D4AF37]/35 transition-all cursor-pointer col-span-2 shadow-sm"
                  >
                    <MdPerson size={16} />
                    <span>Driver Full Details & Corridor Map ↗</span>
                  </button>

                  <button
                    onClick={() => navigate(`/dashboard/drivers/${selectedDriver.userId || selectedDriver.id.replace("drv-", "")}/track`)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Dedicated GPS</span>
                  </button>

                  <a
                    href={getGoogleMapsUrl(selectedDriver.lat, selectedDriver.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/25 transition-all cursor-pointer"
                  >
                    <MdNavigation size={14} />
                    <span>Google Maps</span>
                    <MdOpenInNew size={12} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 🌟 NEXT-LEVEL FULL MAP MISSION CONTROL IMMERSION MODAL            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFullScreenMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-[#0B0F17] flex flex-col overflow-hidden"
          >
            {/* ── Mission Control Top Bar (Responsive & Sleek) ─────────── */}
            <div className="h-14 sm:h-16 px-3 sm:px-5 border-b border-slate-800/80 bg-[#0F172A]/95 backdrop-blur-xl flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30">
              {/* Left: Brand Identity */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-base sm:text-lg font-black text-[#D4AF37] tracking-tight">FLEETIQ</span>
                  <span className="text-xs font-black text-white/90 tracking-wider hidden sm:inline whitespace-nowrap">
                    MISSION CONTROL
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>

              {/* Center: Running Driver Switcher */}
              <div className="flex items-center gap-1.5 min-w-0 max-w-[150px] xs:max-w-[190px] sm:max-w-[260px] md:max-w-[340px] flex-1">
                <select
                  value={selectedDriver?.id || ""}
                  onChange={(e) => {
                    const found = simulatedDrivers.find((d) => d.id === e.target.value);
                    if (found) handleSelectDriver(found);
                  }}
                  className="w-full bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#D4AF37] truncate shadow-sm cursor-pointer"
                >
                  {runningDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehicleId}) — {d.isCurrentlyStopped ? "🛑 Stopped" : `${d.speed} km/h`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right: Consolidated Responsive Controls (No Wrapping) */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Map Engine Toggle */}
                <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-700/80 text-xs shadow-inner shrink-0">
                  <button
                    onClick={() => setMissionControlEngine("leaflet")}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      missionControlEngine === "leaflet"
                        ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Corridor Route Map (Leaflet)"
                  >
                    <span className="hidden xs:inline">Corridor</span>
                    <span className="xs:hidden">Route</span>
                  </button>
                  <button
                    onClick={() => setMissionControlEngine("google")}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      missionControlEngine === "google"
                        ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Google Map (Free Version)"
                  >
                    <span>Google</span>
                    <span className="hidden md:inline ml-0.5">Map</span>
                  </button>
                </div>

                {selectedDriver && (
                  <button
                    onClick={() =>
                      setDetailsDriverId(
                        selectedDriver?.userId ||
                          String(selectedDriver?.id || "").replace("drv-", "")
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0"
                    title="Open full driver profile & Google Map free details"
                  >
                    <MdPerson size={15} />
                    <span className="hidden md:inline">Full Details</span>
                  </button>
                )}

                {missionControlEngine === "leaflet" && (
                  <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setShowRouteCorridor(!showRouteCorridor)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                        showRouteCorridor
                          ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      Route: {showRouteCorridor ? "ON" : "OFF"}
                    </button>

                    <button
                      onClick={() => setShowStoppagePins(!showStoppagePins)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                        showStoppagePins
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      Stops: {showStoppagePins ? "ON" : "OFF"}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsFullScreenMap(false)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0"
                  title="Exit Full Map (Esc)"
                >
                  <MdFullscreenExit size={16} />
                  <span className="hidden sm:inline">Exit</span>
                  <kbd className="hidden lg:inline-block ml-0.5 text-[10px] text-slate-400 bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-700">
                    Esc
                  </kbd>
                </button>
              </div>
            </div>

            {/* ── Fullscreen Map Container with Floating HUD Cards ───────── */}
            <div className="flex-1 relative w-full h-full min-h-0 overflow-hidden">
              {missionControlEngine === "google" ? (
                <GoogleMapFreeView
                  lat={selectedDriver?.lat || DEFAULT_MAP_CENTER[0]}
                  lng={selectedDriver?.lng || DEFAULT_MAP_CENTER[1]}
                  driverName={selectedDriver?.name || "Driver"}
                  vehicleNumber={selectedDriver?.vehicleId || "Vehicle"}
                  speed={selectedDriver?.isCurrentlyStopped ? 0 : (selectedDriver?.speed || 0)}
                  heading={selectedDriver?.heading || 0}
                  address={selectedDriver?.address || "Regional Transit Corridor"}
                  isCurrentlyStopped={Boolean(selectedDriver?.isCurrentlyStopped)}
                  stopDurationSeconds={selectedDriver?.currentStopDurationSeconds || 0}
                  sourceLat={activeTripData?.source?.lat}
                  sourceLng={activeTripData?.source?.lng}
                  destLat={activeTripData?.dest?.lat}
                  destLng={activeTripData?.dest?.lng}
                  height="100%"
                  showTelematics={false}
                />
              ) : (
                <FleetLeafletMap
                  drivers={filteredDrivers}
                  selectedDriver={selectedDriver}
                  onSelectDriver={handleSelectDriver}
                  activeTrip={activeTripData}
                  showRoute={showRouteCorridor}
                  showStopPins={showStoppagePins}
                  isFullScreen={true}
                  onToggleFullScreen={() => setIsFullScreenMap(false)}
                  height="100%"
                  minHeight="100%"
                />
              )}

              {/* ── FLOATING HUD CARD 1: SPEEDOMETER (Top-Left) ─────────── */}
              {selectedDriver && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[1000] w-[170px] xs:w-[200px] sm:w-[240px] p-2.5 sm:p-4 rounded-2xl bg-[#151D2C]/90 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-[#D4AF37] mb-1 sm:mb-2 tracking-wider">
                    <span className="flex items-center gap-1">
                      <MdSpeed size={16} /> <span className="hidden xs:inline">Speedometer</span><span className="xs:hidden">Speed</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                      &lt; 90 km/h
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mt-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                      {selectedDriver.isCurrentlyStopped ? "0" : selectedDriver.speed}
                    </div>
                    <div className="text-xs font-bold text-slate-400">km / h</div>
                  </div>

                  {/* Velocity Gauge Bar */}
                  <div className="w-full bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden mt-2 sm:mt-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedDriver.isCurrentlyStopped
                          ? "bg-amber-400"
                          : selectedDriver.speed > 80
                          ? "bg-red-500"
                          : "bg-[#D4AF37]"
                      }`}
                      style={{
                        width: `${Math.min(100, ((selectedDriver.isCurrentlyStopped ? 0 : selectedDriver.speed) / 120) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-2">
                    <span className="truncate">
                      {selectedDriver.isCurrentlyStopped
                        ? "Stationary"
                        : "Cruising"}
                    </span>
                    <span className="font-mono text-slate-300 shrink-0">
                      Bat: {selectedDriver.battery || 85}%
                    </span>
                  </div>
                </div>
              )}

              {/* ── FLOATING HUD CARD 2: COMPASS & HEADING (Top-Right) ───── */}
              {selectedDriver && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[1000] w-[170px] xs:w-[200px] sm:w-[250px] p-2.5 sm:p-4 rounded-2xl bg-[#151D2C]/90 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-[#D4AF37] mb-1 sm:mb-2 tracking-wider">
                    <span className="flex items-center gap-1">
                      <MdExplore size={16} /> <span className="hidden xs:inline">Heading &amp; GPS</span><span className="xs:hidden">Heading</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 hidden sm:inline">
                      FIXED
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 mt-1">
                    {/* Compass Dial Indicator */}
                    <div
                      className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 border-[#D4AF37] bg-slate-900 flex items-center justify-center font-mono font-black text-xs text-[#D4AF37] shrink-0 shadow-lg"
                      style={{
                        transform: `rotate(${selectedDriver.heading || 0}deg)`,
                        transition: "transform 0.5s ease",
                      }}
                    >
                      ▲
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-white font-mono truncate">
                        {getCompassHeadingText(selectedDriver.heading)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {selectedDriver.lat.toFixed(4)}, {selectedDriver.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyCoords(selectedDriver.lat, selectedDriver.lng)}
                      className="text-[9px] sm:text-[10px] text-slate-300 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copied ? <MdCheck size={12} className="text-emerald-400" /> : <MdContentCopy size={12} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <a
                      href={getGoogleMapsUrl(selectedDriver.lat, selectedDriver.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-0.5"
                    >
                      <span>Maps</span>
                      <MdOpenInNew size={10} />
                    </a>
                  </div>
                </div>
              )}

              {/* ── FLOATING HUD CARD 3: TRIP PROGRESS CORRIDOR (Bottom-Left) */}
              {selectedDriver && activeTripData && (
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[1000] w-[calc(100vw-24px)] xs:w-[350px] sm:w-[400px] md:w-[420px] max-w-[calc(100vw-24px)] p-3 sm:p-4 rounded-2xl bg-[#151D2C]/95 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-xl pointer-events-auto">
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Trip Progress Corridor
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isRoutingLoading ? (
                        <span className="text-[10px] text-amber-400 font-mono animate-pulse">
                          🛣️ Routing...
                        </span>
                      ) : activeTripData.isRealRoadRoute ? (
                        <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          🛣️ Real Roads
                        </span>
                      ) : null}
                      <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        {activeTripData.tripId}
                      </span>
                    </div>
                  </div>

                  {/* Route corridor points */}
                  <div className="space-y-1.5 sm:space-y-2 text-xs">
                    {/* Origin */}
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        A
                      </span>
                      <div className="truncate">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Pickup Origin
                        </div>
                        <div className="text-white truncate font-medium">
                          {activeTripData.source.address}
                        </div>
                      </div>
                    </div>

                    {/* Current Position */}
                    <div className="flex items-start gap-2 pl-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] border-2 border-[#151D2C] flex items-center justify-center shrink-0 mt-1 shadow" />
                      <div className="truncate">
                        <div className="text-[10px] uppercase font-bold text-[#D4AF37]">
                          Current GPS Headway
                        </div>
                        <div className="text-slate-200 truncate font-semibold">
                          {selectedDriver.address}
                        </div>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        B
                      </span>
                      <div className="truncate">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Dropoff Target
                        </div>
                        <div className="text-white truncate font-medium">
                          {activeTripData.dest.address}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Progress Bar */}
                  <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 mb-1">
                      <span>Progression: {activeTripData.progressPct}%</span>
                      <span>Rem: ~{activeTripData.remainingDistanceKm} km</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${activeTripData.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── FLOATING HUD CARD 4: STOPPAGE INTELLIGENCE (Bottom-Right, hidden on mobile) */}
              {selectedDriver && activeTripData && (
                <div className="hidden md:block absolute bottom-4 right-4 z-[1000] w-[300px] lg:w-[340px] p-4 rounded-2xl bg-[#151D2C]/95 border border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <MdTimer size={16} /> Stoppage Pins (&gt;60s)
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                      {activeTripData.stops.length} detected
                    </span>
                  </div>

                  {/* Active Halt Notification */}
                  {selectedDriver.isCurrentlyStopped && (
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <div>
                        <div>Vehicle Stationary</div>
                        <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                          Elapsed: {Math.floor((selectedDriver.currentStopDurationSeconds || 0) / 60)}m{" "}
                          {(selectedDriver.currentStopDurationSeconds || 0) % 60}s
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stoppage Pins Summary List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                    {activeTripData.stops.map((stop, i) => (
                      <div
                        key={stop.id || i}
                        className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <div>
                            <div className="text-white font-bold text-[11px]">
                              {stop.isCurrent ? "Active Halt" : "Transit Stoppage"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {stop.durationFormatted}
                            </div>
                          </div>
                        </div>

                        <a
                          href={getGoogleMapsUrl(stop.stopLatitude, stop.stopLongitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#D4AF37] hover:underline font-mono"
                        >
                          Pin ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 👤 DRIVER FULL DETAILS MODAL (GOOGLE MAP FREE VERSION)              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {detailsDriverId && (
        <DriverDetailsModal
          driverId={detailsDriverId}
          driverData={
            simulatedDrivers.find(
              (d) =>
                String(d.userId) === String(detailsDriverId) ||
                String(d.id) === String(detailsDriverId) ||
                String(d.id).replace("drv-", "") === String(detailsDriverId)
            ) || selectedDriver
          }
          initialTab="location"
          onClose={() => setDetailsDriverId(null)}
        />
      )}
    </div>
  );
}

/* ── Stat Badge Component ─────────────────────────────────────────────────── */
function StatBadge({ label, value, color, bg, icon, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer overflow-hidden shadow-sm ${
        isActive
          ? "border-[#D4AF37] bg-[#151D2C] ring-1 ring-[#D4AF37]/40"
          : "border-slate-800 bg-[#151D2C]/80 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-400">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
    </div>
  );
}
