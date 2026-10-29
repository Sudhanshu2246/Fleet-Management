import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdClose, MdSearch, MdLocationOn } from "react-icons/md";
import { toast } from "sonner";

// Fix for default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapLocationModal({ isOpen, onClose, onConfirm, initialLocation }) {
  const defaultPos = { lat: 20.5937, lng: 78.9629 };
  const hasValidCoords = initialLocation && initialLocation.lat != null && initialLocation.lng != null;
  const [position, setPosition] = useState(hasValidCoords ? { lat: initialLocation.lat, lng: initialLocation.lng } : defaultPos); // Default to India if no coords
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

  // Geocode when clicking on the map
  const handleMapClick = async (lat, lng) => {
    setPosition({ lat, lng });
    setAddress("Fetching address...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": "FleetManagementAdminApp/1.0"
        }
      });
      const data = await res.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
        setSearchQuery(data.display_name);
      } else {
        const fallback = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
        setAddress(fallback);
        setSearchQuery(fallback);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      const fallback = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
      setAddress(fallback);
      setSearchQuery(fallback);
    }
  };

  // Debounce search to prevent Nominatim rate limiting
  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "FleetManagementAdminApp/1.0"
          }
        });
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Geocoding search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearch();
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const selectSearchResult = (place) => {
    const newPos = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setPosition(newPos);
    setAddress(place.display_name);
    setSearchQuery(place.display_name);
    setSearchResults([]);
    
    if (mapRef.current) {
      mapRef.current.flyTo(newPos, 14);
    }
  };

  const handleConfirm = () => {
    if (!address) {
      toast.error("Please select a location on the map");
      return;
    }
    onConfirm({
      address,
      lat: position.lat,
      lng: position.lng
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0C0D0D]/70 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#151D2C] border border-slate-800 rounded-3xl w-full max-w-4xl h-[600px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col z-[201]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#151D2C] shrink-0">
            <div>
              <h3 className="text-lg font-black text-white">Select Location</h3>
              <p className="text-xs text-slate-400 mt-1">Click on the map or search for a location</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <MdClose size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 bg-[#151D2C] border-b border-slate-800 shrink-0 z-[400]">
            <div className="relative w-full sm:w-[400px] mx-auto">
              <div className="flex items-center bg-slate-900/70 rounded-xl border border-slate-700/60 h-11 px-4 focus-within:border-[#D4AF37] focus-within:bg-slate-900 transition-all">
                <MdSearch size={20} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-500"
                />
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin ml-2"></div>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] rounded-xl shadow-2xl border border-slate-700 overflow-hidden max-h-60 overflow-y-auto z-[500]">
                  {searchResults.map((place) => (
                    <div
                      key={place.place_id}
                      onClick={() => selectSearchResult(place)}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-800/80 border-b border-slate-800 last:border-0 flex items-start gap-3 transition-colors"
                    >
                      <MdLocationOn className="text-[#D4AF37] shrink-0 mt-0.5" size={16} />
                      <span className="text-xs text-slate-200 leading-tight">
                        {place.display_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative bg-[#0B0F17] z-0">
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <Marker position={position} />
              <MapEvents onLocationSelect={handleMapClick} />
            </MapContainer>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-[#1E293B]/40 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                <MdLocationOn size={20} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Address</p>
                <p className="text-sm font-semibold text-white truncate" title={address}>
                  {address || "Fetching address..."}
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-slate-900 bg-[#D4AF37] hover:bg-[#C4A030] transition-all shadow-[0_4px_14px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.6)] shrink-0 cursor-pointer"
            >
              Confirm Location
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
