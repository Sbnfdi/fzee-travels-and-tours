'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, CheckCircle2, Users } from 'lucide-react';

interface GroupTour {
  id: string;
  name: string;
  destination: string;
  duration: number;
  startDate: string;
  endDate: string;
  totalSlots: number;
  availableSlots: number;
  pricePerPerson: number;
  status: string;
}

export default function AdminGroupsPage() {
  const [tours, setTours] = useState<GroupTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(7);
  const [totalSlots, setTotalSlots] = useState(30);
  const [pricePerPerson, setPricePerPerson] = useState(150000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        if (data.success && (Array.isArray(data.groups) || Array.isArray(data.data))) {
          setTours(data.groups || data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          destination,
          duration,
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
          totalSlots,
          pricePerPerson,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateModal(false);
        setMessage('Tour package created successfully!');
        setName(''); setDestination(''); setStartDate(''); setEndDate('');
        fetchGroups();
      } else {
        setMessage(data.error || 'Failed to create tour package.');
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
    if (!confirm('Are you sure you want to remove this tour package?')) return;

    try {
      const res = await fetch(`/api/groups?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Tour package removed.');
        fetchGroups();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to remove tour package.');
      }
    } catch (err) {
      console.error(err);
      setMessage('An error occurred.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleStatus = async (id: string) => {
    setTours(
      tours.map((t) =>
        t.id === id ? { ...t, status: t.status === 'open' ? 'closed' : 'open' } : t
      )
    );
  };

  const filteredTours = tours.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Tour Packages & Slots</h1>
          <p className="text-muted-foreground mt-1">Create group packages, set PAX prices in PKR, and manage slot availability</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search package or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <button onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm shrink-0">
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Create New Group Package</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Package Title</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 10-Day Turkey Group" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Destination</label>
                  <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Istanbul, Turkey" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Duration (Days)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Total Slots</label>
                  <input type="number" value={totalSlots} onChange={(e) => setTotalSlots(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Price / PAX (PKR)</label>
                  <input type="number" value={pricePerPerson} onChange={(e) => setPricePerPerson(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50">{saving ? 'Creating...' : 'Save & Publish'}</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-3.5 border border-input font-bold rounded-xl hover:bg-muted text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground font-bold">Loading tour packages...</div>
      ) : filteredTours.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="font-bold text-foreground text-base">No Tour Packages</p>
          <p className="text-xs">Click &quot;Create Package&quot; to add a group tour.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const bookedSlots = tour.totalSlots - tour.availableSlots;
            const percentageBooked = tour.totalSlots > 0 ? Math.round((bookedSlots / tour.totalSlots) * 100) : 0;

            return (
              <div key={tour.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">{tour.destination}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${tour.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tour.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{tour.name}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground uppercase">Slot Occupancy</span>
                      <span className="text-foreground">{bookedSlots} / {tour.totalSlots} ({percentageBooked}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentageBooked}%` }} />
                    </div>
                    <p className="text-xs text-primary font-bold">{tour.availableSlots} Slots Available</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">PAX Price</span>
                    <span className="text-xl font-black text-foreground">PKR {tour.pricePerPerson.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleStatus(tour.id)} className="px-3 py-2 border border-input rounded-xl hover:bg-muted font-bold text-xs text-foreground transition">
                      {tour.status === 'open' ? 'Close' : 'Open'}
                    </button>
                    <button onClick={() => handleDelete(tour.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition" title="Delete package">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
