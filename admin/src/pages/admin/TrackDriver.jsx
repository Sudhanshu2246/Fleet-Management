import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDriverById } from "../../Redux/Thunks/driver.thunks";
import { getDriverLiveTelemetry } from "../../Redux/Thunks/tracking.thunks";
import FleetLeafletMap from "../../components/map/FleetLeafletMap";
import GoogleMapFreeView from "../../components/map/GoogleMapFreeView";
import {
  MdChevronLeft,
  MdRefresh,
  MdPhone,
  MdEmail,
  MdDirectionsCar,
  MdSpeed,
  MdBatteryChargingFull,
  MdLocationOn,
  MdNavigation,
  MdOpenInNew,
  MdFiberManualRecord,
  MdShield,
  MdExplore,
  MdAccessTime,
  MdCheckCircle,
  MdWarning,
  MdArrowForward,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getGoogleMapsUrl, DEFAULT_MAP_CENTER } from "../../utils/mapUtils";

export default function TrackDriver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [driverData, setDriverData] = useState(null);
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mapLayer, setMapLayer] = useState("street");
  const [mapMode, setMapMode] = useState("google"); // 'google' | 'leaflet'
  const refreshIntervalRef = useRef(null);

  // Fetch driver live telemetry
  const fetchTelemetry = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await dispatch(getDriverById(id)).unwrap();
      const payload = res.data || res;
      setDriverData(payload);

      // Also query live Redis telemetry
      try {
        const liveRes = await dispatch(getDriverLiveTelemetry(id)).unwrap();
        if (liveRes?.data) {
          setLiveTelemetry(liveRes.data);
        }
      } catch (e) {
        // Fallback to driverData seamlessly
      }

      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) {
        toast.error("Failed to fetch live driver telemetry");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(false);
  }, [id, dispatch]);

  // Periodic polling when Auto-refresh is on
  useEffect(() => {
    if (isAutoRefreshing) {
      refreshIntervalRef.current = setInterval(() => {
        fetchTelemetry(true);
      }, 5000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [isAutoRefreshing, id]);

  const driverProfile = driverData?.Driver || {};
  const vehicle = driverProfile?.AssignedVehicle || {};
  const activeTrip = driverData?.activeTrip || null;

  const fullName = `${driverData?.firstName || ""} ${driverData?.lastName || ""}`.trim() || `Driver #${id}`;
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DR";

  const isLoggedIn = Boolean(driverProfile.isLoggedIn) || Boolean(liveTelemetry?.isOnline);
  const lastLocationDate = driverProfile.lastLocationUpdate ? new Date(driverProfile.lastLocationUpdate) : null;
  const isRecentlyActive = lastLocationDate && (Date.now() - lastLocationDate.getTime() < 120000); // 2 minutes

  const isCurrentlyStopped = Boolean(liveTelemetry?.isCurrentlyStopped);
  const currentStopDurationSeconds = liveTelemetry?.currentStopDurationSeconds || 0;

  // Coordinates: prioritize live Redis position
  const lat = liveTelemetry?.latitude !== undefined && liveTelemetry?.latitude !== null
    ? Number(liveTelemetry.latitude)
    : (driverProfile.currentLat !== null && driverProfile.currentLat !== undefined
      ? Number(driverProfile.currentLat)
      : (vehicle.locationLat || DEFAULT_MAP_CENTER[0]));

  const lng = liveTelemetry?.longitude !== undefined && liveTelemetry?.longitude !== null
    ? Number(liveTelemetry.longitude)
    : (driverProfile.currentLng !== null && driverProfile.currentLng !== undefined
      ? Number(driverProfile.currentLng)
      : (vehicle.locationLng || DEFAULT_MAP_CENTER[1]));

  const speed = isCurrentlyStopped
    ? 0
    : (liveTelemetry?.speed !== undefined && liveTelemetry?.speed !== null
      ? Math.round(liveTelemetry.speed)
      : (driverProfile.currentSpeed !== undefined && driverProfile.currentSpeed !== null
        ? Math.round(driverProfile.currentSpeed)
        : (vehicle.speed !== undefined ? Math.round(vehicle.speed) : 0)));

  const heading = liveTelemetry?.heading !== undefined && liveTelemetry?.heading !== null
    ? Number(liveTelemetry.heading)
    : (driverProfile.heading || 0);

  const battery = vehicle.battery !== undefined ? Math.round(vehicle.battery) : 85;
  const address = liveTelemetry?.locationAddress || driverProfile.locationAddress || vehicle.locationAddress || "Delhi NCR Regional Corridor";

  // Compass heading direction (e.g. N, NE, E, SE, S, SW, W, NW)
  const getCompassDirection = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  // Map item format for FleetLeafletMap
  const mapDriverItem = useMemo(() => {
    return {
      id: `drv-${id}`,
      userId: Number(id),
      name: fullName,
      phone: driverData?.phone || "—",
      email: driverData?.email || "—",
      avatar: initials,
      status: isLoggedIn ? "active" : "offline",
      vehicleId: driverProfile.vehicleAssignedId || vehicle.vehicleNumber || "Unassigned",
      vehicleName: vehicle.name || "Commercial Unit",
      vehicleType: vehicle.type || "truck",
      speed,
      battery,
      lat,
      lng,
      address,
      heading,
      lastSeen: lastLocationDate ? lastLocationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      tripId: activeTrip?.tripId || null,
      isLoggedIn,
    };
  }, [id, fullName, driverData, initials, isLoggedIn, driverProfile, vehicle, speed, battery, lat, lng, address, heading, lastLocationDate, activeTrip]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col px-4 sm:px-6 py-5">
      {/* ── Top Header Navigation ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <Link
              to="/dashboard/drivers"
              className="text-slate-400 hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-semibold"
            >
              <MdChevronLeft size={16} />
              Drivers Management
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#D4AF37] font-semibold">Live GPS Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{fullName}</span>
              {isLoggedIn ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live On App
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Logged Out
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Map Engine Toggle */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs shadow-lg">
            <button
              onClick={() => setMapMode("google")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mapMode === "google"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Google Maps (Free)
            </button>
            <button
              onClick={() => setMapMode("leaflet")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mapMode === "leaflet"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Fleet Leaflet
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400">Auto-Refresh:</span>
            <button
              onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                isAutoRefreshing
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isAutoRefreshing ? "5s ON" : "PAUSED"}
            </button>
          </div>

          <button
            onClick={() => fetchTelemetry(false)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <MdRefresh size={16} className={loading ? "animate-spin text-[#D4AF37]" : ""} />
            <span>Refresh</span>
          </button>

          <a
            href={getGoogleMapsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] transition-all"
          >
            <MdNavigation size={15} />
            <span>Google Maps</span>
            <MdOpenInNew size={12} />
          </a>
        </div>
      </div>

      {/* ── Main Tracking Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column: Live Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Stoppage Alert Banner if currently stopped */}
          {isCurrentlyStopped && (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-400">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">
                    Vehicle Stopped (&gt;60s Rule Active Detection)
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Vehicle has been stationary for{" "}
                    <span className="font-mono font-bold text-amber-400">
                      {Math.floor(currentStopDurationSeconds / 60)}m {currentStopDurationSeconds % 60}s
                    </span>
                    . Actively listening to stoppage duration until the trip resumes.
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                {Math.floor(currentStopDurationSeconds / 60)}m {currentStopDurationSeconds % 60}s
              </div>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#151D2C] shadow-2xl flex-1 min-h-[480px]">
            {mapMode === "google" ? (
              <GoogleMapFreeView
                lat={lat}
                lng={lng}
                driverName={fullName}
                vehicleNumber={vehicle.vehicleNumber || driverProfile.vehicleAssignedId || "Assigned Unit"}
                speed={speed}
                heading={heading}
                address={address}
                isCurrentlyStopped={isCurrentlyStopped}
                stopDurationSeconds={currentStopDurationSeconds}
                sourceLat={activeTrip?.sourceLat}
                sourceLng={activeTrip?.sourceLng}
                destLat={activeTrip?.destLat}
                destLng={activeTrip?.destLng}
                height="100%"
              />
            ) : (
              <>
                {/* Map Telemetry Floating Overlay */}
                <div className="absolute top-4 left-4 z-[500] flex items-center gap-2 bg-[#151D2C]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live GPS Lock</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </span>
                  </div>
                </div>

                {/* Embedded FleetLeafletMap */}
                <FleetLeafletMap
                  drivers={[mapDriverItem]}
                  selectedDriver={mapDriverItem}
                  height="100%"
                  minHeight="480px"
                  defaultLayer="googleStreets"
                  showLayerSwitcher={true}
                  disableDark={false}
                />
              </>
            )}
          </div>

          {/* Location Address Banner */}
          <div className="p-4 rounded-xl bg-[#151D2C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0 text-[#D4AF37]">
                <MdLocationOn size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Location</div>
                <div className="text-sm font-semibold text-white leading-snug mt-0.5">{address}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-center font-mono">
              <MdAccessTime size={14} className="text-[#D4AF37]" />
              <span>Pinged: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Telemetry & Details (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Real-time Telemetry Dashboard Card */}
          <div className="p-5 rounded-2xl bg-[#151D2C] border border-slate-800 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4 flex items-center gap-2">
              <MdSpeed size={16} /> Live Telemetry
            </h2>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Speedometer */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Speed</div>
                <div className="text-2xl font-black text-white font-mono mt-1">{speed}</div>
                <div className="text-[10px] text-slate-500 font-semibold">km / h</div>
              </div>

              {/* Heading */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Heading</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {getCompassDirection(heading)}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">{Math.round(heading)}°</div>
              </div>

              {/* Battery */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Battery</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{battery}%</div>
                <div className="text-[10px] text-emerald-500/80 font-semibold">Normal</div>
              </div>
            </div>
          </div>

          {/* Driver Information Card */}
          <div className="p-5 rounded-2xl bg-[#151D2C] border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-[#D4AF37]/20 shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-base font-bold text-white truncate">{fullName}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-[#D4AF37]">ID: {id}</span>
                  <span>•</span>
                  <span className="capitalize">{driverProfile.driverType || "Driver"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MdPhone size={13} className="text-[#D4AF37]" /> Phone
                </span>
                {driverData?.phone ? (
                  <a
                    href={`tel:${driverData.phone}`}
                    className="font-mono font-semibold text-white hover:text-[#D4AF37] transition-colors"
                  >
                    {driverData.phone}
                  </a>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MdEmail size={13} className="text-[#D4AF37]" /> Email
                </span>
                <span className="text-slate-200 truncate max-w-[180px]">{driverData?.email || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MdShield size={13} className="text-[#D4AF37]" /> License
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {driverProfile.licenseNumber || "—"} ({driverProfile.licenseType || "DL"})
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Vehicle Card */}
          <div className="p-5 rounded-2xl bg-[#151D2C] border border-slate-800 shadow-xl flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
              <MdDirectionsCar size={16} /> Assigned Vehicle
            </h3>

            {vehicle.id || driverProfile.vehicleAssignedId ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plate Number</span>
                  <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {vehicle.vehicleNumber || driverProfile.vehicleAssignedId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model / Name</span>
                  <span className="font-semibold text-slate-200">{vehicle.name || "Commercial Fleet Unit"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="capitalize font-semibold text-slate-200">{vehicle.type || "Truck"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {vehicle.status || "Active"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No vehicle currently assigned to this driver.
              </div>
            )}
          </div>

          {/* Active Trip Card if exists */}
          {activeTrip && (
            <div className="p-5 rounded-2xl bg-[#151D2C] border border-slate-800 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Active Trip</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {activeTrip.tripId}
                </span>
              </div>
              <div className="text-xs space-y-1.5 mt-1">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">From</div>
                  <div className="text-slate-200 truncate">{activeTrip.sourceAddress || "Warehouse Origin"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">To</div>
                  <div className="text-slate-200 truncate">{activeTrip.destAddress || "Destination Facility"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
