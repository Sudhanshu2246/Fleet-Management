import React, { useState, useEffect } from "react";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useDispatch } from "react-redux";
import { getAllTrips } from "../Redux/Thunks/trip.thunks";

export default function ScheduleModal({ vehicle, driver, onClose }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterDate, setFilterDate] = useState("");
  
  const dispatch = useDispatch();

  const isDriver = !!driver;
  const entity = vehicle || driver;

  // tooltip state
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    // Fetch all trips, then filter by vehicle or driver
    const fetchTrips = async () => {
      try {
        const data = await dispatch(getAllTrips({ limit: 1000 })).unwrap();
        if (data && data.success) {
          const entityTrips = (data.trips || []).filter((t) => {
            if (isDriver) {
              return t.driverId === (entity.id || entity.driverId) || t.coDriverId === (entity.id || entity.driverId) || t.Driver?.id === (entity.id || entity.driverId);
            } else {
              return t.vehicleId === (entity.id || entity.vehicleId) || t.Vehicle?.id === (entity.id || entity.vehicleId);
            }
          });
          setTrips(entityTrips);
        }
      } catch (err) {
        console.error("Failed to fetch trips for schedule", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [vehicle, driver, isDriver, entity, dispatch]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to check if a day is booked
  const getBookedTripForDay = (day) => {
    const currentDayDate = new Date(year, month, day);
    // set to start of day for comparison
    currentDayDate.setHours(0, 0, 0, 0);

    for (const trip of trips) {
      if (!trip.startTime) continue;
      
      const start = new Date(trip.startTime);
      start.setHours(0, 0, 0, 0);
      
      // Use returnDate if available, else use endTime, else just use start date
      const end = trip.returnDate 
        ? new Date(trip.returnDate) 
        : trip.endTime 
          ? new Date(trip.endTime) 
          : new Date(trip.startTime);
      end.setHours(23, 59, 59, 999);

      if (currentDayDate >= start && currentDayDate <= end) {
        return trip;
      }
    }
    return null;
  };

  const renderDays = () => {
    const days = [];
    
    // Empty slots before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-[#111827]/5 bg-[#F9FAFB]"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const bookedTrip = getBookedTripForDay(i);
      const isBooked = !!bookedTrip;

      days.push(
        <div
          key={i}
          className={`relative h-12 flex items-center justify-center border border-[#111827]/5 transition-colors cursor-pointer group ${
            isBooked ? "bg-[#D4AF37] text-white font-bold" : "bg-white text-[#111827]/70 hover:bg-[#111827]/5"
          }`}
          onMouseEnter={(e) => {
            if (isBooked) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipData({
                x: rect.left + rect.width / 2,
                y: rect.top - 10, // slightly above
                trip: bookedTrip
              });
            }
          }}
          onMouseLeave={() => setTooltipData(null)}
          onClick={() => {
            // Can add additional click behavior if needed
          }}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#111827]/10 bg-[#F9FAFB]">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                {isDriver ? "Driver Schedule" : "Vehicle Schedule"}
              </h2>
              <p className="text-xs text-[#111827]/50">
                {isDriver 
                  ? `${entity.name || entity.firstName + " " + entity.lastName} (${entity.phone || "—"})`
                  : `${entity.name} (${entity.vehicleNumber})`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#111827]/5 text-[#111827]/40 hover:text-[#111827]"
            >
              <MdClose size={20} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : (
              <div>
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-4">
                  <button onClick={prevMonth} className="p-1 rounded hover:bg-[#111827]/5">
                    <MdChevronLeft size={24} className="text-[#111827]/60" />
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-[#111827]">{monthNames[month]} {year}</span>
                    <div className="relative flex items-center">
                      <input 
                        type="date"
                        value={filterDate}
                        className="text-[10px] px-2 py-1 pr-6 border border-[#111827]/10 rounded outline-none focus:border-[#D4AF37] text-[#111827]/70"
                        onChange={(e) => {
                          setFilterDate(e.target.value);
                          if (e.target.value) {
                            const [y, m, d] = e.target.value.split('-');
                            setCurrentDate(new Date(y, m - 1, d));
                          }
                        }}
                      />
                      {filterDate && (
                        <button 
                          onClick={() => {
                            setFilterDate("");
                            setCurrentDate(new Date());
                          }}
                          className="absolute right-1 text-[#111827]/40 hover:text-[#111827] p-0.5"
                        >
                          <MdClose size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={nextMonth} className="p-1 rounded hover:bg-[#111827]/5">
                    <MdChevronRight size={24} className="text-[#111827]/60" />
                  </button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 mb-2 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-[10px] font-bold text-[#111827]/40 uppercase">{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 rounded-lg overflow-hidden border border-[#111827]/5">
                  {renderDays()}
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[#D4AF37]"></div>
                  <span className="text-xs text-[#111827]/60">Booked/On Trip</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip Portal (Rendered outside to avoid clipping) */}
      {tooltipData && (
        <div 
          className="fixed z-[250] bg-[#111827] text-white p-3 rounded-lg shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col gap-1 max-w-[250px]"
          style={{ left: tooltipData.x, top: tooltipData.y }}
        >
          <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1 border-b border-white/10 pb-1">Trip Details</div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <span className="text-[10px] text-green-400 font-bold w-8 shrink-0">FROM</span>
              <span className="text-[11px] leading-tight truncate">{tooltipData.trip.sourceAddress || "Unknown"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] text-red-400 font-bold w-8 shrink-0">TO</span>
              <span className="text-[11px] leading-tight truncate">{tooltipData.trip.destAddress || "Unknown"}</span>
            </div>
            {isDriver && tooltipData.trip.Vehicle?.vehicleNumber && (
              <div className="flex gap-2">
                <span className="text-[10px] text-[#D4AF37] font-bold w-8 shrink-0">VEH</span>
                <span className="text-[11px] leading-tight truncate">{tooltipData.trip.Vehicle.vehicleNumber}</span>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#111827]"></div>
        </div>
      )}
    </>
  );
}
