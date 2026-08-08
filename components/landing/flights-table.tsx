'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, CalendarDays, AlertCircle } from 'lucide-react';

interface FlightItem {
  id: string;
  flightNumber: string;
  pnr?: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  currentFare: number;
  baggage?: string | null;
  meal?: boolean;
  category?: string | null;
  status?: string;
}

export function FlightsTable() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/flights');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.flights)) {
            // Filter only active flights
            setFlights(data.flights.filter((f: FlightItem) => f.status !== 'cancelled'));
          }
        }
      } catch (err) {
        console.error('Failed to fetch homepage flights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  // Group flights dynamically by airline
  const grouped = flights.reduce((acc, flight) => {
    const key = flight.airline || 'Other Airlines';
    if (!acc[key]) acc[key] = [];
    acc[key].push(flight);
    return acc;
  }, {} as Record<string, FlightItem[]>);

  const airlineNames = Object.keys(grouped);

  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="w-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
          <div className="w-full">
            
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:flex bg-primary text-primary-foreground flex-wrap text-sm font-bold uppercase py-4 px-6 tracking-widest border-b border-primary-foreground/20">
              <div className="w-1/6">Date</div>
              <div className="w-1/6">Sector</div>
              <div className="w-1/6">Airline</div>
              <div className="w-1/6">FLT No.</div>
              <div className="w-[10%]">DEP</div>
              <div className="w-[10%]">ARR</div>
              <div className="w-1/6 text-center">FARE</div>
              <div className="flex-1 text-center">BOOK</div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-16 text-center text-white/70 font-bold flex items-center justify-center gap-3">
                <Plane className="w-6 h-6 animate-pulse text-primary" />
                <span>Fetching Live Published Schedules...</span>
              </div>
            ) : airlineNames.length === 0 ? (
              <div className="py-16 text-center text-white/60 space-y-2">
                <AlertCircle className="w-10 h-10 text-white/30 mx-auto" />
                <p className="font-bold text-white text-base">No Published Flights Available</p>
                <p className="text-xs text-white/50">Check back soon for new flight schedules published by admins.</p>
              </div>
            ) : (
              /* Dynamic Table Body */
              <div className="divide-y divide-white/10">
                {airlineNames.map((airline, groupIdx) => (
                  <div key={groupIdx}>
                    {/* Airline Section Header */}
                    <div className="bg-white/5 py-4 px-4 sm:px-6 flex justify-center border-y border-white/10">
                      <div className="flex items-center justify-center h-10 px-8 bg-white/10 rounded-lg border border-white/20 shadow-inner">
                        <span className="font-black text-white text-lg tracking-[0.2em] uppercase drop-shadow-sm">{airline}</span>
                      </div>
                    </div>

                    {/* Flights List */}
                    {grouped[airline].map((flight) => {
                      const isAvailable = flight.availableSeats > 0;
                      const dateStr = formatDate(flight.departureTime);
                      const sectorStr = `${flight.departureCity}-${flight.arrivalCity}`;
                      const depTime = formatTime(flight.departureTime);
                      const arrTime = formatTime(flight.arrivalTime);
                      const fareAmount = (flight.currentFare || flight.pricePerSeat).toLocaleString();

                      return (
                        <div key={flight.id} className="flex flex-col md:flex-row md:items-center text-sm py-4 px-4 sm:px-6 hover:bg-white/10 transition-colors duration-200 gap-4 md:gap-0">
                          
                          {/* Mobile Top Row: Sector, Date, Flt No */}
                          <div className="flex justify-between items-center md:hidden border-b border-white/10 pb-3">
                            <div>
                              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Sector</div>
                              <div className="font-bold text-white tracking-wide text-lg">{sectorStr}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Date</div>
                              <div className="font-medium text-white/90">{dateStr}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Flight</div>
                              <div className="font-bold text-white">{flight.flightNumber}</div>
                            </div>
                          </div>

                          {/* Desktop Grid Columns */}
                          <div className="hidden md:block w-1/6 font-medium text-white/90">{dateStr}</div>
                          <div className="hidden md:block w-1/6 font-bold text-white tracking-wide">{sectorStr}</div>
                          <div className="hidden md:block w-1/6 text-white/60 font-medium uppercase tracking-wider">{airline}</div>
                          <div className="hidden md:block w-1/6 font-bold text-white">{flight.flightNumber}</div>
                          
                          {/* Mobile & Desktop: DEP / ARR / FARE */}
                          <div className="flex justify-between items-center md:hidden">
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="font-bold text-[#4ade80] drop-shadow-sm text-xl">{depTime}</div>
                              </div>
                              <Plane className="w-5 h-5 text-white/30 rotate-45" />
                              <div className="text-center">
                                <div className="font-bold text-[#f87171] drop-shadow-sm text-xl">{arrTime}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Fare</div>
                              <div className="font-black text-xl text-white">Rs {fareAmount}</div>
                            </div>
                          </div>

                          <div className="hidden md:block w-[10%] font-bold text-[#4ade80] drop-shadow-sm">{depTime}</div>
                          <div className="hidden md:block w-[10%] font-bold text-[#f87171] drop-shadow-sm">{arrTime}</div>
                          <div className="hidden md:block w-1/6 text-center font-black text-lg text-white">Rs {fareAmount}</div>
                          
                          {/* Mobile & Desktop: Book Button */}
                          <div className="w-full md:flex-1 flex justify-center mt-2 md:mt-0">
                            {isAvailable ? (
                              <Link href="/login" className="px-5 py-3 md:py-2 bg-primary text-primary-foreground text-sm md:text-xs font-black rounded-full shadow-lg hover:shadow-primary/50 hover:bg-primary/90 hover:-translate-y-0.5 transition-all block text-center w-full md:max-w-[120px] uppercase tracking-wider">
                                Book Now
                              </Link>
                            ) : (
                              <span className="px-5 py-3 md:py-2 bg-white/10 border border-white/20 text-white/50 text-sm md:text-xs font-bold rounded-full block text-center w-full md:max-w-[120px] cursor-not-allowed uppercase tracking-wider">
                                Sold Out
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </section>
  );
}
