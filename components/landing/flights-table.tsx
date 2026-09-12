'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import Link from 'next/link';
import { Plane, AlertCircle, Search, Sparkles, Filter, Calendar } from 'lucide-react';

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

const CITY_CODE_MAP: Record<string, string> = {
  KHI: 'Karachi', ISB: 'Islamabad', LHE: 'Lahore', PEW: 'Peshawar',
  MUX: 'Multan', SKT: 'Sialkot', JED: 'Jeddah', MED: 'Madinah',
  RUH: 'Riyadh', DMM: 'Dammam', DXB: 'Dubai', SHJ: 'Sharjah',
  AUH: 'Abu Dhabi', RKT: 'Ras Al Khaimah', MCT: 'Muscat', DOH: 'Doha',
  MAN: 'Manchester', AHB: 'Abha',
};

function formatCityHelper(name: string): string {
  if (!name) return '';
  const clean = name.replace(/<[^>]*>/g, '').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const unique: string[] = [];
  for (const w of words) {
    if (unique.length === 0 || unique[unique.length - 1].toUpperCase() !== w.toUpperCase()) {
      unique.push(w);
    }
  }
  const firstCode = unique[0]?.toUpperCase() || '';
  if (CITY_CODE_MAP[firstCode]) return CITY_CODE_MAP[firstCode];
  const fullStr = unique.join(' ').toUpperCase();
  if (CITY_CODE_MAP[fullStr]) return CITY_CODE_MAP[fullStr];
  return unique.join(' ');
}

function getCategoryMeta(categoryName: string) {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('umrah')) {
    return {
      icon: '🕋',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      badgeBg: 'bg-emerald-600 text-white',
      accent: 'border-emerald-500',
    };
  }
  if (cat.includes('uae')) {
    return {
      icon: '🏙️',
      color: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
      badgeBg: 'bg-sky-600 text-white',
      accent: 'border-sky-500',
    };
  }
  if (cat.includes('saudi')) {
    return {
      icon: '🌴',
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      badgeBg: 'bg-amber-600 text-white',
      accent: 'border-amber-500',
    };
  }
  if (cat.includes('muscat')) {
    return {
      icon: '🇴🇲',
      color: 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60',
      badgeBg: 'bg-teal-600 text-white',
      accent: 'border-teal-500',
    };
  }
  if (cat.includes('qatar')) {
    return {
      icon: '🇶🇦',
      color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      badgeBg: 'bg-purple-600 text-white',
      accent: 'border-purple-500',
    };
  }
  if (cat.includes('uk')) {
    return {
      icon: '🇬🇧',
      color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      badgeBg: 'bg-rose-600 text-white',
      accent: 'border-rose-500',
    };
  }
  return {
    icon: '✈️',
    color: 'text-primary bg-primary/10 border-primary/20',
    badgeBg: 'bg-primary text-primary-foreground',
    accent: 'border-primary',
  };
}

export function FlightsTable() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
        console.error('Failed to fetch flights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // Distinct categories sorted logically
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    flights.forEach((f) => {
      if (f.category) catSet.add(f.category);
    });

    const standardOrder = [
      'Umrah Direct Flight',
      'UAE Direct Flight',
      'Saudi Direct Flight',
      'Muscat Direct Flight',
      'Qatar Direct Flight',
      'UK Direct Flight',
    ];

    const ordered: string[] = [];
    standardOrder.forEach((cat) => {
      if (catSet.has(cat)) ordered.push(cat);
    });
    catSet.forEach((cat) => {
      if (!ordered.includes(cat)) ordered.push(cat);
    });

    return ordered;
  }, [flights]);

  // Filter flights by category & search query
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const matchesCategory =
        selectedCategory === 'All' || f.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.departureCity.toLowerCase().includes(q) ||
        f.arrivalCity.toLowerCase().includes(q) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    });
  }, [flights, selectedCategory, searchQuery]);

  // Group filtered flights category-wise
  const groupedByCategory = useMemo(() => {
    const map: Record<string, FlightItem[]> = {};

    filteredFlights.forEach((flight) => {
      const catKey = flight.category || 'General Direct Flight';
      if (!map[catKey]) map[catKey] = [];
      map[catKey].push(flight);
    });

    return map;
  }, [filteredFlights]);

  const activeCategoryKeys = Object.keys(groupedByCategory);

  return (
    <section id="flights-schedule" className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category-Wise Live Flight Schedules</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Explore Flights by Category
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time group fares, verified schedules, and instant seat availability across Umrah, UAE, Saudi Arabia, and international routes.
          </p>
        </div>

        {/* Category Tabs & Quick Search */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                selectedCategory === 'All'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span>🌐 All Categories</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedCategory === 'All' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {flights.length}
              </span>
            </button>

            {availableCategories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = flights.filter((f) => f.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                      : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span>{meta.icon} {cat}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground px-2">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>Showing: <strong className="text-foreground">{filteredFlights.length} Flights</strong> in {selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sector, airline, flight #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
          </div>
        </div>

        {/* Flights Table Container */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl overflow-hidden text-foreground">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground font-bold flex items-center justify-center gap-3">
              <Plane className="w-6 h-6 animate-pulse text-primary" />
              <span>Fetching live category-wise schedules & fares...</span>
            </div>
          ) : activeCategoryKeys.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground space-y-2">
              <AlertCircle className="w-10 h-10 text-primary/40 mx-auto" />
              <p className="font-bold text-foreground text-base">No Flights Found in this Category</p>
              <p className="text-xs text-muted-foreground">Try clearing your search query or selecting another category.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider border-b border-primary-foreground/20">
                      <th className="py-4 px-6">Sector & Category</th>
                      <th className="py-4 px-6">Airline</th>
                      <th className="py-4 px-6">Flight No.</th>
                      <th className="py-4 px-6">Departure</th>
                      <th className="py-4 px-6">Arrival</th>
                      <th className="py-4 px-6">Baggage / Meal</th>
                      <th className="py-4 px-6 text-center">Synced Fare</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeCategoryKeys.map((catKey) => {
                      const meta = getCategoryMeta(catKey);
                      const catFlights = groupedByCategory[catKey];

                      return (
                        <Fragment key={catKey}>
                          {/* Category Header Row */}
                          <tr className="bg-muted/60 border-y-2 border-primary/20">
                            <td colSpan={8} className="py-3 px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">{meta.icon}</span>
                                  <span className="font-black text-foreground text-base tracking-wide uppercase">
                                    {catKey}
                                  </span>
                                  <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 bg-background rounded-md border border-border">
                                    {catFlights.length} flights
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-primary tracking-wider uppercase">
                                  Live Group Rates
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Flight Rows under this Category */}
                          {catFlights.map((flight) => {
                            const isAvailable = flight.availableSeats > 0;
                            const depDateStr = formatDate(flight.departureTime);
                            const depTimeStr = formatTime(flight.departureTime);
                            const arrDateStr = formatDate(flight.arrivalTime);
                            const arrTimeStr = formatTime(flight.arrivalTime);
                            const sectorStr = `${formatCityHelper(flight.departureCity)} → ${formatCityHelper(flight.arrivalCity)}`;
                            const fareAmount = (flight.currentFare || flight.pricePerSeat).toLocaleString();

                            return (
                              <tr
                                key={flight.id}
                                className="hover:bg-muted/30 transition-colors duration-200 border-b border-border/60"
                              >
                                {/* Sector & Category Badge */}
                                <td className="py-4 px-6">
                                  <div className="font-black text-foreground text-sm">{sectorStr}</div>
                                  <div className="mt-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.color}`}>
                                      {meta.icon} {flight.category || 'Direct Flight'}
                                    </span>
                                  </div>
                                </td>

                                {/* Airline */}
                                <td className="py-4 px-6 font-bold text-foreground tracking-wide">
                                  {flight.airline}
                                </td>

                                {/* Flight Number */}
                                <td className="py-4 px-6 font-mono font-bold text-foreground">
                                  {flight.flightNumber}
                                </td>

                                {/* Departure */}
                                <td className="py-4 px-6">
                                  <div className="font-bold text-foreground text-xs">{depDateStr}</div>
                                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{depTimeStr}</div>
                                </td>

                                {/* Arrival */}
                                <td className="py-4 px-6">
                                  <div className="font-bold text-foreground text-xs">{arrDateStr}</div>
                                  <div className="font-bold text-rose-600 dark:text-rose-400 text-xs mt-0.5">{arrTimeStr}</div>
                                </td>

                                {/* Baggage / Meal */}
                                <td className="py-4 px-6 text-xs">
                                  <div className="font-bold text-foreground">{flight.baggage || '20+7 KG'}</div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Meal: <strong className="text-foreground">{flight.meal ? 'Included' : 'No'}</strong>
                                  </div>
                                </td>

                                {/* Fare */}
                                <td className="py-4 px-6 text-center">
                                  <div className="font-black text-base text-primary">
                                    Rs {fareAmount}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-semibold">per seat</div>
                                </td>

                                {/* CTA */}
                                <td className="py-4 px-6 text-center">
                                  {isAvailable ? (
                                    <Link
                                      href="/login"
                                      className="inline-block px-5 py-2 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all uppercase tracking-wider"
                                    >
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {activeCategoryKeys.map((catKey) => {
                  const meta = getCategoryMeta(catKey);
                  const catFlights = groupedByCategory[catKey];

                  return (
                    <div key={catKey}>
                      {/* Category Banner for Mobile */}
                      <div className="bg-muted/60 p-4 border-y border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta.icon}</span>
                          <span className="font-black text-foreground text-sm uppercase">{catKey}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-background rounded-md border border-border">
                          {catFlights.length}
                        </span>
                      </div>

                      {/* Flight Cards under this category */}
                      {catFlights.map((flight) => {
                        const isAvailable = flight.availableSeats > 0;
                        const depDateStr = formatDate(flight.departureTime);
                        const depTimeStr = formatTime(flight.departureTime);
                        const arrDateStr = formatDate(flight.arrivalTime);
                        const arrTimeStr = formatTime(flight.arrivalTime);
                        const sectorStr = `${formatCityHelper(flight.departureCity)} → ${formatCityHelper(flight.arrivalCity)}`;
                        const fareAmount = (flight.currentFare || flight.pricePerSeat).toLocaleString();

                        return (
                          <div key={flight.id} className="p-4 space-y-3 border-b border-border/60">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="font-black text-foreground text-base tracking-wide">{sectorStr}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-bold text-xs text-primary">{flight.airline}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="font-mono text-xs font-bold text-muted-foreground">{flight.flightNumber}</span>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${meta.color} shrink-0`}>
                                {meta.icon} {flight.category || 'Direct Flight'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-xl border border-border/60 text-xs">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Departure</div>
                                <div className="font-bold text-foreground mt-0.5">{depDateStr}</div>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{depTimeStr}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Arrival</div>
                                <div className="font-bold text-foreground mt-0.5">{arrDateStr}</div>
                                <div className="font-bold text-rose-600 dark:text-rose-400 text-xs">{arrTimeStr}</div>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between text-[11px]">
                                <span className="text-muted-foreground">Bag: <strong className="text-foreground">{flight.baggage || '20+7 KG'}</strong></span>
                                <span className="text-muted-foreground">Meal: <strong className="text-foreground">{flight.meal ? 'Included' : 'No'}</strong></span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fare per seat</div>
                                <div className="font-black text-xl text-primary">Rs {fareAmount}</div>
                              </div>
                              <div className="w-1/2">
                                {isAvailable ? (
                                  <Link
                                    href="/login"
                                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md hover:bg-primary/90 transition-all block text-center uppercase tracking-wider"
                                  >
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
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
