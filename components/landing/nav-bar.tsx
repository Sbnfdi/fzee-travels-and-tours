'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white/5 backdrop-blur-xl border-b border-white/10 z-50 sticky top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md transition-colors group-hover:text-primary">fzee</span>
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest mt-1">Travels & Tours</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-white/90 hover:text-white transition-colors duration-200 uppercase tracking-wider">
              Home
            </Link>
            <Link href="/contact" className="text-sm font-bold text-white/90 hover:text-white transition-colors duration-200 uppercase tracking-wider">
              Contact
            </Link>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Link href="/login" className="px-6 py-2 border border-white/30 text-white hover:bg-white/10 text-xs font-bold rounded-full transition-all duration-300 uppercase tracking-wider">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] hover:shadow-[0_0_25px_rgba(var(--primary),0.7)] hover:scale-105 transition-all duration-300 uppercase tracking-wider">
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-3xl border-t border-white/10 absolute w-full shadow-2xl">
          <div className="px-4 py-6 flex flex-col gap-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-colors uppercase tracking-wider">
              Home
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-colors uppercase tracking-wider">
              Contact
            </Link>
            <div className="h-px w-full bg-white/10 my-2" />
            <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-center text-white border border-white/20 hover:bg-white/10 rounded-xl transition-colors uppercase tracking-wider">
              Login
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-center text-primary-foreground bg-primary rounded-xl transition-all uppercase tracking-wider">
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
