'use client';

import Link from 'next/link';
import { ArrowRight, Plane, Building2, Map, ShieldCheck } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')",
            backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold uppercase tracking-wider mb-8 shadow-2xl">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Official B2B Partner Portal</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 drop-shadow-2xl leading-tight">
          Empower Your Travel Agency with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400 drop-shadow-none">Fzee Travels & Tours</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed mb-10 drop-shadow-lg">
          Register your agency instantly and streamline your group tours, flight bookings, and hotel arrangements. Zero setup fees, unlimited growth.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-bold text-lg shadow-[0_10px_40px_-10px_var(--color-primary)] hover:shadow-[0_10px_50px_-5px_var(--color-primary)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center gap-2">
              Register Agency Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link
            href="#services"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl inline-flex items-center gap-2"
          >
            <span>Explore Inventory</span>
          </Link>
        </div>

        {/* Floating Quick Stats or Icons */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto opacity-90">
           <div className="flex flex-col items-center gap-2 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">Global Flights</span>
           </div>
           <div className="flex flex-col items-center gap-2 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">Exclusive Tours</span>
           </div>
           <div className="flex flex-col items-center gap-2 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">Premium Hotels</span>
           </div>
        </div>
      </div>
    </section>
  );
}
