'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon, Star } from 'lucide-react';

type Deal = {
  id: string;
  title: string;
  subtitle: string | null;
  price: string | null;
  image: string | null;
  isMainDeal: boolean;
  isActive: boolean;
};

export default function DealsManagementPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isMainDeal, setIsMainDeal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/admin/deals');
      const data = await res.json();
      if (data.success) setDeals(data.deals);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setTitle(deal.title);
      setSubtitle(deal.subtitle || '');
      setPrice(deal.price || '');
      setImage(deal.image || '');
      setIsMainDeal(deal.isMainDeal);
      setIsActive(deal.isActive);
    } else {
      setEditingDeal(null);
      setTitle('');
      setSubtitle('');
      setPrice('');
      setImage('');
      setIsMainDeal(false);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = { title, subtitle, price, image, isMainDeal, isActive };

    try {
      const url = editingDeal ? `/api/admin/deals/${editingDeal.id}` : '/api/admin/deals';
      const method = editingDeal ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        fetchDeals();
        closeModal();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      const res = await fetch(`/api/admin/deals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDeals();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Sample Deals</h1>
          <p className="text-muted-foreground mt-1">Manage the highlighted deals and destinations shown on the home page.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Deal
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-semibold text-sm text-foreground">Deal Info</th>
                <th className="p-4 font-semibold text-sm text-foreground">Type</th>
                <th className="p-4 font-semibold text-sm text-foreground">Status</th>
                <th className="p-4 font-semibold text-sm text-right text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No deals configured.</td>
                </tr>
              ) : deals.map((deal) => (
                <tr key={deal.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {deal.image ? (
                        <img src={deal.image} alt={deal.title} className="w-12 h-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">{deal.subtitle} • {deal.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {deal.isMainDeal ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Star className="w-3 h-3" /> Main CTA Button
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Tag className="w-3 h-3" /> Destination Card
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${deal.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                      {deal.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(deal)} className="p-2 hover:bg-muted rounded-lg transition-colors text-blue-600 mr-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(deal.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">{editingDeal ? 'Edit Deal' : 'Add New Deal'}</h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/50 mb-6">
                <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="dealType" checked={!isMainDeal} onChange={() => setIsMainDeal(false)} className="sr-only" />
                  <Tag className={`w-6 h-6 mb-2 ${!isMainDeal ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-bold ${!isMainDeal ? 'text-primary' : 'text-muted-foreground'}`}>Destination Card</span>
                </label>
                <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-background has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="dealType" checked={isMainDeal} onChange={() => setIsMainDeal(true)} className="sr-only" />
                  <Star className={`w-6 h-6 mb-2 ${isMainDeal ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-bold ${isMainDeal ? 'text-primary' : 'text-muted-foreground'}`}>Main CTA Button</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Dubai or KHI → JED" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Subtitle</label>
                  <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Tour Packages" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Price</label>
                  <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. PKR 42,000" className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Image URL</label>
                <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/50 outline-none" />
                <p className="text-[10px] text-muted-foreground mt-1">Recommended for Destination Cards. Use Unsplash/Pexels URLs.</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-input text-primary focus:ring-primary/50" />
                <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">Deal is Active & Visible</label>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
