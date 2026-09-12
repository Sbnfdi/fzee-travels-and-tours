'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plane, Search, CalendarDays, Sparkles, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

interface FlightItem {
  id: string;
  flightNumber: string;
  pnr: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  availableSeats: number;
  pricePerSeat: number;
  currentFare: number;
  aircraftType: string;
  baggage: string | null;
  meal: boolean;
  category: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
}

function getCategoryIcon(cat: string) {
  const c = (cat || '').toLowerCase();
  if (c.includes('umrah')) return '🕋';
  if (c.includes('uae')) return '🏙️';
  if (c.includes('saudi')) return '🌴';
  if (c.includes('muscat')) return '🇴🇲';
  if (c.includes('qatar')) return '🇶🇦';
  if (c.includes('uk')) return '🇬🇧';
  return '✈️';
}

export default function AgentFlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightsRes, categoriesRes] = await Promise.all([
          fetch('/api/flights'),
          fetch('/api/flights/categories'),
        ]);

        if (flightsRes.ok) {
          const data = await flightsRes.json();
          if (data.success && Array.isArray(data.flights)) {
            setFlights(data.flights);
          }
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
          }
        }
      } catch (err) {
        console.error('Error fetching flights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookFlight = (flightId: string) => {
    router.push(`/agent/flights/${flightId}/book`);
  };

  // Derive unique categories from flights if DB categories table is missing any
  const allCategoryNames = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => set.add(c.name));
    flights.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [categories, flights]);

  // 1. Filter by category, search query, date
  const filtered = useMemo(() => {
    return flights.filter((f) => {
      // Category filter
      if (activeTab !== 'All Categories' && f.category !== activeTab) {
        return false;
      }

      // Date filter
      if (filterDate) {
        const depDate = new Date(f.departureTime).toISOString().slice(0, 10);
        if (depDate !== filterDate) return false;
      }

      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          f.airline.toLowerCase().includes(q) ||
          f.departureCity.toLowerCase().includes(q) ||
          f.arrivalCity.toLowerCase().includes(q) ||
          f.flightNumber.toLowerCase().includes(q) ||
          (f.category && f.category.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [flights, activeTab, filterDate, search]);

  // 2. Group Category-Wise
  const groupedByCategory = useMemo(() => {
    const map: Record<string, FlightItem[]> = {};
    filtered.forEach((flight) => {
      const catKey = flight.category || 'Other Direct Flights';
      if (!map[catKey]) map[catKey] = [];
      map[catKey].push(flight);
    });
    return map;
  }, [filtered]);

  const activeCategoryKeys = Object.keys(groupedByCategory);

  return (
    <div className="space-y-6 text-foreground pb-20">
      
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-2 text-primary font-black text-lg">
          <Plane className="w-5 h-5 fill-current" />
          <span>FZEE AGENT TICKETING</span>
          <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full font-bold">Category-Wise</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Date filter */}
          <div className="relative w-full sm:w-auto">
            <CalendarDays className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs sm:text-sm border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground w-full"
              title="Filter by Departure Date"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-[10px] text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
              >
                ✕
              </button>
            )}
          </div>

          {/* Keyword Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by sector or airline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs sm:text-sm border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('All Categories')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'All Categories' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'bg-card text-muted-foreground border border-border hover:bg-muted'
          }`}
        >
          🌐 All Categories ({flights.length})
        </button>
        {allCategoryNames.map((catName) => {
          const count = flights.filter((f) => f.category === catName).length;
          return (
            <button
              key={catName}
              onClick={() => setActiveTab(catName)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === catName 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              }`}
            >
              {getCategoryIcon(catName)} {catName} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Table Organized Category-Wise */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground uppercase text-[11px] font-bold">
                <th className="px-4 py-3">Flight# & Sector</th>
                <th className="px-4 py-3">Airline & Category</th>
                <th className="px-4 py-3">Schedule (Dep / Arr)</th>
                <th className="px-4 py-3">Baggage & Meal</th>
                <th className="px-4 py-3">Fare (PKR)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold">
                    <Plane className="w-6 h-6 animate-pulse text-primary mx-auto mb-2" />
                    Loading category-wise flight schedules...
                  </td>
                </tr>
              </tbody>
            ) : activeCategoryKeys.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground font-bold">
                    No flights found matching your criteria.
                  </td>
                </tr>
              </tbody>
            ) : (
              activeCategoryKeys.map((catKey) => {
                const catFlights = groupedByCategory[catKey];
                const icon = getCategoryIcon(catKey);

                return (
                  <tbody key={catKey} className="divide-y divide-border/40">
                    {/* Category Header Row */}
                    <tr className="bg-muted/70 border-y-2 border-primary/20">
                      <td colSpan={6} className="py-2.5 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                            <span className="text-lg">{icon}</span>
                            <span className="text-foreground uppercase tracking-wide">{catKey}</span>
                            <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 bg-background rounded-md border border-border">
                              {catFlights.length} {catFlights.length === 1 ? 'Flight' : 'Flights'}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-primary tracking-wider uppercase">
                            Instant Agent Booking
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Flight Rows */}
                    {catFlights.map((f, i) => (
                      <tr
                        key={f.id}
                        className={`hover:bg-muted/30 transition ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}
                      >
                        {/* Flight# & Sector */}
                        <td className="px-4 py-3 font-bold text-foreground">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                            <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{f.flightNumber}</span>
                          </div>
                          <div className="text-xs font-extrabold text-foreground mt-0.5">
                            {f.departureCity} → {f.arrivalCity}
                          </div>
                        </td>

                        {/* Airline & Category Badge */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-foreground text-xs">{f.airline}</div>
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {icon} {f.category || 'Direct Flight'}
                            </span>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="px-4 py-3 text-xs">
                          <div className="font-bold text-foreground">
                            <span className="text-muted-foreground mr-1">Dep:</span> 
                            {formatDate(f.departureTime)} 
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1.5">
                              {formatTime(f.departureTime)}
                            </span>
                          </div>
                          <div className="font-bold text-foreground mt-1">
                            <span className="text-muted-foreground mr-1">Arr:</span> 
                            {formatDate(f.arrivalTime)} 
                            <span className="text-rose-600 dark:text-rose-400 font-extrabold ml-1.5">
                              {formatTime(f.arrivalTime)}
                            </span>
                          </div>
                        </td>

                        {/* Baggage & Meal */}
                        <td className="px-4 py-3 text-xs">
                          <div className="font-bold text-foreground">Bag: {f.baggage || '20+7 KG'}</div>
                          <div className="text-muted-foreground text-[11px] mt-0.5">
                            Meal: <strong className="text-foreground">{f.meal ? 'Included' : 'No'}</strong>
                          </div>
                        </td>

                        {/* Fare */}
                        <td className="px-4 py-3 font-black text-primary text-sm sm:text-base">
                          PKR {(f.currentFare || f.pricePerSeat).toLocaleString()}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleBookFlight(f.id)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-xl shadow-xs font-bold text-xs sm:text-sm transition uppercase tracking-wider"
                          >
                            Book now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
