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
        
        <div className="w-full bg-card border border-border shadow-2xl rounded-2xl overflow-hidden text-foreground">
          <div className="w-full">
            
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 items-center bg-primary text-primary-foreground text-xs font-black uppercase py-4 px-6 tracking-widest border-b border-primary-foreground/20 shadow-md">
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Sector</div>
              <div className="col-span-2">Airline</div>
              <div className="col-span-1">FLT No.</div>
              <div className="col-span-1">DEP</div>
              <div className="col-span-1">ARR</div>
              <div className="col-span-2 text-center">Fare</div>
              <div className="col-span-1 text-center">Book</div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-16 text-center text-muted-foreground font-bold flex items-center justify-center gap-3">
                <Plane className="w-6 h-6 animate-pulse text-primary" />
                <span>Fetching Live Published Schedules...</span>
              </div>
            ) : airlineNames.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-2">
                <AlertCircle className="w-10 h-10 text-primary/40 mx-auto" />
                <p className="font-bold text-foreground text-base">No Published Flights Available</p>
                <p className="text-xs text-muted-foreground">Check back soon for new flight schedules published by admins.</p>
              </div>
            ) : (
              /* Dynamic Table Body */
              <div className="divide-y divide-border">
                {airlineNames.map((airline, groupIdx) => (
                  <div key={groupIdx}>
                    {/* Airline Section Header */}
                    <div className="bg-muted/40 py-3.5 px-4 sm:px-6 flex justify-center border-y border-border">
                      <div className="flex items-center justify-center h-10 px-8 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
                        <span className="font-black text-primary text-lg tracking-[0.2em] uppercase drop-shadow-sm">{airline}</span>
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
                        <div key={flight.id} className="py-4 px-4 sm:px-6 hover:bg-muted/30 transition-colors duration-200 border-b border-border/60 last:border-b-0">
                          
                          {/* Mobile Layout */}
                          <div className="md:hidden flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-border pb-3">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Sector</div>
                                <div className="font-black text-foreground tracking-wide text-lg">{sectorStr}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Date</div>
                                <div className="font-medium text-foreground">{dateStr}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Flight</div>
                                <div className="font-bold text-foreground font-mono">{flight.flightNumber}</div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-6">
                                <div className="text-center">
                                  <div className="font-bold text-emerald-600 dark:text-emerald-400 drop-shadow-sm text-xl">{depTime}</div>
                                </div>
                                <Plane className="w-5 h-5 text-muted-foreground/40 rotate-45" />
                                <div className="text-center">
                                  <div className="font-bold text-rose-600 dark:text-rose-400 drop-shadow-sm text-xl">{arrTime}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Fare</div>
                                <div className="font-black text-xl text-primary">Rs {fareAmount}</div>
                              </div>
                            </div>

                            <div className="w-full mt-2">
                              {isAvailable ? (
                                <Link href="/login" className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all block text-center uppercase tracking-wider">
                                  Book Now
                                </Link>
                              ) : (
                                <span className="px-5 py-2.5 bg-muted text-muted-foreground border border-border text-xs font-bold rounded-xl block text-center cursor-not-allowed uppercase tracking-wider">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Desktop Grid Columns */}
                          <div className="hidden md:grid grid-cols-12 items-center text-sm">
                            <div className="col-span-2 font-medium text-foreground">{dateStr}</div>
                            <div className="col-span-2 font-black text-foreground tracking-wide">{sectorStr}</div>
                            <div className="col-span-2 text-muted-foreground font-semibold uppercase tracking-wider">{airline}</div>
                            <div className="col-span-1 font-bold text-foreground font-mono">{flight.flightNumber}</div>
                            <div className="col-span-1 font-bold text-emerald-600 dark:text-emerald-400">{depTime}</div>
                            <div className="col-span-1 font-bold text-rose-600 dark:text-rose-400">{arrTime}</div>
                            <div className="col-span-2 text-center font-black text-base text-primary">Rs {fareAmount}</div>
                            <div className="col-span-1 flex justify-center">
                              {isAvailable ? (
                                <Link href="/login" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all block text-center uppercase tracking-wider">
                                  Book
                                </Link>
                              ) : (
                                <span className="px-3 py-2 bg-muted text-muted-foreground text-xs font-bold rounded-xl border border-border uppercase tracking-wider">
                                  Sold Out
                                </span>
                              )}
                            </div>
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
