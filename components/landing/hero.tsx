'use client';

import Link from 'next/link';

export function Hero() {
  const destinations = [
    { name: 'Dubai', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop' },
    { name: 'Baku', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop' },
    { name: 'Muscat', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop' },
    { name: 'Qatar', subtitle: 'Tour Packages', img: 'https://images.pexels.com/photos/3787839/pexels-photo-3787839.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { name: 'UK', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=600&auto=format&fit=crop' },
    { name: 'Maldives', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop' },
    { name: 'Saudi Arabia', subtitle: 'Tour Packages', img: 'https://images.unsplash.com/photo-1565552643983-6c8ea3db18de?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-slate-900 pb-12">
      {/* Background Video & Fallback Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Fallback Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Banner */}
        <div className="w-full bg-primary/90 backdrop-blur-md text-primary-foreground text-center py-6 px-4 shadow-lg border-b border-primary-foreground/10">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest drop-shadow-sm">
            Welcome To B2B Portal Of Fzee Travels & Tours
          </h1>
          <p className="mt-2 text-primary-foreground/80 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Your premium gateway for seamless group bookings, flights, and exclusive travel packages.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-nowrap overflow-x-auto gap-5 pb-6 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible hide-scrollbar snap-x">
            {destinations.map((dest, i) => (
              <Link 
                key={i} 
                href="/login" 
                className="flex-none w-[140px] md:w-auto group block rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-2 snap-center"
              >
                <div className="h-32 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                </div>
                <div className="p-3 text-center bg-white border-t-4 border-primary">
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">{dest.name}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">{dest.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
