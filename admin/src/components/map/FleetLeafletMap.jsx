import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MdLayers,
  MdCropFree,
  MdNavigation,
  MdOpenInNew,
  MdPhone,
  MdSpeed,
  MdBatteryChargingFull,
  MdContentCopy,
  MdCheck,
  MdFullscreen,
  MdFullscreenExit,
  MdTimer,
  MdRoute,
} from "react-icons/md";
import {
  MAP_LAYERS,
  createDriverIcon,
  createHeadingDriverIcon,
  createStopPinIcon,
  createWaypointPinIcon,
  getGoogleMapsUrl,
  getGoogleMapsDirectionsUrl,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "../../utils/mapUtils";

// ── Helper to ensure Leaflet recalculates dimensions ──
function MapResizer({ isFullScreen }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const resize = () => {
      try {
        map.invalidateSize({ pan: false });
      } catch (e) {
        // ignore if unmounted
      }
    };

    resize();
    const timeouts = [50, 150, 300, 600, 1000].map((delay) =>
      setTimeout(resize, delay)
    );

    let ro = null;
    if (typeof ResizeObserver !== "undefined" && container) {
      ro = new ResizeObserver(() => {
        resize();
      });
      ro.observe(container);
    }

    window.addEventListener("resize", resize);
    return () => {
      timeouts.forEach(clearTimeout);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [map, isFullScreen]);
  return null;
}

// ── Helper to smoothly pan & zoom to selected driver or route ──
function FlyToController({ targetCoords, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && !isNaN(targetCoords[0]) && !isNaN(targetCoords[1])) {
      map.flyTo(targetCoords, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords, zoom, map]);
  return null;
}

// ── Helper to fit all drivers or active trip route within bounds ──
function BoundsController({ drivers, activeTrip, trigger }) {
  const map = useMap();
  useEffect(() => {
    // If an active trip route is provided, fit the trip corridor
    if (activeTrip && activeTrip.source && activeTrip.dest) {
      const points = [];
      if (activeTrip.source.lat && activeTrip.source.lng) {
        points.push([activeTrip.source.lat, activeTrip.source.lng]);
      }
      if (activeTrip.current && activeTrip.current.lat && activeTrip.current.lng) {
        points.push([activeTrip.current.lat, activeTrip.current.lng]);
      }
      if (activeTrip.dest.lat && activeTrip.dest.lng) {
        points.push([activeTrip.dest.lat, activeTrip.dest.lng]);
      }
      if (Array.isArray(activeTrip.stops)) {
        activeTrip.stops.forEach((s) => {
          if (s.stopLatitude && s.stopLongitude) {
            points.push([s.stopLatitude, s.stopLongitude]);
          }
        });
      }

      if (points.length >= 2) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
        return;
      }
    }

    // Default: fit all drivers
    if (drivers && drivers.length > 0) {
      const validPoints = drivers
        .filter((d) => d.lat && d.lng && !isNaN(d.lat) && !isNaN(d.lng))
        .map((d) => [d.lat, d.lng]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [trigger, drivers, activeTrip, map]);
  return null;
}

export default function FleetLeafletMap({
  drivers = [],
  selectedDriver = null,
  onSelectDriver = () => {},
  activeTrip = null, // { tripId, source, dest, current, coveredPath, projectedPath, stops }
  showRoute = true,
  showStopPins = true,
  isFullScreen = false,
  onToggleFullScreen = null,
  height = "100%",
  minHeight = "400px",
  compact = false,
  showControls = true,
  defaultLayer = "googleStreets",
  disableDark = false,
  showLayerSwitcher = true,
  className = "",
}) {
  const initialLayer = disableDark
    ? defaultLayer === "dark"
      ? "googleStreets"
      : defaultLayer
    : defaultLayer;

  const [activeLayer, setActiveLayer] = useState(initialLayer);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const markerRefs = useRef({});

  // Auto-open selected driver popup if ref exists
  useEffect(() => {
    if (selectedDriver && markerRefs.current[selectedDriver.id]) {
      const marker = markerRefs.current[selectedDriver.id];
      setTimeout(() => {
        try {
          marker.openPopup();
        } catch {
          // ignore if unmounted
        }
      }, 350);
    }
  }, [selectedDriver]);

  const center =
    selectedDriver && selectedDriver.lat && selectedDriver.lng
      ? [selectedDriver.lat, selectedDriver.lng]
      : drivers.length > 0 && drivers[0].lat && drivers[0].lng
      ? [drivers[0].lat, drivers[0].lng]
      : DEFAULT_MAP_CENTER;

  const availableLayers = (MAP_LAYERS ? Object.values(MAP_LAYERS) : []).filter(
    (layer) => (disableDark ? layer.id !== "dark" : true)
  );

  const currentLayerConfig =
    (MAP_LAYERS && MAP_LAYERS[activeLayer]) ||
    availableLayers[0] || {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };

  const handleCopyCoords = (lat, lng, id) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${
        isFullScreen ? "rounded-none h-full" : "rounded-xl"
      } bg-[#0B0F17] ${className}`}
      style={{ height: height || "100%", width: "100%", minHeight: isFullScreen ? "100%" : minHeight }}
    >
      {/* ── Top-Right Map Overlay Controls ─────────────────────────────── */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[999] flex items-center gap-2">
          {/* Fullscreen HUD Toggle Button (hidden when already in full screen) */}
          {onToggleFullScreen && !isFullScreen && (
            <button
              onClick={onToggleFullScreen}
              title="Open Full Map Mission Control"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#151D2C]/90 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-md shadow-xl hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <MdFullscreen size={17} />
              <span className="hidden sm:inline">Full Map View</span>
            </button>
          )}

          {/* Quick Google Satellite / Roadmap 1-click toggle */}
          <button
            onClick={() =>
              setActiveLayer(activeLayer === "googleHybrid" ? "googleStreets" : "googleHybrid")
            }
            title={
              activeLayer === "googleHybrid"
                ? "Switch to Google Maps Roadmap"
                : "Switch to Google Maps Satellite"
            }
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold bg-[#151D2C]/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-[#D4AF37]/50 transition-all cursor-pointer"
          >
            <span>{activeLayer === "googleHybrid" ? "🗺️" : "🛰️"}</span>
            <span className="hidden lg:inline">
              {activeLayer === "googleHybrid" ? "Roadmap" : "Satellite"}
            </span>
          </button>
          {showLayerSwitcher && availableLayers.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                title="Change Map Style"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#151D2C]/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              >
                <MdLayers size={16} className="text-[#D4AF37]" />
                <span className="hidden sm:inline">
                  {currentLayerConfig?.name || "Layer"}
                </span>
              </button>

              {showLayerMenu && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#151D2C] border border-slate-700/80 shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-md animate-fadeIn">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Map Provider
                  </div>
                  {availableLayers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        setActiveLayer(layer.id);
                        setShowLayerMenu(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                        activeLayer === layer.id
                          ? "bg-[#D4AF37]/15 text-[#D4AF37] font-bold"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{layer.name}</span>
                      {activeLayer === layer.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fit Route / All Markers Button */}
          <button
            onClick={() => setFitTrigger((prev) => prev + 1)}
            title="Fit Route & Vehicles in View"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#151D2C]/90 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md shadow-lg hover:border-[#D4AF37]/50 transition-all cursor-pointer"
          >
            <MdCropFree size={16} className="text-[#D4AF37]" />
            <span className="hidden md:inline">
              {activeTrip ? "Fit Route" : "Fit All"}
            </span>
          </button>
        </div>
      )}

      {/* ── OpenStreetMap Leaflet Container ─────────────────────────────── */}
      <MapContainer
        center={center}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={!compact}
      >
        <MapResizer isFullScreen={isFullScreen} />

        {/* Dynamic bounds controller */}
        <BoundsController
          drivers={drivers}
          activeTrip={activeTrip}
          trigger={fitTrigger}
        />

        {/* Fly to selected driver if no active trip bounds active */}
        {!activeTrip && selectedDriver && selectedDriver.lat && selectedDriver.lng && (
          <FlyToController
            targetCoords={[selectedDriver.lat, selectedDriver.lng]}
            zoom={15}
          />
        )}

        {/* Dynamic Tile Layer (Supports Google Maps & OSM) */}
        <TileLayer
          key={activeLayer}
          url={currentLayerConfig.url}
          attribution={currentLayerConfig.attribution}
          subdomains={currentLayerConfig.subdomains || ["0", "1", "2", "3", "a", "b", "c"]}
          className={currentLayerConfig.className || ""}
          maxZoom={currentLayerConfig.maxZoom || 20}
        />

        {/* ── ACTIVE TRIP ROUTE & WAYPOINTS ─────────────────────────────── */}
        {showRoute && activeTrip && (
          <>
            {/* Glowing Backdrop Polyline for Covered Path */}
            {activeTrip.coveredPath && activeTrip.coveredPath.length >= 2 && (
              <>
                <Polyline
                  positions={activeTrip.coveredPath}
                  pathOptions={{
                    color: "#D4AF37",
                    weight: 10,
                    opacity: 0.25,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={activeTrip.coveredPath}
                  pathOptions={{
                    color: "#D4AF37",
                    weight: 5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </>
            )}

            {/* Projected Forward Polyline (heading to destination) */}
            {activeTrip.projectedPath && activeTrip.projectedPath.length >= 2 && (
              <>
                <Polyline
                  positions={activeTrip.projectedPath}
                  pathOptions={{
                    color: "#38bdf8",
                    weight: 8,
                    opacity: 0.2,
                    dashArray: "10, 10",
                    lineCap: "round",
                  }}
                />
                <Polyline
                  positions={activeTrip.projectedPath}
                  pathOptions={{
                    color: "#38bdf8",
                    weight: 4,
                    opacity: 0.85,
                    dashArray: "8, 8",
                    lineCap: "round",
                  }}
                />
              </>
            )}

            {/* Source Pickup Marker (Green A) */}
            {activeTrip.source && activeTrip.source.lat && activeTrip.source.lng && (
              <Marker
                position={[activeTrip.source.lat, activeTrip.source.lng]}
                icon={createWaypointPinIcon("pickup", "A")}
              >
                <Popup className="fleet-custom-popup">
                  <div className="p-2 min-w-[200px] text-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Trip Origin (Pickup)</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-snug">
                      {activeTrip.source.address || "Origin Facility"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      GPS: {activeTrip.source.lat.toFixed(5)}, {activeTrip.source.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Dropoff Marker (Red B) */}
            {activeTrip.dest && activeTrip.dest.lat && activeTrip.dest.lng && (
              <Marker
                position={[activeTrip.dest.lat, activeTrip.dest.lng]}
                icon={createWaypointPinIcon("dropoff", "B")}
              >
                <Popup className="fleet-custom-popup">
                  <div className="p-2 min-w-[200px] text-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Trip Destination (Dropoff)</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-snug">
                      {activeTrip.dest.address || "Destination Hub"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      GPS: {activeTrip.dest.lat.toFixed(5)}, {activeTrip.dest.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* ── STOPPAGE PINS ON MAP (>60s rule) ────────────────────────── */}
            {showStopPins &&
              Array.isArray(activeTrip.stops) &&
              activeTrip.stops.map((stop, idx) => {
                const lat = Number(stop.stopLatitude || stop.latitude);
                const lng = Number(stop.stopLongitude || stop.longitude);
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

                const isCurrent = Boolean(stop.isCurrent);
                const durText = stop.durationFormatted || (stop.durationSeconds ? `${Math.floor(stop.durationSeconds / 60)}m ${stop.durationSeconds % 60}s` : "60s+");

                return (
                  <Marker
                    key={`trip-stop-${idx}`}
                    position={[lat, lng]}
                    icon={createStopPinIcon(idx + 1, durText, isCurrent)}
                  >
                    <Popup className="fleet-custom-popup">
                      <div className="p-2.5 min-w-[220px] text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                            <span>🛑 Stoppage #{idx + 1}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                                ACTIVE
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {durText}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 leading-snug mb-2">
                          Vehicle stationary for &gt; 60 seconds at this location.
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono space-y-0.5 mb-2">
                          {stop.stoppedAt && (
                            <div>Halt: {new Date(stop.stoppedAt).toLocaleTimeString()}</div>
                          )}
                          {stop.resumedAt && (
                            <div>Resume: {new Date(stop.resumedAt).toLocaleTimeString()}</div>
                          )}
                        </div>

                        <a
                          href={getGoogleMapsUrl(lat, lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25 transition-all"
                        >
                          <MdNavigation size={12} />
                          <span>Inspect in Google Maps</span>
                          <MdOpenInNew size={10} />
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </>
        )}

        {/* ── DRIVER MARKERS WITH COMPASS ROTATING VECTOR ───────────────── */}
        {drivers.map((driver) => {
          if (!driver.lat || !driver.lng || isNaN(driver.lat) || isNaN(driver.lng)) {
            return null;
          }

          const isSelected = selectedDriver?.id === driver.id;

          // Next-level directional vehicle icon with compass vector cone
          const icon = createHeadingDriverIcon(driver, isSelected);

          return (
            <Marker
              key={driver.id}
              position={[driver.lat, driver.lng]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[driver.id] = ref;
              }}
              eventHandlers={{
                click: () => onSelectDriver(driver),
              }}
            >
              <Popup className="fleet-custom-popup">
                <div className="p-2 min-w-[220px] max-w-[280px] text-slate-100">
                  {/* Driver Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
                        {driver.avatar || "DR"}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm leading-tight">
                          {driver.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {driver.vehicleId || "Unassigned"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        driver.isCurrentlyStopped
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : driver.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : driver.status === "idle"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}
                    >
                      {driver.isCurrentlyStopped ? "STOPPED" : driver.status}
                    </span>
                  </div>

                  {/* Stoppage Alert Banner if currently stopped */}
                  {driver.isCurrentlyStopped && (
                    <div className="mb-2 p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>
                        Stationary for {Math.floor((driver.currentStopDurationSeconds || 0) / 60)}m{" "}
                        {(driver.currentStopDurationSeconds || 0) % 60}s
                      </span>
                    </div>
                  )}

                  {/* Telemetry Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-2 bg-[#0B0F17]/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <MdSpeed size={16} className="text-[#D4AF37]" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          Speed
                        </div>
                        <div className="text-xs font-mono font-bold text-white">
                          {driver.isCurrentlyStopped ? "0" : driver.speed || 0} km/h
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MdBatteryChargingFull
                        size={16}
                        className={
                          (driver.battery || 100) < 20
                            ? "text-red-400"
                            : "text-emerald-400"
                        }
                      />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">
                          Heading
                        </div>
                        <div className="text-xs font-mono font-bold text-white">
                          {Math.round(driver.heading || 0)}°
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {driver.address && (
                    <div className="text-[11px] text-slate-300 mb-2 leading-relaxed flex items-start gap-1">
                      <span className="text-slate-500 shrink-0">📍</span>
                      <span className="line-clamp-2">{driver.address}</span>
                    </div>
                  )}

                  {/* Coordinates & Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() =>
                        handleCopyCoords(driver.lat, driver.lng, driver.id)
                      }
                      title="Copy Coordinates"
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedId === driver.id ? (
                        <>
                          <MdCheck size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <MdContentCopy size={11} />
                          <span>
                            {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                          </span>
                        </>
                      )}
                    </button>

                    <a
                      href={getGoogleMapsUrl(driver.lat, driver.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Google Maps"
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 transition-colors cursor-pointer"
                    >
                      <MdNavigation size={12} />
                      <span>Google Maps</span>
                      <MdOpenInNew size={10} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
