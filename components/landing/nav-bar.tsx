'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, Compass, Star, MessageCircle, LogIn, UserPlus } from 'lucide-react';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-card/95 backdrop-blur-md border-b border-border/80 z-50 sticky top-0 transition-all duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-lg">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-foreground tracking-tight leading-none">FZEE</span>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">Travel & Tours</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-bold">
            <Link href="/" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1">
              <Home className="w-4 h-4 text-primary" />
              <span>Home</span>
            </Link>

            <Link href="#features" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-1">
              <Compass className="w-4 h-4 text-muted-foreground" />
              <span>Features</span>
            </Link>

            <Link href="#testimonials" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Testimonials</span>
            </Link>

            <a 
              href="https://wa.me/923314084080" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-black"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp Help</span>
            </a>

            <div className="w-px h-6 bg-border mx-1" />

            <Link href="/login" className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>

            <Link 
              href="/register" 
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Free</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="https://wa.me/923314084080"
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 flex items-center justify-center"
              aria-label="WhatsApp Support"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2 transition-colors rounded-xl bg-muted/60"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-card border-t border-border absolute w-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-6 flex flex-col gap-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-rose-50 hover:text-primary rounded-xl transition-colors">
              <Home className="w-4 h-4 text-primary" />
              <span>Home Page</span>
            </Link>

            <Link href="#features" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-rose-50 hover:text-primary rounded-xl transition-colors">
              <Compass className="w-4 h-4 text-muted-foreground" />
              <span>Features</span>
            </Link>

            <Link href="#testimonials" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-rose-50 hover:text-primary rounded-xl transition-colors">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Testimonials</span>
            </Link>

            <a href="https://wa.me/923314084080" target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl transition-colors border border-emerald-200">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Direct Support</span>
            </a>

            <div className="h-px bg-border my-1" />

            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors border border-border">
              <LogIn className="w-4 h-4" />
              <span>Sign In to Agent Portal</span>
            </Link>

            <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-black rounded-xl shadow-md uppercase tracking-wider">
              <UserPlus className="w-4 h-4" />
              <span>Register Free</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
