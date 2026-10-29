import React, { useState } from "react";
import {
  MdNavigation,
  MdOpenInNew,
  MdSpeed,
  MdExplore,
  MdLocationOn,
  MdFullscreen,
  MdFullscreenExit,
  MdLayers,
  MdRefresh,
} from "react-icons/md";
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsEmbedUrl,
  getGoogleMapsUrl,
  DEFAULT_MAP_CENTER,
} from "../../utils/mapUtils";

/**
 * GoogleMapFreeView
 * ─────────────────────────────────────────────────────────────────────────────
 * 100% Free Version of Google Maps (No API Key, No Billing, No Watermarks).
 * Uses Google's official responsive embed interface with street labels,
 * satellite imagery, turn-by-turn directions, and live telematics overlay.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function GoogleMapFreeView({
  lat = DEFAULT_MAP_CENTER[0],
  lng = DEFAULT_MAP_CENTER[1],
  driverName = "Fleet Driver",
  vehicleNumber = "Vehicle Unit",
  speed = 0,
  heading = 0,
  address = "Regional Transit Corridor",
  isCurrentlyStopped = false,
  stopDurationSeconds = 0,
  sourceLat = null,
  sourceLng = null,
  destLat = null,
  destLng = null,
  height = "460px",
  showTelematics = true,
  className = "",
}) {
  const [mapType, setMapType] = useState("m"); // 'm' = Roadmap, 'k' = Satellite, 'h' = Hybrid
  const [zoomLevel, setZoomLevel] = useState(15);
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Generate Google Maps Free URL
  const embedUrl = isDirectionsMode && sourceLat && sourceLng && destLat && destLng
    ? getGoogleMapsDirectionsEmbedUrl(sourceLat, sourceLng, destLat, destLng)
    : getGoogleMapsEmbedUrl(lat, lng, zoomLevel, mapType);

  const getCompassHeading = (deg = 0) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return `${directions[index]} (${Math.round(deg)}°)`;
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0F17] shadow-2xl flex flex-col ${
        isFullScreen ? "fixed inset-0 z-[1300] h-screen rounded-none" : ""
      } ${className}`}
      style={{ height: isFullScreen ? "100vh" : height }}
    >
      {/* ── Top Bar Overlay ────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Google Maps Free Version Branding & Live Tag */}
        <div className="flex items-center gap-2 bg-[#151D2C]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
              Google Maps • Free Version
            </span>
            <span className="text-xs font-mono font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
              {driverName} ({vehicleNumber})
            </span>
          </div>
        </div>

        {/* Right: Map Style Toggles & Actions */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-[#151D2C]/90 backdrop-blur-md rounded-xl p-1 border border-slate-700 shadow-xl">
            <button
              onClick={() => setMapType("m")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === "m"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapType("k")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === "k"
                  ? "bg-[#D4AF37] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Satellite
            </button>
            {sourceLat && destLat && (
              <button
                onClick={() => setIsDirectionsMode(!isDirectionsMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDirectionsMode
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Route Path
              </button>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Full Map Mode"}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#151D2C]/90 text-slate-200 hover:text-white border border-slate-700 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          >
            {isFullScreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
          </button>

          {/* Open in Native App */}
          <a
            href={getGoogleMapsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Official Google Maps"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          >
            <MdNavigation size={14} />
            <span className="hidden sm:inline">Google Maps</span>
            <MdOpenInNew size={11} />
          </a>
        </div>
      </div>

      {/* ── Interactive Google Maps Free Embed Iframe ────────────────────── */}
      <div className="flex-1 w-full h-full min-h-0 bg-[#0B0F17]">
        <iframe
          key={`${lat}-${lng}-${mapType}-${zoomLevel}-${isDirectionsMode}`}
          title="Google Maps Free Live Vehicle Tracker"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          className="w-full h-full"
        />
      </div>

      {/* ── Bottom Floating Telemetry Overlay ───────────────────────────── */}
      {showTelematics && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Location & Speed Pill */}
          <div className="bg-[#151D2C]/95 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <MdLocationOn size={18} />
            </div>
            <div className="truncate max-w-[260px] sm:max-w-md">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Position
              </div>
              <div className="text-xs font-bold text-white truncate">
                {address}
              </div>
            </div>
          </div>

          {/* Telemetry Stats: Speed & Stoppage */}
          <div className="bg-[#151D2C]/95 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-4 self-end sm:self-auto font-mono">
            {isCurrentlyStopped ? (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  STOPPED: {Math.floor(stopDurationSeconds / 60)}m {stopDurationSeconds % 60}s
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <MdSpeed size={16} className="text-[#D4AF37]" />
                <span className="text-sm font-black text-white">{speed}</span>
                <span className="text-[10px] text-slate-400">km/h</span>
              </div>
            )}

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
              <MdExplore size={15} className="text-[#D4AF37]" />
              <span>{getCompassHeading(heading)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
