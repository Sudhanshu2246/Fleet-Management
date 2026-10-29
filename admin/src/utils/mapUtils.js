import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Default Leaflet Icons for Vite / Webpack Bundlers ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Map Tile Layer Options (100% Free Version, No API Keys Required) ──
export const MAP_LAYERS = {
  googleStreets: {
    id: "googleStreets",
    name: "Google Maps (Roadmap)",
    url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener">Google Maps</a>',
    className: "",
    maxZoom: 20,
  },
  googleHybrid: {
    id: "googleHybrid",
    name: "Google Maps (Satellite / Hybrid)",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener">Google Maps</a>',
    className: "",
    maxZoom: 20,
  },
  googleTerrain: {
    id: "googleTerrain",
    name: "Google Maps (Terrain)",
    url: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener">Google Maps</a>',
    className: "",
    maxZoom: 20,
  },
  street: {
    id: "street",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    className: "",
    maxZoom: 19,
  },
  satellite: {
    id: "satellite",
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    className: "",
    maxZoom: 18,
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    className: "dark-mode-tiles",
    maxZoom: 19,
  },
};

// ── Create Custom Animated Driver Pin ──
export const createDriverIcon = (status = "active", isSelected = false, initials = "DR") => {
  const colors = {
    active: { bg: "#D4AF37", glow: "rgba(212, 175, 55, 0.45)", border: "#FFE57F", text: "#0B0F17" },
    idle: { bg: "#f59e0b", glow: "rgba(245, 158, 11, 0.45)", border: "#FDE68A", text: "#0B0F17" },
    offline: { bg: "#64748b", glow: "rgba(100, 116, 139, 0.3)", border: "#94a3b8", text: "#FFFFFF" },
    occupied: { bg: "#3b82f6", glow: "rgba(59, 130, 246, 0.45)", border: "#93c5fd", text: "#FFFFFF" },
  };

  const c = colors[status] || colors.active;
  const size = isSelected ? 40 : 32;

  return L.divIcon({
    className: "driver-marker-div",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        ${
          status === "active"
            ? `<div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background: ${c.glow};
                animation: marker-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ""
        }
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: #151D2C;
          border: ${isSelected ? "3px solid #FFFFFF" : `2px solid ${c.bg}`};
          box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 ${isSelected ? "14px #D4AF37" : "8px " + c.glow};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: ${isSelected ? "11px" : "9px"};
          color: ${c.bg};
          letter-spacing: -0.3px;
          user-select: none;
        ">
          ${initials}
        </div>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: ${c.bg};
          border: 1.5px solid #0B0F17;
          box-shadow: 0 0 4px ${c.glow};
        "></div>
      </div>
      <style>
        @keyframes marker-pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

// ── Simple Pin Icon (Pickup, Dropoff, Geofence) ──
export const createPinIcon = (color = "#10b981", label = "") => {
  return L.divIcon({
    className: "pin-marker-div",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: ${color};
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 10px; font-weight: bold;">${label}</span>
        </div>
        <div style="
          width: 6px;
          height: 6px;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [26, 32],
    iconAnchor: [13, 30],
    popupAnchor: [0, -28],
  });
};

// ── Next-Level Stoppage Pin with Stop Number and Duration Badge ──
export const createStopPinIcon = (stopNumber = 1, durationText = "", isCurrentStop = false) => {
  const bg = isCurrentStop ? "#ef4444" : "#f59e0b";
  const glow = isCurrentStop ? "rgba(239, 68, 68, 0.7)" : "rgba(245, 158, 11, 0.55)";
  const size = isCurrentStop ? 34 : 28;

  return L.divIcon({
    className: "stop-pin-marker-div",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
        ${isCurrentStop ? `
          <div style="
            position: absolute;
            top: 0px;
            width: ${size + 16}px;
            height: ${size + 16}px;
            border-radius: 50%;
            background: ${glow};
            animation: stop-hazard-pulse 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ""}
        
        <!-- Octagonal/Diamond Stop Pin -->
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #0B0F17;
          border: 2.5px solid ${bg};
          box-shadow: 0 4px 16px rgba(0,0,0,0.85), 0 0 12px ${glow};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 11px; line-height: 1;">
            🛑
          </span>
        </div>

        <!-- Duration pill badge -->
        <div style="
          margin-top: 3px;
          background: rgba(11, 15, 23, 0.95);
          border: 1px solid ${bg};
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 6px;
          border-radius: 9999px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.8);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 3px;
          backdrop-filter: blur(4px);
        ">
          <span style="color: ${bg}; font-weight: 900;">#${stopNumber}</span>
          ${durationText ? `<span style="color: #64748b;">•</span><span>${durationText}</span>` : ""}
        </div>
      </div>
      <style>
        @keyframes stop-hazard-pulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          70% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      </style>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 30],
    popupAnchor: [0, -32],
  });
};

// ── Next-Level Heading Vehicle Marker with Rotating Directional Cone ──
export const createHeadingDriverIcon = (driver = {}, isSelected = false) => {
  const isStopped = Boolean(driver.isCurrentlyStopped);
  const heading = Number(driver.heading) || 0;
  const speed = Math.round(Number(driver.speed) || 0);
  const initials = driver.avatar || (driver.name ? driver.name.substring(0, 2).toUpperCase() : "DR");
  const color = isStopped ? "#ef4444" : (speed > 0 ? "#D4AF37" : "#38bdf8");
  const glow = isStopped ? "rgba(239, 68, 68, 0.6)" : "rgba(212, 175, 55, 0.55)";
  const size = isSelected ? 42 : 34;

  return L.divIcon({
    className: "heading-driver-marker-div",
    html: `
      <div style="position: relative; width: ${size + 24}px; height: ${size + 24}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        
        <!-- Rotating Navigation Vector / Radar Cone -->
        <div style="
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
          pointer-events: none;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <!-- Forward Radar Beam -->
          <div style="
            position: absolute;
            top: -5px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 14px solid ${color};
            filter: drop-shadow(0 0 8px ${glow});
          "></div>
        </div>

        ${isStopped ? `
          <div style="
            position: absolute;
            inset: 2px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.25);
            border: 1.5px dashed #ef4444;
            animation: marker-pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : (speed > 0 ? `
          <div style="
            position: absolute;
            inset: 4px;
            border-radius: 50%;
            background: ${glow};
            animation: marker-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : "")}

        <!-- Center Vehicle Node -->
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: #111724;
          border: ${isSelected ? "3px solid #FFFFFF" : `2.5px solid ${color}`};
          box-shadow: 0 4px 20px rgba(0,0,0,0.85), 0 0 ${isSelected ? "18px #D4AF37" : "12px " + glow};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: ${isSelected ? "11px" : "10px"};
          color: ${color};
          user-select: none;
          z-index: 2;
        ">
          ${isStopped ? "🛑" : initials}
        </div>

        <!-- Live Speed Mini Badge -->
        <div style="
          position: absolute;
          bottom: -5px;
          background: rgba(11, 15, 23, 0.95);
          border: 1px solid ${color};
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 5px;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.8);
          z-index: 3;
        ">
          ${isStopped ? "STOPPED" : `${speed} km/h`}
        </div>
      </div>
    `,
    iconSize: [size + 24, size + 24],
    iconAnchor: [(size + 24) / 2, (size + 24) / 2],
    popupAnchor: [0, -(size + 24) / 2],
  });
};

// ── Waypoint Pin Icon (Pickup & Destination) ──
export const createWaypointPinIcon = (type = "pickup", label = "A") => {
  const isPickup = type === "pickup";
  const color = isPickup ? "#10b981" : "#ef4444";
  const glow = isPickup ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";

  return L.divIcon({
    className: "waypoint-marker-div",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: #0B0F17;
          color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid ${color};
          box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 10px ${glow};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        ">
          <span style="transform: rotate(45deg); font-size: 11px;">${label}</span>
        </div>
        <div style="
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          margin-top: 1px;
          box-shadow: 0 0 6px ${glow};
        "></div>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 34],
    popupAnchor: [0, -32],
  });
};

// ── Google Maps Direct URLs ──
export const getGoogleMapsUrl = (lat, lng) => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

export const getGoogleMapsDirectionsUrl = (originLat, originLng, destLat, destLng) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
};

// ── Google Maps 100% Free Embed URLs (Zero API Key, Zero Billing) ──
export const getGoogleMapsEmbedUrl = (lat, lng, zoom = 15, layerType = "m") => {
  // layerType: 'm' (roadmap), 'k' (satellite), 'h' (hybrid)
  return `https://maps.google.com/maps?q=${lat},${lng}&t=${layerType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
};

export const getGoogleMapsDirectionsEmbedUrl = (originLat, originLng, destLat, destLng) => {
  return `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&output=embed`;
};

// ── Default Regional Metro Center (Delhi NCR default, adjust dynamically) ──
export const DEFAULT_MAP_CENTER = [28.6139, 77.2090];
export const DEFAULT_MAP_ZOOM = 12;

// ── Curated Demo Drivers for Fallback / Simulation ──
export const DEMO_DRIVERS = [
  {
    id: "drv-01",
    userId: 101,
    name: "Vikram Malhotra",
    phone: "+91 98112 34567",
    email: "vikram.m@fleetiq.com",
    avatar: "VM",
    status: "active",
    vehicleId: "VH-4821",
    vehicleName: "Prime Hauler HD",
    vehicleType: "truck",
    speed: 58,
    battery: 89,
    lat: 28.6289,
    lng: 77.2180,
    address: "Barakhamba Road, Connaught Place, New Delhi",
    heading: 45,
    lastSeen: "Just now",
    tripId: "TRP-8821",
  },
  {
    id: "drv-02",
    userId: 102,
    name: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya.s@fleetiq.com",
    avatar: "PS",
    status: "active",
    vehicleId: "VH-0071",
    vehicleName: "Metro Express Van",
    vehicleType: "van",
    speed: 42,
    battery: 76,
    lat: 28.5672,
    lng: 77.2433,
    address: "Ring Road, Lajpat Nagar, New Delhi",
    heading: 120,
    lastSeen: "1 min ago",
    tripId: "TRP-8822",
  },
  {
    id: "drv-03",
    userId: 103,
    name: "Rajesh Kumar",
    phone: "+91 97123 98765",
    email: "rajesh.k@fleetiq.com",
    avatar: "RK",
    status: "idle",
    vehicleId: "VH-3310",
    vehicleName: "Urban Cargo Shuttle",
    vehicleType: "shuttle",
    speed: 0,
    battery: 48,
    lat: 28.6506,
    lng: 77.1906,
    address: "Karol Bagh Depot, New Delhi",
    heading: 0,
    lastSeen: "4 mins ago",
    tripId: null,
  },
  {
    id: "drv-04",
    userId: 104,
    name: "Arjun Verma",
    phone: "+91 99234 56789",
    email: "arjun.v@fleetiq.com",
    avatar: "AV",
    status: "active",
    vehicleId: "DEV-5501",
    vehicleName: "Freightliner LongHaul",
    vehicleType: "truck",
    speed: 74,
    battery: 92,
    lat: 28.5355,
    lng: 77.2910,
    address: "Badarpur Border Expressway, New Delhi",
    heading: 180,
    lastSeen: "Just now",
    tripId: "TRP-8825",
  },
  {
    id: "drv-05",
    userId: 105,
    name: "Siddharth Rao",
    phone: "+91 98345 67890",
    email: "siddharth.r@fleetiq.com",
    avatar: "SR",
    status: "offline",
    vehicleId: "VH-2200",
    vehicleName: "Rapid Delivery Van",
    vehicleType: "van",
    speed: 0,
    battery: 12,
    lat: 28.7041,
    lng: 77.1025,
    address: "Rohini Sector 10 Hub, New Delhi",
    heading: 0,
    lastSeen: "35 mins ago",
    tripId: null,
  },
  {
    id: "drv-06",
    userId: 106,
    name: "Ananya Deshmukh",
    phone: "+91 98456 12345",
    email: "ananya.d@fleetiq.com",
    avatar: "AD",
    status: "active",
    vehicleId: "VH-9904",
    vehicleName: "Fleet Cruiser Car",
    vehicleType: "car",
    speed: 36,
    battery: 84,
    lat: 28.5921,
    lng: 77.0460,
    address: "Dwarka Sector 21 Terminal, New Delhi",
    heading: 260,
    lastSeen: "2 mins ago",
    tripId: "TRP-8829",
  },
];

// ── Normalize Backend Drivers & Vehicles into unified map items ──
export const normalizeFleetUnits = (rawDrivers = [], rawVehicles = [], assignments = []) => {
  // If there are real drivers from API:
  if (Array.isArray(rawDrivers) && rawDrivers.length > 0) {
    const list = rawDrivers.map((item, index) => {
      const driverProfile = item.Driver || {};
      const assignedVehicleId = driverProfile.vehicleAssignedId;
      
      // Match with vehicle if available
      const vehicle = Array.isArray(rawVehicles)
        ? rawVehicles.find((v) => v.id === assignedVehicleId || v.driverAssignedId === item.id)
        : null;

      // Match with active assignment if available
      const assignment = Array.isArray(assignments)
        ? assignments.find((a) => a.driverId === item.id || a.vehicleId === assignedVehicleId)
        : null;

      const name = `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.name || `Driver #${item.id}`;
      const initials = name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "DR";

      // Status calculation
      let status = "active";
      if (!driverProfile.isActive) status = "offline";
      else if (driverProfile.isLoggedIn) status = "active";
      else if (vehicle && vehicle.status) status = vehicle.status;
      else if (driverProfile.occupiedStatus === "available" && !assignedVehicleId) status = "idle";
      else status = "offline";

      // Coordinates resolution:
      // 1. Driver's direct live GPS coordinates reported from Driver App
      // 2. Assigned vehicle coordinates
      // 3. Assignment coordinates
      // 4. Fallback to realistic regional coordinates
      let lat = (driverProfile.currentLat !== null && driverProfile.currentLat !== undefined && !isNaN(driverProfile.currentLat))
        ? Number(driverProfile.currentLat)
        : (vehicle?.locationLat || assignment?.tripFromLat);

      let lng = (driverProfile.currentLng !== null && driverProfile.currentLng !== undefined && !isNaN(driverProfile.currentLng))
        ? Number(driverProfile.currentLng)
        : (vehicle?.locationLng || assignment?.tripFromLng);

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        // Offset deterministically based on ID to avoid all stacking on top of each other
        const offsetLat = ((item.id * 17) % 50 - 25) * 0.0035;
        const offsetLng = ((item.id * 23) % 50 - 25) * 0.0035;
        lat = DEFAULT_MAP_CENTER[0] + offsetLat;
        lng = DEFAULT_MAP_CENTER[1] + offsetLng;
      }

      const speedVal = (driverProfile.currentSpeed !== undefined && driverProfile.currentSpeed !== null)
        ? Math.round(driverProfile.currentSpeed)
        : (vehicle?.speed !== undefined ? Math.round(vehicle.speed) : (status === "active" ? 45 + (item.id % 30) : 0));

      const headingVal = (driverProfile.heading !== undefined && driverProfile.heading !== null)
        ? Number(driverProfile.heading)
        : ((item.id * 45) % 360);

      return {
        id: `drv-${item.id}`,
        userId: item.id,
        driverProfileId: driverProfile.id,
        name,
        phone: item.phone || "—",
        email: item.email || "—",
        avatar: initials,
        status,
        isLoggedIn: Boolean(driverProfile.isLoggedIn),
        vehicleId: assignedVehicleId || vehicle?.id || "Unassigned",
        vehicleName: vehicle?.name || "Standard Unit",
        vehicleType: vehicle?.type || "truck",
        speed: speedVal,
        battery: vehicle?.battery !== undefined ? Math.round(vehicle.battery) : 80 - (item.id % 35),
        lat,
        lng,
        address: driverProfile.locationAddress || vehicle?.locationAddress || assignment?.tripFrom || "Fleet Operations Center",
        heading: headingVal,
        lastSeen: driverProfile.lastLocationUpdate
          ? new Date(driverProfile.lastLocationUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : (vehicle?.lastSeen ? new Date(vehicle.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"),
        lastLocationUpdate: driverProfile.lastLocationUpdate || null,
        tripId: assignment?.tripId || null,
        isLive: true,
      };
    });

    return list;
  }

  // Fallback to demo drivers
  return DEMO_DRIVERS;
};

// ── In-Memory Realistic Route Cache ──────────────────────────────────────────
const routeCache = new Map();

/**
 * generateCurvedRoadFallback
 * Generates curved road-like coordinates as fallback if offline/firewalled
 */
export function generateCurvedRoadFallback(startLat, startLng, endLat, endLng, numPoints = 20) {
  const points = [];
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const deltaLat = endLat - startLat;
  const deltaLng = endLng - startLng;

  // Orthogonal displacement for natural curved highway path
  const perpLat = -deltaLng * 0.16;
  const perpLng = deltaLat * 0.16;
  const controlLat = midLat + perpLat;
  const controlLng = midLng + perpLng;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * controlLat + t * t * endLat;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * controlLng + t * t * endLng;
    points.push([lat, lng]);
  }

  const directDistKm = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111;
  const estKm = Number((directDistKm * 1.28).toFixed(1));

  return {
    path: points,
    distanceMeters: Math.round(estKm * 1000),
    distanceKm: estKm,
    durationSeconds: Math.round(estKm * 95),
  };
}

/**
 * fetchRealisticDrivingRoute
 * Fetches real road driving path from OSRM following actual highway and street networks.
 * Returns array of [lat, lng] coordinates that curve along actual roads.
 */
export async function fetchRealisticDrivingRoute(startCoord, endCoord) {
  if (!startCoord || !endCoord) return null;
  const startLat = Number(startCoord.lat ?? startCoord[0]);
  const startLng = Number(startCoord.lng ?? startCoord[1]);
  const endLat = Number(endCoord.lat ?? endCoord[0]);
  const endLng = Number(endCoord.lng ?? endCoord[1]);

  if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) return null;

  // Resolution of 4 decimal places (~11 meters) prevents redundant network queries
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const path = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const result = {
        path,
        distanceMeters: route.distance,
        distanceKm: Number((route.distance / 1000).toFixed(1)),
        durationSeconds: Math.round(route.duration),
      };
      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("OSRM routing network fallback:", err.message);
  }

  const fallback = generateCurvedRoadFallback(startLat, startLng, endLat, endLng);
  routeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * fetchRealisticTripCorridor
 * Fetches real driving route for the full trip corridor:
 * 1. Covered Path: Point A (Origin) -> Live Driver Headway (along real roads)
 * 2. Projected Path: Live Driver Headway -> Point B (Destination, along real roads)
 */
export async function fetchRealisticTripCorridor(source, driverPos, dest) {
  if (!source || !driverPos || !dest) return null;

  const [coveredRes, projectedRes] = await Promise.all([
    fetchRealisticDrivingRoute(source, driverPos),
    fetchRealisticDrivingRoute(driverPos, dest),
  ]);

  const coveredPath = coveredRes?.path || [
    [source.lat, source.lng],
    [driverPos.lat, driverPos.lng],
  ];

  const projectedPath = projectedRes?.path || [
    [driverPos.lat, driverPos.lng],
    [dest.lat, dest.lng],
  ];

  const coveredKm = coveredRes?.distanceKm || 12.4;
  const remKm = projectedRes?.distanceKm || 9.8;
  const totalKm = Number((coveredKm + remKm).toFixed(1));
  const progressPct = Math.min(100, Math.max(0, Math.round((coveredKm / (totalKm || 1)) * 100)));

  return {
    coveredPath,
    projectedPath,
    totalDistanceKm: totalKm,
    coveredDistanceKm: coveredKm,
    remainingDistanceKm: remKm,
    progressPct,
    durationSeconds: projectedRes?.durationSeconds || 1200,
  };
}
