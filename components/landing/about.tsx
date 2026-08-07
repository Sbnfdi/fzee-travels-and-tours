'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function About() {
  return (
    <section className="py-24 bg-gradient-to-br from-background to-muted/50 overflow-hidden relative">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative group perspective-1000">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-700 ease-out group-hover:rotate-y-2 group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop" 
                alt="About Fzee Travels" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-black text-xl">10+</span>
                </div>
                <div>
                  <p className="text-foreground font-bold leading-tight">Years of<br/>Excellence</p>
                </div>
              </div>
            </div>
            
            {/* Background accent layer */}
            <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] -z-10 rotate-3 transition-transform duration-700 group-hover:rotate-6"></div>
          </div>

          {/* Text Side */}
          <div className="space-y-8 relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 relative inline-block">
                Your Trusted Partner in Travel
                {/* Gradient Underline */}
                <span className="absolute -bottom-2 left-0 w-24 h-1.5 bg-gradient-to-r from-primary to-rose-400 rounded-full"></span>
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Fzee Travels & Tours is a premier B2B travel management platform designed to empower agencies with world-class inventory, unbeatable rates, and seamless booking experiences. We bridge the gap between travel professionals and global suppliers.
            </p>

            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                "Global Flight Inventory",
                "Exclusive Group Tours",
                "Premium Hotel Rates",
                "Hassle-free Visa Processing",
                "Instant Wallet Recharging",
                "Dedicated 24/7 B2B Support"
              ].map((service, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{service}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <a href="/about" className="inline-flex items-center justify-center px-8 py-3.5 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/30 group">
                Discover Our Story
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
