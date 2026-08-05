'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Plane } from 'lucide-react';
import { WhatsAppButton } from '@/components/support/whatsapp-button';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-foreground group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-foreground font-black text-xl">FZEE</span>
              <span className="text-[10px] tracking-widest uppercase text-primary font-bold">Travels & Tours</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Features
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Testimonials
            </Link>
            <WhatsAppButton variant="solid" size="sm">
              WhatsApp Support
            </WhatsAppButton>
            <Link href="/login" className="text-foreground hover:text-primary transition-colors font-semibold text-sm">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition-all font-semibold text-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              Register Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-2 border-t border-border space-y-3">
            <Link href="#features" className="block px-3 py-2 text-foreground font-medium hover:bg-muted rounded-lg" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="#testimonials" className="block px-3 py-2 text-foreground font-medium hover:bg-muted rounded-lg" onClick={() => setIsOpen(false)}>
              Testimonials
            </Link>
            <div className="px-3 py-1">
              <WhatsAppButton variant="solid" size="sm" className="w-full justify-center">
                WhatsApp Support (0330 4084080)
              </WhatsAppButton>
            </div>
            <Link href="/login" className="block px-3 py-2 text-foreground font-medium hover:bg-muted rounded-lg" onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2.5 bg-primary text-primary-foreground text-center rounded-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Register Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
