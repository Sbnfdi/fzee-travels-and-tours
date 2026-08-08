'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet, Plus, AlertCircle, CheckCircle2, CreditCard, RefreshCw } from 'lucide-react';

interface WalletData {
  walletBalance: number;
  agencyWallet: any;
}

interface TopUpRecord {
  id: string;
  amount: number;
  status: string;
  submittedAt: string;
  approvedAt?: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>({ walletBalance: 0, agencyWallet: null });
  const [topups, setTopups] = useState<TopUpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const fetchWallet = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet');
      const data = await response.json();
      if (data.success && data.data) {
        setWallet(data.data);
      }
      if (data.topups) {
        setTopups(data.topups);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();

    // Live Polling every 5 seconds so balance updates instantly when admin approves topup
    const interval = setInterval(fetchWallet, 5000);

    // Also refresh when tab comes into focus
    const handleFocus = () => fetchWallet();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchWallet]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpLoading(true);
    setMessage('');

    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 100) {
      setMessage('Minimum top-up amount is PKR 100');
      setMessageType('error');
      setTopUpLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTopUpAmount('');
        setShowTopUp(false);
        setMessage(data.message || 'Top-up request submitted successfully! Pending admin approval.');
        setMessageType('success');
        fetchWallet();
      } else {
        setMessage(data.error || 'Failed to submit top-up request.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to submit top-up:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Wallet Management</h1>
          <p className="text-muted-foreground mt-1">Manage your agency balance, view transaction history, and submit top-up requests</p>
        </div>

        <button
          onClick={fetchWallet}
          className="px-4 py-2 border border-input rounded-xl hover:bg-muted font-bold text-xs inline-flex items-center gap-2 text-foreground transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          <span>Refresh Balance</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
          messageType === 'success'
            ? 'bg-primary/10 border border-primary/20 text-primary'
            : 'bg-destructive/10 border border-destructive/20 text-destructive'
        }`}>
          {messageType === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-accent rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wider">Available Wallet Balance</p>
            <p className="text-4xl sm:text-5xl font-black mt-2">
              PKR {(wallet?.walletBalance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-primary-foreground/75 text-xs font-medium mt-3">Live balance credited directly by admin</p>
          </div>
          <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
            <Wallet className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Top-up Section */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Funds</h2>
            <p className="text-xs text-muted-foreground">Request a wallet top-up via bank transfer settlement</p>
          </div>
          <button
            onClick={() => setShowTopUp(!showTopUp)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition text-sm shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Top Up Wallet
          </button>
        </div>

        {showTopUp && (
          <form onSubmit={handleTopUp} className="space-y-4 border-t border-border pt-6 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Top-up Amount (PKR)</label>
              <input
                type="number"
                min="100"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                required
              />
            </div>

            <div className="p-4 bg-muted/60 rounded-xl border border-border/80 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Bank Transfer Details:</p>
              <p className="text-sm font-medium text-foreground">Account Title: Fzee Travel & Tours (Pvt) Ltd</p>
              <p className="text-sm font-medium text-foreground">Account Number: 0123-4567890-01</p>
              <p className="text-sm font-medium text-foreground">Bank: Fzee Travels Bank Pakistan</p>
              <p className="text-xs text-muted-foreground pt-1">After transfer, submit request above for admin approval.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={topUpLoading || !topUpAmount}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 text-sm shadow-md shadow-primary/20 transition"
              >
                {topUpLoading ? 'Submitting...' : 'Submit Top-up Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowTopUp(false)}
                className="px-5 py-3 border border-input rounded-xl hover:bg-muted font-bold text-sm text-foreground transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Top-up History */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Top-up Request History</h2>
        {topups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">No top-up requests yet</p>
            <p className="text-xs text-muted-foreground mt-1">Submit a top-up request to see it here.</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl divide-y divide-border/60">
            {topups.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">PKR {t.amount.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-3">{new Date(t.submittedAt).toLocaleDateString('en-PK')}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  t.status === 'approved' ? 'bg-green-100 text-green-800' :
                  t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-primary/10 text-primary'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
