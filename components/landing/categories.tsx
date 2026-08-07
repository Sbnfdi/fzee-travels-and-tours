'use client';

import Link from 'next/link';
import { Plane, Building2, Map, ArrowRight } from 'lucide-react';
import { Flight, Group, Hotel, VisaService } from '@prisma/client';

export function Categories({ 
  flights, 
  groups, 
  hotels, 
  visas 
}: { 
  flights: Flight[], 
  groups: Group[], 
  hotels: Hotel[], 
  visas: VisaService[] 
}) {
  return (
    <section className="py-24 bg-muted/30" id="inventory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Explore Our Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Inventory</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Access exclusive rates for flights, group tours, hotels, and visa services. Log in to your agent portal to start booking instantly.
          </p>
        </div>

        {/* Static Popular Destinations Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Popular Destinations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "UAE Groups", desc: "Explore Dubai with group discounts", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop", badge: "HOT DEAL" },
              { title: "KSA Groups", desc: "Travel to Saudi Arabia", img: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop", badge: "PREMIUM" },
              { title: "Umrah Groups", desc: "Special packages", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop", badge: "BEST SELLER" },
              { title: "Muscat Groups", desc: "Discover the beauty of Oman", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop" },
            ].map((cat, i) => (
              <Link href="/login" key={i} className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 block relative border border-border">
                {cat.badge && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md tracking-wider uppercase">
                    {cat.badge}
                  </div>
                )}
                <div className="h-56 overflow-hidden relative">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h4 className="font-bold text-xl">{cat.title}</h4>
                    <p className="text-sm text-white/80 mt-1">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Flights Section */}
        {flights.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Featured Flights</h3>
              </div>
              <Link href="/login" className="text-primary font-bold hover:underline hidden sm:flex items-center gap-1">
                View All Flights <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flights.map((flight, i) => {
                const flightImgs = [
                  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600&auto=format&fit=crop"
                ];
                return (
                  <Link href="/login" key={flight.id} className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 block relative border border-border flex flex-col">
                    <div className="h-40 overflow-hidden relative">
                      <img src={flightImgs[i % flightImgs.length]} alt={flight.arrivalCity} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md inline-block mb-1">{flight.airline}</p>
                        <p className="font-black text-lg">{flight.departureCity} ✈ {flight.arrivalCity}</p>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-center bg-card flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                        <p className="font-bold text-primary text-xl">{flight.currency} {flight.pricePerSeat.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Groups Section */}
        {groups.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Group Tours & Umrah</h3>
              </div>
              <Link href="/login" className="text-primary font-bold hover:underline hidden sm:flex items-center gap-1">
                View All Tours <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groups.map((group, i) => {
                const groupImgs = [
                  "https://images.unsplash.com/photo-1565552643983-6c8ea3db18de?q=80&w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1596205886280-c1f01c801e0a?q=80&w=600&auto=format&fit=crop"
                ];
                return (
                  <Link href="/login" key={group.id} className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 block relative border border-border flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      <img src={group.image || groupImgs[i % groupImgs.length]} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                        {group.duration} Days
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                        <h4 className="font-black text-xl line-clamp-1">{group.name}</h4>
                        <p className="text-sm font-medium text-white/80">{group.destination}</p>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-center bg-card flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Per Person</p>
                        <p className="font-bold text-primary text-xl">{group.currency} {group.pricePerPerson.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
