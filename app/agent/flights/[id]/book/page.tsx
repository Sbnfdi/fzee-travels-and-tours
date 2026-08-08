'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle2, AlertCircle, Plane } from 'lucide-react';
import Link from 'next/link';

interface FlightItem {
  id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
  currentFare: number;
  availableSeats: number;
  totalSeats: number;
  fareTiers?: string | null;
}

export default function BookFlightPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [flight, setFlight] = useState<FlightItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [pax, setPax] = useState(1);
  const [passengers, setPassengers] = useState([
    { name: '', passportNumber: '', passportExpiry: '', dob: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await fetch('/api/flights');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const found = data.flights.find((f: any) => f.id === id);
            if (found) setFlight(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFlight();
  }, [id]);

  const calculateTotalPrice = (f: FlightItem, paxCount: number): number => {
    if (!f.fareTiers) return (f.currentFare || f.pricePerSeat) * paxCount;
    try {
      const tiers: { upToSeat: number; price: number }[] = JSON.parse(f.fareTiers);
      if (!Array.isArray(tiers) || tiers.length === 0) return (f.currentFare || f.pricePerSeat) * paxCount;
      
      const sortedTiers = [...tiers].sort((a, b) => a.upToSeat - b.upToSeat);
      const seatsSold = (f.totalSeats || 200) - f.availableSeats;
      let sum = 0;
      for (let i = 0; i < paxCount; i++) {
        const seatNum = seatsSold + i + 1;
        let matchedPrice = f.pricePerSeat;
        let found = false;
        for (const t of sortedTiers) {
          if (seatNum <= t.upToSeat) {
            matchedPrice = t.price;
            found = true;
            break;
          }
        }
        if (!found && sortedTiers.length > 0) {
          matchedPrice = sortedTiers[sortedTiers.length - 1].price;
        }
        sum += matchedPrice;
      }
      return sum;
    } catch {
      return (f.currentFare || f.pricePerSeat) * paxCount;
    }
  };

  const handlePaxChange = (newPax: number) => {
    if (newPax < 1 || (flight && newPax > flight.availableSeats) || newPax > 50) return;
    setPax(newPax);
    
    setPassengers(prev => {
      if (newPax > prev.length) {
        return [...prev, ...Array(newPax - prev.length).fill({ name: '', passportNumber: '', passportExpiry: '', dob: '' })];
      } else {
        return prev.slice(0, newPax);
      }
    });
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check mandatory fields
    const missing = passengers.some(
      p => !p.name?.trim() || !p.passportNumber?.trim() || !p.passportExpiry || !p.dob
    );

    if (missing) {
      setError('All passenger details (Full Name, Passport Number, Passport Expiry, and Date of Birth) are mandatory for all passengers.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'FLIGHT',
          flightId: id,
          numberOfPax: pax,
          passengerDetails: passengers,
          specialRequests: `Flight Ticket Reservation`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Flight tickets booked successfully! Redirecting...`);
        setTimeout(() => router.push('/agent/bookings'), 1500);
      } else {
        setError(data.error || 'Failed to book tickets.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading flight details...</div>;
  if (!flight) return <div className="text-center py-20 text-destructive font-bold">Flight not found.</div>;

  const totalPrice = calculateTotalPrice(flight, pax);

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-foreground">
      <Link href="/agent/flights" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Flights</span>
      </Link>

      <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">{flight.airline}</h1>
              <p className="text-sm text-muted-foreground font-semibold">Flight #{flight.flightNumber} • {flight.departureCity} to {flight.arrivalCity}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border/60 text-xs shrink-0">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Departure</span>
              <span className="font-bold text-foreground block">{new Date(flight.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Arrival</span>
              <span className="font-bold text-foreground block">{new Date(flight.arrivalTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 block">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
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
            <label className="block text-sm font-bold mb-2">Number of Passengers (PAX)</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => handlePaxChange(pax - 1)} className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted font-bold">-</button>
              <span className="text-xl font-black w-8 text-center">{pax}</span>
              <button type="button" onClick={() => handlePaxChange(pax + 1)} className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted font-bold">+</button>
              <span className="text-xs text-muted-foreground font-semibold ml-4">Available Seats: {flight.availableSeats}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-lg">Passenger Manifest</h3>
              <span className="text-xs font-bold text-destructive">* All passenger fields mandatory</span>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="p-5 bg-background border border-border rounded-2xl space-y-4 shadow-sm">
                <div className="font-black text-sm text-primary uppercase tracking-wider">
                  Passenger {idx + 1}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={p.name}
                      onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Full Name as on Passport"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Passport Number *</label>
                    <input
                      type="text"
                      required
                      value={p.passportNumber}
                      onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. AB1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Passport Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={p.passportExpiry}
                      onChange={(e) => handlePassengerChange(idx, 'passportExpiry', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={p.dob}
                      onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase block">Total Amount</span>
              <span className="text-3xl font-black text-primary">
                PKR {totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg text-sm"
            >
              {submitting ? 'Confirming Booking...' : 'Confirm Ticket Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
