'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, FileText, CheckCircle2, Globe, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VisaPackage {
  id: string;
  country: string;
  visaType: string;
  processingDays: number;
  pricePerPerson: number;
  requirements: string;
  description: string;
}

export default function AgentVisaPage() {
  const router = useRouter();
  const [visas, setVisas] = useState<VisaPackage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisas = async () => {
      try {
        const res = await fetch('/api/visa');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.visaServices)) {
            setVisas(data.visaServices);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisas();
  }, []);

  const handleApplyVisa = (visa: VisaPackage) => {
    router.push(`/agent/visa/${visa.id}/book`);
  };

  const filteredVisas = visas.filter(
    (v) =>
      v.country.toLowerCase().includes(search.toLowerCase()) ||
      v.visaType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Visa Processing Services</h1>
          <p className="text-muted-foreground mt-1">Submit Umrah E-Visas, Dubai Tourist Visas & Global Visa Applications in PKR</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country (e.g. Saudi Arabia, UAE)..."
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

      {/* Visa Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredVisas.map((visa) => (
          <div key={visa.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/40 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{visa.country}</span>
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{visa.processingDays} Days Process</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-foreground">{visa.visaType}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{visa.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Visa Fee / PAX</span>
                <span className="text-2xl font-black text-primary">PKR {visa.pricePerPerson.toLocaleString()}</span>
              </div>

              <button
                disabled={applyingId === visa.id}
                onClick={() => handleApplyVisa(visa)}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 text-sm disabled:opacity-50"
              >
                {applyingId === visa.id ? 'Applying...' : 'Apply Visa'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
