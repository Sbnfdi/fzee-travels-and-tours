'use client';

import Link from 'next/link';
import { Tag } from 'lucide-react';

export function Hero() {
  const destinations = [
    { name: 'Dubai', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Baku', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Muscat', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop' },
    { name: 'Qatar', subtitle: 'Tour Packages', img: 'https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { name: 'UK', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=600&auto=format&fit=crop' },
    { name: 'Maldives', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop' },
    { name: 'Saudi Arabia', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <section className="w-full pb-16 pt-8 md:pt-16">
      {/* Main Content */}
      <div className="w-full relative z-10">
        
        {/* Banner */}
        <div className="max-w-4xl mx-auto text-center px-4 mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-2xl mb-6">
            Welcome To B2B Portal Of
            <span className="block text-primary mt-2">Fzee Travels & Tours</span>
          </h1>
          <p className="text-white/80 text-base md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-8">
            Your premium gateway for seamless group bookings, flights, and exclusive travel packages.
          </p>

          {/* Pricing Teaser for Credibility */}
          <Link href="/register" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-primary/50 text-white rounded-full px-5 py-2.5 shadow-xl hover:bg-white/20 transition-all group">
            <span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-8 h-8 shrink-0 shadow-lg">
              <Tag className="w-4 h-4" />
            </span>
            <span className="text-sm md:text-base font-semibold tracking-wide">
              Sample Deal: <span className="text-primary-foreground font-black mx-1 drop-shadow-md">KHI → JED from PKR 42,000</span> (Group Fare)
            </span>
            <span className="text-xs uppercase tracking-widest text-white/50 hidden md:inline ml-2 group-hover:text-white transition-colors">
              Register to unlock &rarr;
            </span>
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible hide-scrollbar snap-x">
            {destinations.map((dest, i) => (
              <Link 
                key={i} 
                href="/register" 
                className="flex-none w-[160px] md:w-auto group block rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all duration-500 hover:-translate-y-3 snap-center relative"
              >
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80" />
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  
                  {/* Register Prompt on Hover */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Register to view</span>
                  </div>

                  <div className="absolute bottom-4 left-0 w-full text-center z-20 transition-transform duration-300 group-hover:translate-y-4 group-hover:opacity-0">
                    <h3 className="font-black text-lg text-white tracking-wider drop-shadow-lg">{dest.name}</h3>
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">{dest.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
