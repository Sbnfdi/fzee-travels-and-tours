'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-card/95 backdrop-blur-md border-b border-border/80 z-50 sticky top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md shadow-primary/20">
              <span className="text-lg">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-foreground tracking-tight leading-none">FZEE</span>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">Travel & Tours</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-200">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-200">
              Testimonials
            </Link>
            <Link href="/login" className="text-sm font-bold text-foreground hover:text-primary transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-wider">
              Register Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border absolute w-full shadow-2xl">
          <div className="px-4 py-6 flex flex-col gap-3">
            <Link href="#features" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors">
              Features
            </Link>
            <Link href="#testimonials" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors">
              Testimonials
            </Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-primary text-primary-foreground text-sm font-black rounded-xl shadow-md uppercase tracking-wider">
              Register Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
