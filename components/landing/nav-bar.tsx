'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-border z-50 sticky top-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none tracking-tight">fzee</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Travels & Tours</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="px-5 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold rounded-full transition-all duration-200">
              Home
            </Link>
            <Link href="/b2b" className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
              B2B Portal
            </Link>
            <Link href="/login" className="px-5 py-2 border border-primary/20 text-primary hover:bg-primary/5 text-xs font-bold rounded-full transition-all duration-200">
              Login
            </Link>
            <Link href="/register" className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
              Register
            </Link>
            <Link href="/blog" className="px-5 py-2 text-muted-foreground hover:text-primary text-xs font-bold rounded-full transition-colors duration-200">
              Blog
            </Link>
            <Link href="/contact" className="px-5 py-2 text-muted-foreground hover:text-primary text-xs font-bold rounded-full transition-colors duration-200">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border absolute w-full shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-lg">
              Home
            </Link>
            <Link href="/b2b" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg text-center">
              B2B Portal
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-lg text-center">
              Login
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg text-center">
              Register
            </Link>
            <Link href="/blog" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg">
              Blog
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
