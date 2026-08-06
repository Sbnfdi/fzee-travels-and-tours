'use client';

import Link from 'next/link';
import { Plane, Building2, Map, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <section className="py-24 bg-muted/30" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Explore Our Premium <span className="text-primary">B2B Inventory</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Access exclusive rates for flights, group tours, hotels, and visa services. Log in to your agent portal to start booking instantly.
          </p>
        </div>

        {/* Static Popular Destinations Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Popular Destinations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "UAE Groups", desc: "Explore Dubai with group discounts", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop" },
              { title: "KSA Groups", desc: "Travel to Saudi Arabia with exclusive rates", img: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop" },
              { title: "Umrah Groups", desc: "Special packages for your spiritual journey", img: "https://images.unsplash.com/photo-1565552643983-6c8ea3db18de?q=80&w=600&auto=format&fit=crop" },
              { title: "Muscat Groups", desc: "Discover the beauty of Oman", img: "https://images.unsplash.com/photo-1616421946059-e93132e49c95?q=80&w=600&auto=format&fit=crop" },
              { title: "Qatar Groups", desc: "Experience Qatar's modern marvels", img: "https://images.unsplash.com/photo-1596205886280-c1f01c801e0a?q=80&w=600&auto=format&fit=crop" },
              { title: "Bahrain Groups", desc: "Discover Bahrain's rich culture", img: "https://images.unsplash.com/photo-1627885744211-5db0d60d3dce?q=80&w=600&auto=format&fit=crop" },
              { title: "UK Groups", desc: "Explore the United Kingdom", img: "https://images.unsplash.com/photo-1513635269975-59693e0cd1ce?q=80&w=600&auto=format&fit=crop" },
              { title: "All Groups", desc: "Browse all available destinations", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop" },
            ].map((cat, i) => (
              <Link href="/login" key={i} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 block text-center pb-4">
                <div className="h-40 overflow-hidden relative mb-4">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="font-bold text-foreground text-lg">{cat.title}</h4>
                <p className="text-xs text-muted-foreground px-4 mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Flights Section */}
        {flights.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Featured Flights</h3>
              </div>
              <Link href="/login" className="text-primary font-bold hover:underline hidden sm:flex items-center gap-1">
                View All Flights <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flights.map(flight => (
                <Link href="/login" key={flight.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 block relative">
                  <div className="h-40 bg-muted overflow-hidden relative">
                     {/* Placeholder flight image based on destination */}
                    <img src={`https://source.unsplash.com/600x400/?city,${flight.arrivalCity}`} alt={flight.arrivalCity} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/90">{flight.airline}</p>
                      <p className="font-black text-lg">{flight.departureCity} ✈ {flight.arrivalCity}</p>
                    </div>
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="font-bold text-foreground text-lg">{flight.currency} {flight.pricePerSeat.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Groups / Umrah Section */}
        {groups.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Umrah & Group Tours</h3>
              </div>
              <Link href="/login" className="text-primary font-bold hover:underline hidden sm:flex items-center gap-1">
                View All Tours <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {groups.map(group => (
                <Link href="/login" key={group.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 block relative">
                  <div className="h-48 bg-muted overflow-hidden relative">
                    <img src={group.image || `https://source.unsplash.com/600x400/?${group.destination}`} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1565552643983-6c8ea3db18de?q=80&w=800&auto=format&fit=crop' }} />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {group.duration} Days
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-black text-xl line-clamp-1">{group.name}</h4>
                      <p className="text-sm font-medium text-white/80">{group.destination}</p>
                    </div>
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-lg">{group.currency} {group.pricePerPerson.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Hotels Section */}
        {hotels.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Premium Hotels</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotels.map(hotel => (
                <Link href="/login" key={hotel.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 block relative">
                  <div className="h-40 bg-muted overflow-hidden relative">
                    <img src={hotel.image || `https://source.unsplash.com/600x400/?hotel,${hotel.city}`} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=800&auto=format&fit=crop' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-bold text-lg line-clamp-1">{hotel.name}</h4>
                      <p className="text-xs font-medium text-white/80">{hotel.city}, {hotel.country}</p>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <p className="font-bold text-foreground">{hotel.currency} {hotel.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/night</span></p>
                    <span className="text-xs font-bold px-2 py-1 bg-yellow-400/20 text-yellow-600 rounded-md">{"★".repeat(hotel.starRating)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
