'use client';

import { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, CheckCircle2, TrendingUp, Edit2 } from 'lucide-react';

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
}

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form fields
  const [flightNumber, setFlightNumber] = useState('');
  const [pnr, setPnr] = useState('');
  const [airline, setAirline] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState(100000);
  const [totalSeats, setTotalSeats] = useState(200);

  // Fare tiers
  const [fareTiers, setFareTiers] = useState<FareTier[]>([
    { upToSeat: 100, price: 90000 },
    { upToSeat: 200, price: 120000 },
  ]);

  const fetchFlights = async () => {
    try {
      const res = await fetch('/api/flights');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.flights)) {
          setFlights(data.flights);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
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
  };

  const handleAdd = async (e: React.FormEvent) => {
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
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setMessage('Flight schedule added with fare tiers!');
        resetForm();
        fetchFlights();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this flight from schedule?')) return;

    try {
      const res = await fetch(`/api/flights?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Flight removed from schedule.');
        fetchFlights();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const parseTiers = (tiersStr: string | null): FareTier[] => {
    if (!tiersStr) return [];
    try { return JSON.parse(tiersStr); } catch { return []; }
  };

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Flight Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage airline ticket blocks, PNR codes, and dynamic fare tiers in PKR</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm">
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

      {/* Add Flight Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Flight Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {/* Flight # & PNR */}
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Total Seats</label>
                  <input type="number" value={totalSeats} onChange={(e) => setTotalSeats(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Base Price (PKR)</label>
                  <input type="number" value={pricePerSeat} onChange={(e) => setPricePerSeat(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
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
                <p className="text-[11px] text-muted-foreground -mt-1">Define price tiers based on seats sold. As more seats are booked, the fare automatically increases to the next tier.</p>

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
          <div className="text-center py-16 text-muted-foreground font-bold">Loading flights...</div>
        ) : flights.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Plane className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Flights in Schedule</p>
            <p className="text-xs">Click &quot;Add Flight&quot; to add a flight schedule.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Flight #</th>
                <th className="px-6 py-4">PNR</th>
                <th className="px-6 py-4">Airline</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Current Fare</th>
                <th className="px-6 py-4">Tiers</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => {
                const tiers = parseTiers(f.fareTiers);
                const seatsSold = f.totalSeats - f.availableSeats;
                return (
                  <tr key={f.id} className="border-b border-border/60 hover:bg-muted/20">
                    <td className="px-6 py-4 font-bold text-foreground font-mono">{f.flightNumber}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">{f.pnr || '—'}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{f.airline}</td>
                    <td className="px-6 py-4 text-muted-foreground">{f.departureCity} → {f.arrivalCity}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground">{f.availableSeats}</span>
                      <span className="text-muted-foreground text-xs">/{f.totalSeats}</span>
                      <span className="text-xs text-muted-foreground ml-1">({seatsSold} sold)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-primary">PKR {f.currentFare?.toLocaleString()}</span>
                      {f.currentFare !== f.pricePerSeat && (
                        <span className="block text-[10px] text-muted-foreground">Base: PKR {f.pricePerSeat.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(f.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition" title="Remove flight">
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
