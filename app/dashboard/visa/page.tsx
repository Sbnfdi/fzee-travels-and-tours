'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface VisaItem {
  id: string;
  country: string;
  visaType: string;
  processingDays: number;
  pricePerPerson: number;
}

export default function AdminVisaPage() {
  const [visas, setVisas] = useState<VisaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [country, setCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [processingDays, setProcessingDays] = useState(3);
  const [pricePerPerson, setPricePerPerson] = useState(35000);

  const fetchVisas = async () => {
    try {
      const res = await fetch('/api/visa');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.visaServices)) {
          setVisas(data.visaServices);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisas();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/visa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, visaType, processingDays, pricePerPerson }),
      });

      if (res.ok) {
        setShowModal(false);
        setMessage('Visa service added successfully!');
        setCountry(''); setVisaType('');
        fetchVisas();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this visa service?')) return;

    try {
      const res = await fetch(`/api/visa?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Visa service removed.');
        fetchVisas();
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
          <h1 className="text-3xl font-black text-foreground tracking-tight">Visa Services</h1>
          <p className="text-muted-foreground mt-1">Configure visa fees, processing times, and document checklists</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Visa Service</span>
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
              <h2 className="text-xl font-bold">Add Visa Service</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Saudi Arabia" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Visa Type</label>
                <input type="text" value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="Umrah E-Visa" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Processing (Days)</label>
                  <input type="number" value={processingDays} onChange={(e) => setProcessingDays(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Fee / PAX (PKR)</label>
                  <input type="number" value={pricePerPerson} onChange={(e) => setPricePerPerson(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50">{saving ? 'Saving...' : 'Save Visa Service'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3.5 border border-input font-bold rounded-xl hover:bg-muted text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading visa services...</div>
        ) : visas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Globe className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Visa Services</p>
            <p className="text-xs">Click &quot;Add Visa Service&quot; to configure one.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Visa Category</th>
                <th className="px-6 py-4">Turnaround</th>
                <th className="px-6 py-4">Service Fee</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visas.map((v) => (
                <tr key={v.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="px-6 py-4 font-bold text-foreground">{v.country}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{v.visaType}</td>
                  <td className="px-6 py-4 text-muted-foreground">{v.processingDays} Days</td>
                  <td className="px-6 py-4 font-black text-primary">PKR {v.pricePerPerson.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(v.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition" title="Remove visa service">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
