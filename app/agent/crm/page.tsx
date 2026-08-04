'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface CRMItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  contactName: string;
  contactEmail: string;
  status: 'open' | 'completed';
  createdAt: string;
}

export default function AgentCRMPage() {
  const [activities, setActivities] = useState<CRMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [type, setType] = useState<'call' | 'email' | 'meeting' | 'note'>('call');
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/crm');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.activities)) {
          setActivities(data.activities);
        }
      }
    } catch (err) {
      console.error('Failed to fetch CRM activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, subject, contactName, contactEmail }),
      });

      if (res.ok) {
        setShowModal(false);
        setSubject('');
        setContactName('');
        setContactEmail('');
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/crm?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchActivities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = (id: string) => {
    setActivities(
      activities.map((a) =>
        a.id === id ? { ...a, status: a.status === 'open' ? 'completed' : 'open' } : a
      )
    );
  };

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Client CRM & Leads</h1>
          <p className="text-muted-foreground mt-1">Track client inquiries, follow-up calls, quotations & corporate leads</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Lead / Activity</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Log Client Interaction</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Activity Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email Sent</option>
                  <option value="meeting">In-Person Meeting</option>
                  <option value="note">General Note</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Subject / Goal</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Followed up on Skardu tour deposit"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Client Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Client Email / Phone</label>
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Lead Activity'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3.5 border border-input font-bold rounded-xl hover:bg-muted text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading CRM activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Phone className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Client Activities Logged</p>
            <p className="text-xs">Click &quot;Log New Lead / Activity&quot; to add your first client interaction.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="px-6 py-4 font-bold text-primary capitalize flex items-center gap-2">
                    {act.type === 'call' && <Phone className="w-4 h-4" />}
                    {act.type === 'email' && <Mail className="w-4 h-4" />}
                    {act.type === 'meeting' && <Calendar className="w-4 h-4" />}
                    {act.type === 'note' && <MessageSquare className="w-4 h-4" />}
                    <span>{act.type}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">{act.subject}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{act.contactName}</div>
                    <div className="text-xs text-muted-foreground">{act.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      act.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'
                    }`}>
                      {act.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => toggleStatus(act.id)}
                      className="px-3 py-1.5 border border-input rounded-lg hover:bg-muted text-xs font-bold text-foreground transition"
                    >
                      {act.status === 'open' ? 'Mark Done' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition"
                      title="Delete activity"
                    >
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
