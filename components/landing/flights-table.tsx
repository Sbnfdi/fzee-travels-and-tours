'use client';

import { useState, useEffect, Fragment } from 'react';
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // Group flights by airline
  const grouped = flights.reduce((acc, flight) => {
    const key = flight.airline || 'Other';
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
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider border-b border-primary-foreground/20 shadow-sm">
                        <th className="py-4 px-6">Sector</th>
                        <th className="py-4 px-6">Airline</th>
                        <th className="py-4 px-6">FLT No.</th>
                        <th className="py-4 px-6">Departure Date & Time</th>
                        <th className="py-4 px-6">Arrival Date & Time</th>
                        <th className="py-4 px-6 text-center">Fare</th>
                        <th className="py-4 px-6 text-center">Book</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {airlineNames.map((airline, groupIdx) => (
                        <Fragment key={groupIdx}>
                          {/* Airline Section Row */}
                          <tr className="bg-muted/40 border-y border-border">
                            <td colSpan={7} className="py-3 px-6 text-center">
                              <div className="inline-flex items-center justify-center h-9 px-6 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
                                <span className="font-black text-primary text-base tracking-[0.2em] uppercase drop-shadow-sm">{airline}</span>
                              </div>
                            </td>
                          </tr>

                          {/* Flight Rows */}
                          {grouped[airline].map((flight) => {
                            const isAvailable = flight.availableSeats > 0;
                            const depDateStr = formatDate(flight.departureTime);
                            const depTimeStr = formatTime(flight.departureTime);
                            const arrDateStr = formatDate(flight.arrivalTime);
                            const arrTimeStr = formatTime(flight.arrivalTime);
                            const sectorStr = `${flight.departureCity}-${flight.arrivalCity}`;
                            const fareAmount = (flight.currentFare || flight.pricePerSeat).toLocaleString();

                            return (
                              <tr key={flight.id} className="hover:bg-muted/30 transition-colors duration-200 border-b border-border/60">
                                <td className="py-4 px-6 font-black text-foreground">{sectorStr}</td>
                                <td className="py-4 px-6 text-muted-foreground font-semibold uppercase tracking-wider">{airline}</td>
                                <td className="py-4 px-6 font-bold text-foreground font-mono">{flight.flightNumber}</td>
                                <td className="py-4 px-6">
                                  <div className="font-bold text-foreground text-xs">{depDateStr}</div>
                                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{depTimeStr}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-bold text-foreground text-xs">{arrDateStr}</div>
                                  <div className="font-bold text-rose-600 dark:text-rose-400">{arrTimeStr}</div>
                                </td>
                                <td className="py-4 px-6 text-center font-black text-base text-primary">Rs {fareAmount}</td>
                                <td className="py-4 px-6 text-center">
                                  {isAvailable ? (
                                    <Link href="/login" className="inline-block px-5 py-2 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all uppercase tracking-wider">
                                      Book
                                    </Link>
                                  ) : (
                                    <span className="inline-block px-4 py-2 bg-muted text-muted-foreground text-xs font-bold rounded-xl border border-border uppercase tracking-wider">
                                      Sold Out
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                  {airlineNames.map((airline, groupIdx) => (
                    <div key={groupIdx}>
                      <div className="bg-muted/40 py-3.5 px-4 flex justify-center border-y border-border">
                        <div className="flex items-center justify-center h-10 px-8 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
                          <span className="font-black text-primary text-lg tracking-[0.2em] uppercase drop-shadow-sm">{airline}</span>
                        </div>
                      </div>

                      {grouped[airline].map((flight) => {
                        const isAvailable = flight.availableSeats > 0;
                        const depDateStr = formatDate(flight.departureTime);
                        const depTimeStr = formatTime(flight.departureTime);
                        const arrDateStr = formatDate(flight.arrivalTime);
                        const arrTimeStr = formatTime(flight.arrivalTime);
                        const sectorStr = `${flight.departureCity}-${flight.arrivalCity}`;
                        const fareAmount = (flight.currentFare || flight.pricePerSeat).toLocaleString();

                        return (
                          <div key={flight.id} className="p-4 space-y-3 border-b border-border/60">
                            <div className="flex justify-between items-center border-b border-border pb-2">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Sector</div>
                                <div className="font-black text-foreground tracking-wide text-lg">{sectorStr}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Flight</div>
                                <div className="font-bold text-foreground font-mono">{flight.flightNumber}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-muted/40 p-3 rounded-xl border border-border/60 text-xs">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Departure</div>
                                <div className="font-bold text-foreground">{depDateStr}</div>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{depTimeStr}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Arrival</div>
                                <div className="font-bold text-foreground">{arrDateStr}</div>
                                <div className="font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">{arrTimeStr}</div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Fare</div>
                                <div className="font-black text-xl text-primary">Rs {fareAmount}</div>
                              </div>
                              <div className="w-1/2">
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
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
            
          </div>
        </div>

      </div>
    </section>
  );
}
