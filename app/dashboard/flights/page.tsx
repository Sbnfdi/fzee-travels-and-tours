'use client';

import { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, CheckCircle2, TrendingUp, X } from 'lucide-react';

interface FareTier {
  upToSeat: number;
  price: number;
}

interface FlightItem {
  id: string;
  flightNumber: string;
  pnr: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  pricePerSeat: number;
  currentFare: number;
  totalSeats: number;
  availableSeats: number;
  fareTiers: string | null;
  baggage: string | null;
  meal: boolean;
  category: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
}

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All Types');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // New category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Form fields
  const [flightNumber, setFlightNumber] = useState('');
  const [pnr, setPnr] = useState('');
  const [airline, setAirline] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState(100000);
  const [totalSeats, setTotalSeats] = useState(200);

  // Additional fields
  const [baggage, setBaggage] = useState('20 KG');
  const [meal, setMeal] = useState(false);
  const [category, setCategory] = useState('All Types');

  // Fare tiers
  const [fareTiers, setFareTiers] = useState<FareTier[]>([
    { upToSeat: 100, price: 90000 },
    { upToSeat: 200, price: 120000 },
  ]);

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

  useEffect(() => {
    fetchData();
  }, []);

  const addTier = () => {
    setFareTiers(prev => [...prev, { upToSeat: totalSeats, price: pricePerSeat }]);
  };

  const removeTier = (idx: number) => {
    setFareTiers(prev => prev.filter((_, i) => i !== idx));
  };

  const updateTier = (idx: number, field: 'upToSeat' | 'price', value: number) => {
    setFareTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const resetForm = () => {
    setFlightNumber(''); setPnr(''); setAirline('');
    setDepartureCity(''); setArrivalCity('');
    setPricePerSeat(100000); setTotalSeats(200);
    setFareTiers([{ upToSeat: 100, price: 90000 }, { upToSeat: 200, price: 120000 }]);
    setBaggage('20 KG'); setMeal(false); setCategory('All Types');
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightNumber, pnr, airline, departureCity, arrivalCity,
          departureTime: new Date().toISOString(),
          arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          duration: 360, totalSeats, availableSeats: totalSeats, pricePerSeat,
          fareTiers: fareTiers.length > 0 ? JSON.stringify(fareTiers) : undefined,
          baggage, meal, category,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setMessage('Flight schedule added successfully!');
        resetForm();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (!confirm('Remove this flight from schedule?')) return;

    try {
      const res = await fetch(`/api/flights?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Flight removed from schedule.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch('/api/flights/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.ok) {
        setNewCategoryName('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete the "${name}" category? Flights in this category will remain, but won't be filtered.`)) return;
    try {
      const res = await fetch(`/api/flights/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeCategory === name) setActiveCategory('All Types');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parseTiers = (tiersStr: string | null): FareTier[] => {
    if (!tiersStr) return [];
    try { return JSON.parse(tiersStr); } catch { return []; }
  };

  const filteredFlights = flights.filter(f => activeCategory === 'All Types' || f.category === activeCategory);

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Flight Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage airline ticket blocks, dynamic fare tiers, and flight categories</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Flight</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs and Add Category */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-card p-4 rounded-2xl border border-border">
        <div className="flex overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto gap-2">
          <button
            onClick={() => setActiveCategory('All Types')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeCategory === 'All Types' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All Types
          </button>
          
          {categories.map(cat => (
            <div key={cat.id} className="relative group flex items-center shrink-0">
              <button
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors pr-8 ${
                  activeCategory === cat.name ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.name}
              </button>
              <button 
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className={`absolute right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeCategory === cat.name ? 'text-primary-foreground hover:bg-black/20' : 'text-muted-foreground hover:bg-black/10'
                }`}
                title="Delete Category"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 w-full sm:w-auto shrink-0">
          <input
            type="text"
            placeholder="New Category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" disabled={addingCategory || !newCategoryName.trim()} className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 disabled:opacity-50 transition">
            Add
          </button>
        </form>
      </div>

      {/* Add Flight Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Flight Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <form onSubmit={handleAddFlight} className="space-y-4">
              {/* Flight # & PNR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Flight #</label>
                  <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="PK-735" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">PNR Code</label>
                  <input type="text" value={pnr} onChange={(e) => setPnr(e.target.value.toUpperCase())} placeholder="ABC123" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              {/* Airline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Airline</label>
                <input type="text" value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="PIA" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>

              {/* Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">From</label>
                  <input type="text" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} placeholder="Lahore" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">To</label>
                  <input type="text" value={arrivalCity} onChange={(e) => setArrivalCity(e.target.value)} placeholder="Jeddah" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>

              {/* Seats & Base Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Total Seats</label>
                  <input type="number" value={totalSeats} onChange={(e) => setTotalSeats(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Base Price (PKR)</label>
                  <input type="number" value={pricePerSeat} onChange={(e) => setPricePerSeat(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>

              {/* Baggage, Meal, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Baggage</label>
                  <input type="text" value={baggage} onChange={(e) => setBaggage(e.target.value)} placeholder="20+7 KG" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Meal</label>
                  <select value={meal ? 'yes' : 'no'} onChange={(e) => setMeal(e.target.value === 'yes')} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="All Types">All Types</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fare Fluctuation Tiers */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">Fare Fluctuation Tiers</label>
                  </div>
                  <button type="button" onClick={addTier} className="text-xs font-bold text-primary hover:underline">+ Add Tier</button>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">Define price tiers based on seats sold.</p>

                {fareTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap shrink-0 w-16">Tier {idx + 1}</span>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Up to seat #</label>
                      <input
                        type="number"
                        value={tier.upToSeat}
                        onChange={(e) => updateTier(idx, 'upToSeat', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min={1}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Fare (PKR)</label>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(idx, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min={0}
                      />
                    </div>
                    {fareTiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(idx)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition mt-4 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50">{saving ? 'Saving...' : 'Save Flight'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3.5 border border-input font-bold rounded-xl hover:bg-muted text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flights Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading...</div>
        ) : filteredFlights.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Plane className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Flights Found</p>
            <p className="text-xs">Adjust your category filters or add a new flight.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground whitespace-nowrap">
                  <th className="px-6 py-4">Flight #</th>
                  <th className="px-6 py-4">PNR</th>
                  <th className="px-6 py-4">Airline</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Seats</th>
                  <th className="px-6 py-4">Baggage</th>
                  <th className="px-6 py-4">Meal</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Fare</th>
                  <th className="px-6 py-4">Tiers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((f) => {
                  const tiers = parseTiers(f.fareTiers);
                  const seatsSold = f.totalSeats - f.availableSeats;
                  return (
                    <tr key={f.id} className="border-b border-border/60 hover:bg-muted/20">
                      <td className="px-6 py-4 font-bold text-foreground font-mono whitespace-nowrap">{f.flightNumber}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground whitespace-nowrap">{f.pnr || '—'}</td>
                      <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">{f.airline}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{f.departureCity} → {f.arrivalCity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-foreground">{f.availableSeats}</span>
                        <span className="text-muted-foreground text-xs">/{f.totalSeats}</span>
                        <span className="text-xs text-muted-foreground ml-1">({seatsSold} sold)</span>
                      </td>
                      <td className="px-6 py-4 text-foreground whitespace-nowrap">{f.baggage || '—'}</td>
                      <td className="px-6 py-4 text-foreground whitespace-nowrap">{f.meal ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 text-foreground whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-bold">{f.category || 'None'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-black text-primary">PKR {f.currentFare?.toLocaleString()}</span>
                        {f.currentFare !== f.pricePerSeat && (
                          <span className="block text-[10px] text-muted-foreground">Base: PKR {f.pricePerSeat.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tiers.length > 0 ? (
                          <div className="space-y-0.5">
                            {tiers.map((t, i) => (
                              <div key={i} className="text-[10px] text-muted-foreground">
                                <span className="font-bold">≤{t.upToSeat}:</span> PKR {t.price.toLocaleString()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Fixed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => handleDeleteFlight(f.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition" title="Remove flight">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
