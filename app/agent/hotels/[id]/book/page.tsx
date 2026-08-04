'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface HotelItem {
  id: string;
  name: string;
  city: string;
  pricePerNight: number;
}

export default function BookHotelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [hotel, setHotel] = useState<HotelItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [nights, setNights] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch('/api/hotels');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const found = data.hotels.find((h: any) => h.id === id);
            if (found) setHotel(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotel();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName) {
      setError('Please provide the primary guest name.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'HOTEL',
          hotelId: id,
          numberOfPax: nights, // Mapping nights to pax multiplier for simple total amount calculation
          passengerDetails: [{ name: guestName }],
          specialRequests: `Hotel Reservation for ${nights} Nights. Notes: ${specialRequests}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Hotel room reserved successfully! Redirecting...`);
        setTimeout(() => router.push('/agent/bookings'), 1500);
      } else {
        setError(data.error || 'Failed to reserve room.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading hotel details...</div>;
  if (!hotel) return <div className="text-center py-20 text-destructive font-bold">Hotel not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-foreground">
      <Link href="/agent/hotels" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hotels</span>
      </Link>

      <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
        <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{hotel.name}</h1>
            <p className="text-sm text-muted-foreground">{hotel.city}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm font-medium flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
            <label className="block text-sm font-bold mb-2">Number of Nights</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setNights(Math.max(1, nights - 1))} className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted font-bold">-</button>
              <span className="text-xl font-black w-8 text-center">{nights}</span>
              <button type="button" onClick={() => setNights(Math.min(30, nights + 1))} className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted font-bold">+</button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Guest Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Primary Guest Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Full Name as on ID"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1">Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                  placeholder="e.g. Late check-in, Twin beds, High floor"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase block">Total Amount</span>
              <span className="text-3xl font-black text-primary">PKR {(hotel.pricePerNight * nights).toLocaleString()}</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg text-sm"
            >
              {submitting ? 'Processing...' : 'Reserve Hotel Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
