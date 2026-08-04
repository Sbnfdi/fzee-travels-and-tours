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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-[#F07A30] font-bold text-lg">
          <Plane className="w-5 h-5 fill-current" />
          <span>FZEE TICKETING</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
            Advance Search
          </label>
          <div className="relative">
            <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="date" className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#1C4E80]" />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#1C4E80] w-48"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('All Types')}
          className={`whitespace-nowrap px-4 py-2 rounded border text-sm font-semibold transition ${
            activeTab === 'All Types' 
              ? 'bg-[#1C4E80] text-white border-[#1C4E80]' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Types
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`whitespace-nowrap px-4 py-2 rounded border text-sm font-semibold transition ${
              activeTab === cat.name 
                ? 'bg-[#1C4E80] text-white border-[#1C4E80]' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#1C4E80] text-white">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Flight#</th>
                <th className="px-4 py-3 font-semibold">Origin-Destination</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Baggage</th>
                <th className="px-4 py-3 font-semibold">Meal</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading flights...</td>
                </tr>
              </tbody>
            ) : Object.keys(grouped).length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No flights found matching your criteria.</td>
                </tr>
              </tbody>
            ) : (
              Object.values(grouped).map((group, gIndex) => (
                <tbody key={gIndex}>
                  {/* Group Header */}
                  <tr className="bg-[#fdf8f5] border-b border-slate-100">
                    <td colSpan={8} className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-black text-lg">
                        <span className="text-[#e20613]">{group.airline}</span>
                        <span className="text-slate-800">{group.route}</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Flight Rows */}
                  {group.flights.map((f, i) => (
                    <tr key={f.id} className={`border-b border-slate-100 hover:bg-blue-50/50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-4 py-3 text-[#147b91] font-semibold flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5" />
                        {formatDate(f.departureTime)}
                      </td>
                      <td className="px-4 py-3 font-medium">{f.flightNumber}</td>
                      <td className="px-4 py-3">{f.departureCity}-{f.arrivalCity}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatTime(f.departureTime)}-{formatTime(f.arrivalTime)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">{f.baggage || '20 KG'}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{f.meal ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">PKR {(f.currentFare || f.pricePerSeat).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleBookFlight(f.id)}
                          className="bg-[#F07A30] hover:bg-[#d96620] text-white px-5 py-1.5 rounded shadow-sm font-bold text-sm transition"
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
