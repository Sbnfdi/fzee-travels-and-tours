'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock, Search, Wallet } from 'lucide-react';

interface TopUpRequest {
  id: string;
  agencyName: string;
  agentName: string;
  agentEmail: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function AdminPaymentsPage() {
  const [topups, setTopups] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTopups = async () => {
    try {
      const res = await fetch(`/api/admin/topup?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.topups)) {
          setTopups(data.topups);
        }
      }
    } catch (err) {
      console.error('Failed to load top-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, [statusFilter]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/topup/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(
          action === 'approved'
            ? 'Top-up approved! Agency wallet balance has been credited.'
            : 'Top-up request has been rejected.'
        );
        fetchTopups();
      } else {
        setActionMessage(data.error || 'Failed to process request.');
      }
    } catch (err) {
      console.error(err);
      setActionMessage('An error occurred processing the request.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const filteredTopups = topups.filter((t) =>
    t.agencyName.toLowerCase().includes(search.toLowerCase()) ||
    t.agentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Wallet Top-up Approvals</h1>
          <p className="text-muted-foreground mt-1">Review bank transfers, approve top-ups, and credit agency balances</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agency..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
            className="px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading top-up requests...</div>
        ) : filteredTopups.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Top-up Requests Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Agent wallet top-up requests via bank transfer will appear here for approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Agency</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Top-Up Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopups.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="px-6 py-4 font-bold text-foreground">{t.agencyName}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{t.agentName}</div>
                    <div className="text-xs text-muted-foreground">{t.agentEmail}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-primary">PKR {t.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(t.submittedAt).toLocaleDateString('en-PK')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      t.status === 'approved' ? 'bg-green-100 text-green-800' :
                      t.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {t.status === 'pending' && (
                      <>
                        <button
                          disabled={processingId === t.id}
                          onClick={() => handleAction(t.id, 'approved')}
                          className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 text-xs shadow-sm transition disabled:opacity-50"
                        >
                          {processingId === t.id ? '...' : 'Approve & Credit'}
                        </button>
                        <button
                          disabled={processingId === t.id}
                          onClick={() => handleAction(t.id, 'rejected')}
                          className="px-3.5 py-1.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-lg text-xs transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
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
