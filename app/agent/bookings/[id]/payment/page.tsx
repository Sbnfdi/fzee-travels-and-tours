'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Wallet, CreditCard, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>('wallet');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [amountDue, setAmountDue] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookingAmount = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.booking) {
            setAmountDue(data.booking.totalAmount);
          }
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchBookingAmount();
  }, [id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountDue) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: id,
          amount: amountDue,
          method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Payment settled successfully! Redirecting...');
        setTimeout(() => router.push('/agent/bookings'), 1500);
      } else {
        setError(data.error || 'Payment failed. Please check wallet balance or bank transfer details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-20 text-muted-foreground font-bold">Loading payment details...</div>;
  }

  if (amountDue === null) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-foreground">Booking Not Found</h2>
        <Link href="/agent/bookings" className="text-primary hover:underline mt-4 inline-block">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-foreground">
      <Link href="/agent/bookings" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </Link>

      <div className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-xl shadow-black/5">
        <div className="border-b border-border pb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block">Checkout</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">Settle Booking Payment</h1>
          <p className="text-sm text-muted-foreground mt-1">Select payment method to complete package booking</p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-4 rounded-xl border text-left transition ${
                paymentMethod === 'wallet'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border hover:bg-muted text-foreground font-semibold'
              }`}
            >
              <Wallet className="w-6 h-6 mb-2 text-primary" />
              <div className="text-sm font-bold">Agency Wallet</div>
              <div className="text-xs text-muted-foreground font-normal">Instant Deduction</div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-xl border text-left transition ${
                paymentMethod === 'bank'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border hover:bg-muted text-foreground font-semibold'
              }`}
            >
              <CreditCard className="w-6 h-6 mb-2 text-primary" />
              <div className="text-sm font-bold">Bank Transfer</div>
              <div className="text-xs text-muted-foreground font-normal">Manual Verification</div>
            </button>
          </div>

          <div className="p-6 bg-muted/60 rounded-2xl border border-border/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Amount Due</span>
              <span className="text-3xl font-black text-primary">PKR {amountDue.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-primary/20 text-sm"
            >
              {loading ? 'Processing...' : 'Settle Payment Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
