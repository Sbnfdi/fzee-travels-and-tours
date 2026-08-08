'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, DollarSign, ShieldCheck, Landmark } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from './actions';

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState('PKR');
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(100000);
  const [autoApproveAgencies, setAutoApproveAgencies] = useState(true);
  const [bankAccountName, setBankAccountName] = useState('Fzee Travel & Tours (Pvt) Ltd');
  const [bankAccountNumber, setBankAccountNumber] = useState('0123-4567890-01');
  const [bankName, setBankName] = useState('Fzee Travels Bank Pakistan');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSystemSettings();
        setCurrency(settings.currency);
        setDefaultCreditLimit(settings.defaultCreditLimit);
        setAutoApproveAgencies(settings.autoApproveAgencies);
        setBankAccountName(settings.bankAccountName);
        setBankAccountNumber(settings.bankAccountNumber);
        setBankName(settings.bankName);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await updateSystemSettings({
        currency,
        defaultCreditLimit,
        autoApproveAgencies,
        bankAccountName,
        bankAccountNumber,
        bankName,
      });

      if (result.success) {
        setMessage('Admin system settings updated successfully!');
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading system settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global B2B portal settings, system currency, and bank transfer information</p>
      </div>

      {message && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 font-medium text-sm flex items-center gap-3">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Currency & Financials */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Financial & Currency Settings</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Portal System Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Default Agency Credit Limit (PKR)</label>
              <input
                type="number"
                value={defaultCreditLimit}
                onChange={(e) => setDefaultCreditLimit(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Agency Registration Policy */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Agency Registration Policy</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
            <div>
              <p className="font-bold text-foreground text-sm">Auto-Approve Travel Agents</p>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically approve new travel agency accounts upon registration</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveAgencies}
                onChange={(e) => setAutoApproveAgencies(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Bank Information for Top-ups */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Landmark className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Fzee Travels Bank Transfer Account</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Account Title</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Account Number / IBAN</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-primary/20 text-sm inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Updating System...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
