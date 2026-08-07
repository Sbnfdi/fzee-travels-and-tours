'use client';

import Link from 'next/link';
import { Tag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type Deal = {
  id: string;
  title: string;
  subtitle: string | null;
  price: string | null;
  image: string | null;
  isMainDeal: boolean;
};

export function Hero() {
  const [destinations, setDestinations] = useState<Deal[]>([]);
  const [mainDeal, setMainDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch('/api/public/deals');
        const data = await res.json();
        if (data.success) {
          setMainDeal(data.mainDeal);
          setDestinations(data.destinations || []);
        }
      } catch (error) {
        console.error('Failed to fetch deals', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  return (
    <section className="w-full pb-16 pt-8 md:pt-16">
      {/* Main Content */}
      <div className="w-full relative z-10">
        
        {/* Banner */}
        <div className="max-w-5xl mx-auto text-center px-4 mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight md:tracking-widest drop-shadow-2xl mb-6">
            <span className="text-white">Welcome To B2B Portal Of</span>
            <span className="block mt-2 bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
              Fzee Travels & Tours
            </span>
          </h1>
          
          <p className="text-slate-300 text-lg md:text-2xl font-medium max-w-3xl mx-auto drop-shadow-md mb-10 leading-relaxed">
            Your premium gateway for seamless group bookings, flights, and exclusive travel packages.
          </p>

          {/* Pricing Teaser for Credibility */}
          {loading ? (
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-full p-2 pr-6 shadow-2xl h-[52px]">
              <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          ) : mainDeal ? (
            <Link href="/register" className="relative inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/20 text-white rounded-full p-1.5 pr-6 shadow-2xl hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center bg-primary text-primary-foreground rounded-full w-10 h-10 shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-transform duration-300">
                <Tag className="w-4 h-4" />
              </span>
              <span className="relative text-sm md:text-base font-semibold tracking-wide flex items-center gap-2">
                <span className="text-white/80">Sample Deal:</span>
                <span className="text-primary-foreground font-black drop-shadow-md">{mainDeal.title}</span>
                {mainDeal.price && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md text-xs font-bold border border-primary/30">{mainDeal.price}</span>}
              </span>
              <span className="relative text-xs uppercase tracking-widest text-primary/80 hidden md:inline ml-2 group-hover:text-primary transition-colors font-bold">
                Register &rarr;
              </span>
            </Link>
          ) : (
             <div className="h-[52px]" />
          )}
        </div>

        {/* Destinations Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
             <div className="flex gap-4 md:gap-6 overflow-hidden py-4">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="flex-none w-[180px] h-56 md:h-64 rounded-[2rem] bg-white/5 border border-white/10 animate-pulse" />
               ))}
             </div>
          ) : destinations.length > 0 ? (
            <div className="flex flex-nowrap overflow-x-auto gap-4 md:gap-6 pb-8 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible hide-scrollbar snap-x group/container py-4">
              {destinations.map((dest) => (
                <Link 
                  key={dest.id} 
                  href="/register" 
                  className="flex-none w-[180px] md:w-auto group/card block rounded-[2rem] overflow-hidden bg-slate-900/40 backdrop-blur-md shadow-2xl border border-white/10 hover:border-primary/60 transition-all duration-500 hover:-translate-y-4 hover:scale-105 snap-center relative hover:z-20 md:hover:!opacity-100 md:group-hover/container:opacity-50"
                >
                  <div className="h-56 md:h-64 overflow-hidden relative rounded-[2rem]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 z-10 transition-opacity duration-300 group-hover/card:opacity-90" />
                    {dest.image && <img src={dest.image} alt={dest.title} className="w-full h-full object-cover group-hover/card:scale-125 group-hover/card:-rotate-2 transition-all duration-700 ease-out" />}
                    
                    {/* Register Prompt on Hover */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 scale-90 group-hover/card:scale-100">
                       <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)] border border-primary/50">Register</span>
                    </div>

                    <div className="absolute bottom-5 left-0 w-full text-center z-20 transition-transform duration-500 group-hover/card:translate-y-8 group-hover/card:opacity-0 px-2">
                      <h3 className="font-black text-xl text-white tracking-widest drop-shadow-xl">{dest.title}</h3>
                      {dest.subtitle && <p className="text-[9px] text-primary font-bold uppercase tracking-[0.3em] mt-1.5">{dest.subtitle}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

      </div>
    </section>
  );
}
