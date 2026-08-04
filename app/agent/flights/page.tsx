'use client';

import { useState, useEffect } from 'react';
import { Plane, Search, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FlightItem {
  id: string;
  flightNumber: string;
  pnr: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  availableSeats: number;
  pricePerSeat: number;
  currentFare: number;
  aircraftType: string;
  fareTiers: string | null;
}

export default function AgentFlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/flights');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.flights)) {
            setFlights(data.flights);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const handleBookFlight = (flight: FlightItem) => {
    router.push(`/agent/flights/${flight.id}/book`);
  };

  const filteredFlights = flights.filter(
    (f) =>
      f.airline.toLowerCase().includes(search.toLowerCase()) ||
      f.departureCity.toLowerCase().includes(search.toLowerCase()) ||
      f.arrivalCity.toLowerCase().includes(search.toLowerCase()) ||
      f.flightNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Flight Ticketing Engine</h1>
          <p className="text-muted-foreground mt-1">Search international & domestic flight schedules with live seat availability in PKR</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search airline or city (e.g. Lahore, Dubai)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {bookingMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{bookingMessage}</span>
        </div>
      )}

      {bookingError && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-medium text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Flight Cards */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => (
          <div key={flight.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:border-primary/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{flight.airline}</h3>
                  <p className="text-xs text-muted-foreground font-mono">Flight #{flight.flightNumber}{flight.pnr ? ` • PNR: ${flight.pnr}` : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 text-sm font-semibold text-foreground">
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block">Departure</span>
                  <span className="text-foreground">{flight.departureCity}</span>
                </div>

                <div className="text-center text-muted-foreground">
                  <span className="text-xs">{Math.floor(flight.duration / 60)}h {flight.duration % 60}m</span>
                  <div className="w-20 h-0.5 bg-primary/40 my-1" />
                  <span className="text-[10px] uppercase font-bold text-primary">Direct Flight</span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground block">Arrival</span>
                  <span className="text-foreground">{flight.arrivalCity}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 space-y-2 shrink-0">
              <span className="text-xs text-muted-foreground font-bold uppercase block">{flight.availableSeats} Seats Left</span>
              <div className="text-2xl font-black text-primary">PKR {(flight.currentFare || flight.pricePerSeat).toLocaleString()}</div>
              {flight.fareTiers && (
                <span className="text-[10px] text-muted-foreground font-semibold block">⚡ Dynamic pricing — fare may fluctuate</span>
              )}
              <button
                disabled={bookingId === flight.id}
                onClick={() => handleBookFlight(flight)}
                className="w-full px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 text-xs inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{bookingId === flight.id ? 'Booking Ticket...' : 'Book Ticket'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
