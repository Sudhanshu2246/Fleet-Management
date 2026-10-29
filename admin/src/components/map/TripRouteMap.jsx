import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdNavigation, MdOpenInNew } from "react-icons/md";
import {
  MAP_LAYERS,
  createPinIcon,
  getGoogleMapsDirectionsUrl,
  DEFAULT_MAP_CENTER,
} from "../../utils/mapUtils";

function RouteBoundsController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const valid = points.filter(
        (p) => p && !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== 0 && p[1] !== 0
      );
      if (valid.length > 1) {
        const bounds = L.latLngBounds(valid);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      } else if (valid.length === 1) {
        map.setView(valid[0], 13);
      }
    }
  }, [points, map]);
  return null;
}

export default function TripRouteMap({
  sourceLat,
  sourceLng,
  sourceAddress = "Pickup Point",
  destLat,
  destLng,
  destAddress = "Dropoff Point",
  height = "200px",
}) {
  // Fallbacks if coordinates are missing
  const src = [
    sourceLat || DEFAULT_MAP_CENTER[0],
    sourceLng || DEFAULT_MAP_CENTER[1],
  ];
  const dst = [
    destLat || DEFAULT_MAP_CENTER[0] + 0.05,
    destLng || DEFAULT_MAP_CENTER[1] + 0.06,
  ];

  const points = [src, dst];
  const gmapsDirectionsUrl = getGoogleMapsDirectionsUrl(
    src[0],
    src[1],
    dst[0],
    dst[1]
  );

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F17]" style={{ height }}>
      {/* Google Maps Directions Button */}
      <a
        href={gmapsDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Get Turn-by-Turn Directions in Google Maps"
        className="absolute top-2 right-2 z-[999] flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#151D2C]/90 text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg backdrop-blur-md hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
      >
        <MdNavigation size={12} />
        <span>Directions</span>
        <MdOpenInNew size={10} />
      </a>

      <MapContainer
        center={src}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <RouteBoundsController points={points} />
        {(() => {
          const tile = MAP_LAYERS?.dark || MAP_LAYERS?.street || Object.values(MAP_LAYERS)[0];
          return (
            <TileLayer
              url={tile?.url || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              attribution={tile?.attribution || "&copy; OpenStreetMap contributors"}
            />
          );
        })()}

        {/* Source Marker */}
        <Marker position={src} icon={createPinIcon("#10b981", "A")}>
          <Popup className="fleet-custom-popup">
            <div className="p-1 text-xs">
              <div className="font-bold text-emerald-400">Pickup Location</div>
              <div className="text-slate-300 mt-0.5">{sourceAddress}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={dst} icon={createPinIcon("#ef4444", "B")}>
          <Popup className="fleet-custom-popup">
            <div className="p-1 text-xs">
              <div className="font-bold text-red-400">Dropoff Location</div>
              <div className="text-slate-300 mt-0.5">{destAddress}</div>
            </div>
          </Popup>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          positions={points}
          pathOptions={{
            color: "#D4AF37",
            weight: 3.5,
            opacity: 0.85,
            dashArray: "6, 8",
          }}
        />
      </MapContainer>
    </div>
  );
}
