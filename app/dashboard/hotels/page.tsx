'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Star, Trash2, CheckCircle2 } from 'lucide-react';

interface HotelItem {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  pricePerNight: number;
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [address, setAddress] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [pricePerNight, setPricePerNight] = useState(30000);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchHotels = async () => {
    try {
      const res = await fetch('/api/hotels');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.hotels)) {
          setHotels(data.hotels);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, country, address: address || city, starRating, pricePerNight }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setMessage('Hotel added to inventory successfully!');
        setName(''); setCity(''); setAddress('');
        fetchHotels();
      } else {
        setMessage(data.error || 'Failed to add hotel.');
      }
    } catch (err) {
      console.error(err);
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hotel from inventory?')) return;

    try {
      const res = await fetch(`/api/hotels?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Hotel removed from inventory.');
        fetchHotels();
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Hotels & Accommodations</h1>
          <p className="text-muted-foreground mt-1">Manage partner hotel contracts and night rates in PKR</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hotel</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Add Partner Hotel</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>

            <form onSubmit={handleAddHotel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Hotel Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Al Safwah Hotel Makkah" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Makkah" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Saudi Arabia" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Star Rating</label>
                  <select value={starRating} onChange={(e) => setStarRating(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value={5}>5-Star</option>
                    <option value={4}>4-Star</option>
                    <option value={3}>3-Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Night Rate (PKR)</label>
                  <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Hotel'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3.5 border border-input font-bold rounded-xl hover:bg-muted text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Hotels in Inventory</p>
            <p className="text-xs">Click &quot;Add Hotel&quot; to add your first partner hotel contract.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Hotel Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Night Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="px-6 py-4 font-bold text-foreground">{h.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{h.city}, {h.country}</td>
                  <td className="px-6 py-4 text-primary font-bold">{h.starRating}-Star</td>
                  <td className="px-6 py-4 font-black text-primary">PKR {h.pricePerNight.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(h.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition" title="Remove hotel">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </div>
  );
}
