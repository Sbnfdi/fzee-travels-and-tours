'use client';

import { useState, useEffect, Fragment } from 'react';
import { Plane, Search, CalendarDays } from 'lucide-react';
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

export default function AgentFlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Types');
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightsRes, categoriesRes] = await Promise.all([
          fetch('/api/flights'),
          fetch('/api/flights/categories')
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookFlight = (flightId: string) => {
    router.push(`/agent/flights/${flightId}/book`);
  };

  // 1. Filter by category
  let filtered = flights;
  if (activeTab !== 'All Types') {
    filtered = filtered.filter(f => f.category === activeTab);
  }

  // 2. Filter by search
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.airline.toLowerCase().includes(q) ||
        f.departureCity.toLowerCase().includes(q) ||
        f.arrivalCity.toLowerCase().includes(q) ||
        f.flightNumber.toLowerCase().includes(q)
    );
  }

  // 3. Group by airline + route
  const grouped = filtered.reduce((acc, flight) => {
    const route = `${flight.departureCity}-${flight.arrivalCity}`;
    const key = `${flight.airline}__${route}`;
    if (!acc[key]) {
      acc[key] = { airline: flight.airline, route, flights: [] };
    }
    acc[key].flights.push(flight);
    return acc;
  }, {} as Record<string, { airline: string; route: string; flights: FlightItem[] }>);

  return (
    <div className="space-y-6 text-foreground pb-20">
      
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <Plane className="w-5 h-5 fill-current" />
          <span>FZEE TICKETING</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center justify-between sm:justify-start gap-2 text-sm text-muted-foreground font-medium cursor-pointer">
            <span className="sm:hidden font-bold">Advance Search</span>
            <input type="checkbox" className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20" />
            <span className="hidden sm:inline">Advance Search</span>
          </label>
          <div className="relative w-full sm:w-auto">
            <CalendarDays className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="date" className="pl-9 pr-3 py-2 sm:py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground w-full" />
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 sm:py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('All Types')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'All Types' 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          All Types
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === cat.name 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground uppercase text-[11px] font-bold">
                <th className="px-3 py-3">Flight# & Sector</th>
                <th className="px-3 py-3">Schedule (Dep / Arr)</th>
                <th className="px-3 py-3">Baggage & Meal</th>
                <th className="px-3 py-3">Fare (PKR)</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-bold">Loading flights...</td>
                </tr>
              </tbody>
            ) : Object.keys(grouped).length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-bold">No flights found matching your criteria.</td>
                </tr>
              </tbody>
            ) : (
              Object.values(grouped).map((group, gIndex) => (
                <tbody key={gIndex}>
                  {/* Group Header */}
                  <tr className="bg-muted/40 border-b border-border/60">
                    <td colSpan={5} className="py-2.5 px-4">
                      <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                        <span className="text-primary">{group.airline}</span>
                        <span className="text-foreground">— {group.route}</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Flight Rows */}
                  {group.flights.map((f, i) => (
                    <tr key={f.id} className={`border-b border-border/40 hover:bg-muted/20 transition ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                      <td className="px-3 py-3 font-bold text-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                          <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{f.flightNumber}</span>
                        </div>
                        <div className="text-xs font-semibold text-primary mt-0.5">{f.departureCity} → {f.arrivalCity}</div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="font-bold text-foreground">
                          <span className="text-muted-foreground mr-1">Dep:</span> 
                          {formatDate(f.departureTime)} 
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1.5">{formatTime(f.departureTime)}</span>
                        </div>
                        <div className="font-bold text-foreground mt-1">
                          <span className="text-muted-foreground mr-1">Arr:</span> 
                          {formatDate(f.arrivalTime)} 
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold ml-1.5">{formatTime(f.arrivalTime)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="font-bold text-foreground">Bag: {f.baggage || '20 KG'}</div>
                        <div className="text-muted-foreground text-[11px] mt-0.5">Meal: <strong className="text-foreground">{f.meal ? 'Included' : 'No'}</strong></div>
                      </td>
                      <td className="px-3 py-3 font-black text-primary text-sm sm:text-base">
                        PKR {(f.currentFare || f.pricePerSeat).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleBookFlight(f.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg shadow-sm font-bold text-xs sm:text-sm transition"
                        >
                          Book now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
