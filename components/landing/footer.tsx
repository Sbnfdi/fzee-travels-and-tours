'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto">
      {/* Top Black Bar */}
      <div className="bg-black text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
          <div>
            10+ Years Of Trust
          </div>
          <div className="flex gap-6">
            <a href="tel:03304084080" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              <span>Call Support 24/7</span>
            </a>
            <a href="mailto:info@fzeetravels.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4 text-primary" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer with Cityscape Background */}
      <div className="relative bg-slate-100 py-16 border-t-4 border-primary overflow-hidden">
        {/* Cityscape Background image overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none bg-bottom bg-repeat-x"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000&auto=format&fit=crop')",
            backgroundSize: 'contain'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex flex-col">
              <span className="text-6xl md:text-8xl font-black text-primary leading-none">fzee</span>
              <span className="text-sm md:text-xl uppercase font-bold text-gray-700 tracking-[0.3em]">Travels & Tours</span>
            </Link>
          </div>

          {/* Links Area */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm font-semibold text-gray-700">
            <div className="flex flex-col gap-3">
              <h4 className="text-black font-black uppercase mb-2">Company</h4>
              <Link href="#" className="hover:text-primary transition">About Us</Link>
              <Link href="#" className="hover:text-primary transition">Careers</Link>
              <Link href="#" className="hover:text-primary transition">Blog</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-black font-black uppercase mb-2">Services</h4>
              <Link href="#" className="hover:text-primary transition">B2B Portal</Link>
              <Link href="#" className="hover:text-primary transition">Flights</Link>
              <Link href="#" className="hover:text-primary transition">Tours</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-black font-black uppercase mb-2">Legal</h4>
              <Link href="#" className="hover:text-primary transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition">Refunds</Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-gray-200 py-3 text-center text-xs text-gray-500 font-medium">
        © {new Date().getFullYear()} Fzee Travels and Tours. All rights reserved.
      </div>
    </footer>
  );
}
