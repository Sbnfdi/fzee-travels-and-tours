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
    <section className="bg-gray-50 pb-8">
      {/* Banner */}
      <div className="w-full bg-primary text-primary-foreground text-center py-4 px-4 shadow-md">
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-wide">
          Welcome To B2B Portal Of Fzee Travels & Tours
        </h1>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible">
          {destinations.map((dest, i) => (
            <Link key={i} href="/login" className="flex-none w-32 md:w-auto group block rounded-lg overflow-hidden bg-white shadow-sm border border-border hover:shadow-md transition">
              <div className="h-24 overflow-hidden">
                <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-2 text-center bg-card border-t-2 border-primary">
                <h3 className="font-bold text-sm text-foreground">{dest.name}</h3>
                <p className="text-[10px] text-muted-foreground">{dest.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
