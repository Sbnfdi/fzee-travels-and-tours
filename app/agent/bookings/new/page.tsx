'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane, Users, CheckCircle2, AlertCircle, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';

interface PassengerInput {
  seatNumber: string;
  title: string;
  name: string;
  passport: string;
  phone: string;
}

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId') || '';
  const tourTitle = searchParams.get('title') || 'Selected Tour Package';
  const tourPrice = parseFloat(searchParams.get('price') || '150000');

  const [paxCount, setPaxCount] = useState(1);
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    { seatNumber: 'Seat 1', title: 'Mr', name: '', passport: '', passportNumber: '', passportExpiry: '', dob: '', phone: '' }
  ]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [payWithWallet, setPayWithWallet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePaxChange = (count: number) => {
    const validCount = Math.max(1, Math.min(10, count));
    setPaxCount(validCount);
    const list = [...passengers];
    while (list.length < validCount) {
      const idx = list.length + 1;
      list.push({ seatNumber: `Seat ${idx}`, title: 'Mr', name: '', passport: '', passportNumber: '', passportExpiry: '', dob: '', phone: '' });
    }
    while (list.length > validCount) list.pop();
    setPassengers(list);
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInput, val: string) => {
    const list = [...passengers];
    list[index] = { ...list[index], [field]: val };
    if (field === 'passport') list[index].passportNumber = val;
    setPassengers(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const totalAmount = paxCount * tourPrice;

    try {
      // 1. Create booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId || 'group-1',
          numberOfPax: paxCount,
          totalAmount: totalAmount,
          passengerDetails: passengers.map((p, i) => ({
            seatNumber: p.seatNumber || `Seat ${i + 1}`,
            title: p.title || 'Mr',
            name: p.name || `Passenger ${i + 1}`,
            passport: p.passportNumber || p.passport || '',
            passportNumber: p.passportNumber || p.passport || '',
            passportExpiry: p.passportExpiry || '',
            dob: p.dob || '',
            phone: p.phone || '',
          })),
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create booking.');
        return;
      }

      const bookingObj = data.data;

      // 2. If payWithWallet is checked, settle via wallet payment API immediately
      if (payWithWallet && bookingObj?.id) {
        const payRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingObj.id,
            amount: totalAmount,
            method: 'wallet',
          }),
        });

        const payData = await payRes.json();
        if (!payRes.ok || !payData.success) {
          setError(payData.error || 'Booking created, but wallet deduction failed due to insufficient funds.');
          setTimeout(() => router.push('/agent/bookings'), 2000);
          return;
        }

        setSuccessMessage('Booking confirmed & PKR ' + totalAmount.toLocaleString() + ' deducted directly from Agency Wallet!');
      } else {
        setSuccessMessage('Booking created successfully! Pending payment settlement.');
      }

      setTimeout(() => router.push('/agent/bookings'), 1500);
    } catch (err) {
      console.error('Booking submission error:', err);
      setError('An error occurred during booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = paxCount * tourPrice;

  return (
    <div className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-xl shadow-black/5">
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold text-primary uppercase tracking-wider block">Reserve Package</span>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">{tourTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Package Price: <span className="text-foreground font-bold">PKR {tourPrice.toLocaleString()}</span> / PAX</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm font-medium flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">Number of Passengers (PAX)</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="10"
              value={paxCount}
              onChange={(e) => handlePaxChange(parseInt(e.target.value) || 1)}
              className="w-32 px-4 py-3 rounded-xl border border-input bg-background text-foreground font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-sm text-muted-foreground font-medium">Select total seats required</span>
          </div>
        </div>

        {/* Passenger Manifest & Seat Mapping Form */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Passenger Details & Seat Assignments
          </label>

          {passengers.map((p, i) => (
            <div key={i} className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-primary tracking-wide">Passenger #{i + 1} Record</span>
                <span className="text-xs font-mono font-bold text-muted-foreground">Seat Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Seat #</label>
                  <input
                    type="text"
                    value={p.seatNumber}
                    onChange={(e) => handlePassengerChange(i, 'seatNumber', e.target.value)}
                    placeholder="Seat 1A"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-bold text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Title</label>
                  <select
                    value={p.title}
                    onChange={(e) => handlePassengerChange(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Mstr">Mstr</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handlePassengerChange(i, 'name', e.target.value)}
                    placeholder="Passenger Full Name"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Passport / CNIC</label>
                  <input
                    type="text"
                    value={p.passport}
                    onChange={(e) => handlePassengerChange(i, 'passport', e.target.value)}
                    placeholder="Passport / CNIC Number"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Passport Expiry</label>
                  <input
                    type="date"
                    value={p.passportExpiry || ''}
                    onChange={(e) => handlePassengerChange(i, 'passportExpiry', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={p.dob || ''}
                    onChange={(e) => handlePassengerChange(i, 'dob', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Special Requests / Notes</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="e.g. Wheelchair assistance, Double bed room preference..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Wallet payment toggle */}
        <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">Deduct Payment from Agency Wallet</p>
              <p className="text-xs text-muted-foreground">Instant deduction and immediate booking confirmation</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={payWithWallet}
            onChange={(e) => setPayWithWallet(e.target.checked)}
            className="w-5 h-5 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="p-6 bg-muted/60 rounded-2xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Total Booking Amount</span>
            <span className="text-3xl font-black text-primary">PKR {totalAmount.toLocaleString()}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-primary/20 text-sm"
          >
            {loading ? 'Confirming Booking...' : 'Confirm & Submit Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/agent/available-tours" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Available Tours</span>
      </Link>

      <Suspense fallback={<div className="p-8 text-center text-muted-foreground font-semibold">Loading booking form...</div>}>
        <NewBookingForm />
      </Suspense>
    </div>
  );
}
