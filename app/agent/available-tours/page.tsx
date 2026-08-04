'use client';

import { useEffect, useState } from 'react';
import { Plane, Calendar, Users, Clock, Search, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface TourGroup {
  id: string;
  name: string;
  destination: string;
  duration: number;
  startDate: string;
  endDate: string;
  totalSlots: number;
  availableSlots: number;
  pricePerPerson: number;
  currency: string;
  description: string;
}

const sampleTours: TourGroup[] = [
  {
    id: 'group-1',
    name: '14-Day Umrah Executive Group Package',
    destination: 'Makkah & Madinah, Saudi Arabia',
    duration: 14,
    startDate: '2026-09-15',
    endDate: '2026-09-29',
    totalSlots: 40,
    availableSlots: 28,
    pricePerPerson: 320000,
    currency: 'PKR',
    description: 'Direct flights, 5-Star Makkah & Madinah close to Haram, full transport & guided Ziyarat.',
  },
  {
    id: 'group-2',
    name: '7-Day Skardu Autumn Paradise Expedition',
    destination: 'Skardu & Shangrila, Pakistan',
    duration: 7,
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    totalSlots: 25,
    availableSlots: 14,
    pricePerPerson: 145000,
    currency: 'PKR',
    description: 'Includes flights, luxury jeep transport, Deosai Plains excursion, and resort stay.',
  },
  {
    id: 'group-3',
    name: '5-Day Dubai Luxury City & Desert Group Package',
    destination: 'Dubai, UAE',
    duration: 5,
    startDate: '2026-11-10',
    endDate: '2026-11-15',
    totalSlots: 30,
    availableSlots: 20,
    pricePerPerson: 210000,
    currency: 'PKR',
    description: 'Includes UAE Visa, 4-Star Downtown Hotel, Desert Safari with BBQ, Dhow Cruise & Marina Tour.',
  },
  {
    id: 'group-4',
    name: '8-Day Hunza & Naran Valley Cultural Tour',
    destination: 'Hunza Valley & Naran, Pakistan',
    duration: 8,
    startDate: '2026-08-25',
    endDate: '2026-09-02',
    totalSlots: 35,
    availableSlots: 18,
    pricePerPerson: 110000,
    currency: 'PKR',
    description: 'Explore Attabad Lake, Altit & Baltit Forts, Babusar Top, and Karimabad bazaar.',
  },
];

export default function AvailableToursPage() {
  const [tours, setTours] = useState<TourGroup[]>(sampleTours);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.groups) && data.groups.length > 0) {
            setTours(data.groups);
          }
        }
      } catch (err) {
        console.error('Failed to load tour groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredTours = tours.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Available Group Tours</h1>
          <p className="text-muted-foreground mt-1">Browse verified group tour packages and reserve slots for your clients</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by destination or package..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{tour.destination}</span>
                  </span>
                  <h3 className="text-xl font-extrabold text-foreground leading-snug">{tour.name}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{tour.description}</p>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-semibold text-foreground border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{tour.duration} Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{new Date(tour.startDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{tour.availableSlots} Slots Left</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Price per PAX</span>
                <span className="text-2xl font-black text-primary">PKR {tour.pricePerPerson.toLocaleString()}</span>
              </div>

              <Link
                href={`/agent/bookings/new?groupId=${tour.id}&title=${encodeURIComponent(tour.name)}&price=${tour.pricePerPerson}`}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm"
              >
                <span>Book Package</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
