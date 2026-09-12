'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plane, Plus, Trash2, CheckCircle2, TrendingUp, X, Edit, Ban, RotateCcw } from 'lucide-react';

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
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
  currentFare: number;
  totalSeats: number;
  availableSeats: number;
  fareTiers: string | null;
  baggage: string | null;
  meal: boolean;
  category: string | null;
  status: string;
  updatedAt?: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

function formatTimeAgo(dateString: string | null | undefined, now: number): string | null {
  if (!dateString) return null;
  const ms = now - new Date(dateString).getTime();
  if (ms < 0) return 'Just now';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatNextCountdown(nextIso: string | null | undefined, now: number): string | null {
  if (!nextIso) return null;
  const diffMs = new Date(nextIso).getTime() - now;
  if (diffMs <= 0) return 'Due now';
  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All Types');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  // Tick live timer every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Distinct category names that strictly have at least 1 flight (never show 0-flight categories)
  const allCategoryNames = useMemo(() => {
    const counts: Record<string, number> = {};
    flights.forEach(f => {
      if (f.category) counts[f.category] = (counts[f.category] || 0) + 1;
    });

    const standardOrder = [
      'Umrah Return Flight',
      'Umrah Direct Flight',
      'Saudi Direct Flight',
      'UAE Direct Flight',
      'Muscat Direct Flight',
      'Bahrain Direct Flight',
      'Kuwait Direct Flight',
      'UK Direct Flight',
    ];

    const validWithFlights = Object.keys(counts).filter(cat => (counts[cat] || 0) > 0);
    const sorted = [
      ...standardOrder.filter(c => validWithFlights.includes(c)),
      ...validWithFlights.filter(c => !standardOrder.includes(c)).sort(),
    ];

    return sorted;
  }, [flights]);
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
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

  // Date & Time fields
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

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
      const [flightsRes, categoriesRes, syncRes] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/flights/categories'),
        fetch('/api/admin/flights/sync').catch(() => null),
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

      if (syncRes && syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.scheduler) {
          setSyncScheduler(syncData.scheduler);
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
    setEditingFlightId(null);
    setFlightNumber(''); setPnr(''); setAirline('');
    setDepartureCity(''); setArrivalCity('');
    setPricePerSeat(100000); setTotalSeats(200);

    const now = new Date();
    const depDefault = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const arrDefault = new Date(now.getTime() + (24 + 5) * 60 * 60 * 1000).toISOString().slice(0, 16);
    setDepartureTime(depDefault);
    setArrivalTime(arrDefault);

    setFareTiers([{ upToSeat: 100, price: 90000 }, { upToSeat: 200, price: 120000 }]);
    setBaggage('20 KG'); setMeal(false); setCategory('All Types');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditFlight = (f: FlightItem) => {
    setEditingFlightId(f.id);
    setFlightNumber(f.flightNumber || '');
    setPnr(f.pnr || '');
    setAirline(f.airline || '');
    setDepartureCity(f.departureCity || '');
    setArrivalCity(f.arrivalCity || '');
    setDepartureTime(f.departureTime ? new Date(f.departureTime).toISOString().slice(0, 16) : '');
    setArrivalTime(f.arrivalTime ? new Date(f.arrivalTime).toISOString().slice(0, 16) : '');
    setPricePerSeat(f.pricePerSeat || 100000);
    setTotalSeats(f.totalSeats || 200);
    setBaggage(f.baggage || '20 KG');
    setMeal(!!f.meal);
    setCategory(f.category || 'All Types');
    setFareTiers(parseTiers(f.fareTiers));
    setShowModal(true);
  };

  const handleSaveFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isEdit = !!editingFlightId;
      const url = '/api/flights';
      const method = isEdit ? 'PUT' : 'POST';

      const depDate = departureTime ? new Date(departureTime).toISOString() : new Date().toISOString();
      const arrDate = arrivalTime ? new Date(arrivalTime).toISOString() : new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

      const payload: any = {
        flightNumber, pnr, airline, departureCity, arrivalCity,
        departureTime: depDate,
        arrivalTime: arrDate,
        duration: 360,
        totalSeats: Number(totalSeats) || 200,
        pricePerSeat: Number(pricePerSeat) || 100000,
        fareTiers: fareTiers.length > 0 ? JSON.stringify(fareTiers) : null,
        baggage, meal, category,
      };

      if (isEdit) {
        payload.id = editingFlightId;
      } else {
        payload.availableSeats = Number(totalSeats) || 200;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        setMessage(isEdit ? 'Flight schedule updated successfully!' : 'Flight schedule added successfully!');
        resetForm();
        fetchData();
      } else {
        setMessage(data.error || 'Failed to save flight schedule.');
      }
    } catch (err) {
      console.error('Error saving flight:', err);
      setMessage('Error saving flight schedule.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const [syncing, setSyncing] = useState(false);
  const [syncScheduler, setSyncScheduler] = useState<{
    intervalHours?: number;
    nextSyncInMinutes?: number;
    nextSyncAt?: string;
    status?: {
      lastSyncTime?: string | null;
      syncedCount?: number;
      createdCount?: number;
      updatedCount?: number;
      status?: string;
      message?: string;
      sourceUrl?: string;
    };
  } | null>(null);

  const handleSyncLiveFlights = async () => {
    setSyncing(true);
    setMessage('Syncing live flights & wholesale fares from Sajid Travels (groups.sajidtravels.pk)...');
    try {
      const res = await fetch('/api/admin/flights/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message || 'Live flights & fares synced successfully from Sajid Travels!');
        if (data.scheduler) {
          setSyncScheduler(data.scheduler);
        }
        fetchData();
      } else {
        setMessage(data.error || 'Failed to sync live flights');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setMessage('Error syncing live flights');
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(''), 7000);
    }
  };

  const handleToggleCancelFlight = async (f: FlightItem) => {
    const newStatus = f.status === 'cancelled' ? 'active' : 'cancelled';
    const actionText = newStatus === 'cancelled' ? 'Cancel' : 'Reactivate';
    if (!confirm(`${actionText} flight ${f.flightNumber}?`)) return;

    try {
      const res = await fetch('/api/flights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: f.id, status: newStatus }),
      });

      if (res.ok) {
        setMessage(`Flight ${f.flightNumber} ${newStatus === 'cancelled' ? 'cancelled' : 'reactivated'}.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteFlight = async (id: string) => {
    if (!confirm('Permanently remove this flight from schedule?')) return;

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

  const effectiveLastSync = useMemo(() => {
    if (syncScheduler?.status?.lastSyncTime) {
      return syncScheduler.status.lastSyncTime;
    }
    if (flights.length > 0) {
      let maxTime = '';
      for (const f of flights as any[]) {
        if (f.updatedAt && (!maxTime || f.updatedAt > maxTime)) {
          maxTime = f.updatedAt;
        }
      }
      return maxTime || null;
    }
    return null;
  }, [syncScheduler, flights]);

  const nextSyncIso = useMemo(() => {
    if (syncScheduler?.nextSyncAt) return syncScheduler.nextSyncAt;
    if (effectiveLastSync) {
      return new Date(new Date(effectiveLastSync).getTime() + 5 * 60 * 60 * 1000).toISOString();
    }
    return null;
  }, [syncScheduler, effectiveLastSync]);

  const filteredFlights = flights.filter(f => activeCategory === 'All Types' || f.category === activeCategory);

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Flight Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage wholesale ticket blocks, dynamic fare tiers, and live auto-synced flight schedules</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Auto-Sync: <strong>Every 5h</strong></span>
            <span className="text-emerald-600/40 dark:text-emerald-400/40">|</span>
            <span className="font-mono text-[11px] hidden md:inline">groups.sajidtravels.pk</span>
            {effectiveLastSync && (
              <>
                <span className="text-emerald-600/40 dark:text-emerald-400/40">|</span>
                <span title={new Date(effectiveLastSync).toLocaleString()}>
                  Last: <strong>{formatTimeAgo(effectiveLastSync, now)}</strong>
                  <span className="opacity-75 font-normal ml-1 hidden xl:inline">
                    ({new Date(effectiveLastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </span>
              </>
            )}
            {nextSyncIso && (
              <>
                <span className="text-emerald-600/40 dark:text-emerald-400/40">|</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Next in: <strong>{formatNextCountdown(nextSyncIso, now)}</strong>
                </span>
              </>
            )}
          </div>

          <button 
            onClick={handleSyncLiveFlights}
            disabled={syncing}
            className="px-4 py-2.5 bg-card border border-primary/40 text-primary font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shadow-xs inline-flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Live Flights (Sajid Travels)'}</span>
          </button>
          <button onClick={handleOpenAddModal} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Flight</span>
          </button>
        </div>
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
            All Types ({flights.length})
          </button>
          
          {allCategoryNames.map(catName => {
            const catObj = categories.find(c => c.name === catName);
            const count = flights.filter(f => f.category === catName).length;
            if (count === 0) return null; // Never display category with 0 flights

            return (
              <div key={catName} className="relative group flex items-center shrink-0">
                <button
                  onClick={() => setActiveCategory(catName)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${catObj ? 'pr-8' : ''} ${
                    activeCategory === catName ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {catName} ({count})
                </button>
                {catObj && (
                  <button 
                    onClick={() => handleDeleteCategory(catObj.id, catObj.name)}
                    className={`absolute right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      activeCategory === catName ? 'text-primary-foreground hover:bg-black/20' : 'text-muted-foreground hover:bg-black/10'
                    }`}
                    title="Delete Category"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
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

      {/* Add/Edit Flight Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingFlightId ? 'Edit Flight Schedule' : 'Add Flight Schedule'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveFlight} className="space-y-4">
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

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Departure Date & Time</label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Arrival Date & Time</label>
                  <input
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    required
                  />
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
                <p className="text-[11px] text-muted-foreground -mt-1">Define price tiers based on seat numbers up to limit.</p>

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
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] uppercase font-bold text-muted-foreground">
                  <th className="px-3 py-3">Status & Flight #</th>
                  <th className="px-3 py-3">Airline & Route</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Schedule (Dep / Arr)</th>
                  <th className="px-3 py-3">Seats & Baggage</th>
                  <th className="px-3 py-3">Fare & Tiers</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFlights.map((f) => {
                  const tiers = parseTiers(f.fareTiers);
                  const seatsSold = f.totalSeats - f.availableSeats;
                  const isCancelled = f.status === 'cancelled';

                  return (
                    <tr key={f.id} className={`hover:bg-muted/20 ${isCancelled ? 'bg-red-500/5' : ''}`}>
                      {/* Status & Flight # */}
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center gap-2 mb-1">
                          {isCancelled ? (
                            <span className="px-2 py-0.5 bg-destructive/15 text-destructive border border-destructive/30 text-[10px] rounded-md font-black uppercase">Cancelled</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] rounded-md font-black uppercase">Active</span>
                          )}
                          <span className="font-mono text-xs font-black text-foreground">{f.flightNumber}</span>
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">PNR: <strong className="text-foreground">{f.pnr || '—'}</strong></div>
                      </td>

                      {/* Airline & Route */}
                      <td className="px-3 py-3 align-top">
                        <div className="font-bold text-foreground text-xs sm:text-sm">{f.airline}</div>
                        <div className="text-xs font-semibold text-primary mt-0.5">{f.departureCity} → {f.arrivalCity}</div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 align-top">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {f.category || 'Direct Flight'}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="px-3 py-3 align-top text-xs">
                        <div className="font-bold text-foreground">
                          <span className="text-muted-foreground mr-1">Dep:</span> 
                          {f.departureTime ? new Date(f.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'} 
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1.5">{f.departureTime ? new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <div className="font-bold text-foreground mt-1">
                          <span className="text-muted-foreground mr-1">Arr:</span> 
                          {f.arrivalTime ? new Date(f.arrivalTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'} 
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold ml-1.5">{f.arrivalTime ? new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </td>

                      {/* Seats & Baggage */}
                      <td className="px-3 py-3 align-top text-xs">
                        <div className="font-bold text-foreground">
                          Seats: <strong className="text-primary font-black">{f.availableSeats}</strong>/{f.totalSeats} 
                          <span className="text-[10px] text-muted-foreground ml-1">({seatsSold} sold)</span>
                        </div>
                        <div className="text-muted-foreground mt-1 font-medium">
                          Bag: <span className="font-bold text-foreground">{f.baggage || '20 KG'}</span> | Meal: <span className="font-bold text-foreground">{f.meal ? 'Yes' : 'No'}</span>
                        </div>
                      </td>

                      {/* Pricing & Tiers */}
                      <td className="px-3 py-3 align-top text-xs">
                        <button
                          type="button"
                          onClick={() => handleEditFlight(f)}
                          className="group text-left cursor-pointer hover:opacity-80 transition"
                          title="Click to change and update price"
                        >
                          <div className="font-black text-primary text-sm sm:text-base flex items-center gap-1 group-hover:underline">
                            <span>PKR {(f.currentFare || f.pricePerSeat)?.toLocaleString()}</span>
                            <Edit className="w-3 h-3 text-muted-foreground opacity-60 group-hover:opacity-100 transition" />
                          </div>
                          {tiers.length > 0 ? (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{tiers.length} Tier(s)</span> active
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Fixed Rate</span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEditFlight(f)} 
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition" 
                            title="Edit flight schedule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleCancelFlight(f)} 
                            className={`p-1.5 rounded-lg transition ${isCancelled ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`} 
                            title={isCancelled ? 'Reactivate flight' : 'Cancel flight'}
                          >
                            {isCancelled ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteFlight(f.id)} 
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition" 
                            title="Permanently remove flight"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
