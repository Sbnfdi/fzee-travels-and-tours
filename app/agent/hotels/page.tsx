'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, Star, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HotelItem {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  starRating: number;
  pricePerNight: number;
  description: string;
  amenities: string;
}

export default function AgentHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch('/api/hotels');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.hotels)) {
            setHotels(data.hotels);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleReserveRoom = (hotel: HotelItem) => {
    router.push(`/agent/hotels/${hotel.id}/book`);
  };

  const filteredHotels = hotels.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === 'all' || h.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Hotel Reservations</h1>
          <p className="text-muted-foreground mt-1">Book premium 4-Star & 5-Star hotel rooms for your agency clients in PKR</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotel name or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Cities</option>
            <option value="Makkah">Makkah</option>
            <option value="Madinah">Madinah</option>
            <option value="Skardu">Skardu</option>
            <option value="Dubai">Dubai</option>
          </select>
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

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    {hotel.city}, {hotel.country}
                  </span>
                  <h3 className="text-xl font-extrabold text-foreground leading-snug">{hotel.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="text-xs font-black">{hotel.starRating}-Star</span>
                </div>
              </div>

              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{hotel.address}</span>
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">{hotel.description}</p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Rate / Night</span>
                <span className="text-2xl font-black text-primary">PKR {hotel.pricePerNight.toLocaleString()}</span>
              </div>

              <button
                disabled={reservingId === hotel.id}
                onClick={() => handleReserveRoom(hotel)}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 text-sm disabled:opacity-50"
              >
                {reservingId === hotel.id ? 'Reserving...' : 'Reserve Room'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
