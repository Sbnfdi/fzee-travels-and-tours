'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plane, MapPin, Mail, Facebook, Twitter, Instagram, Linkedin, ChevronDown, LogIn, UserPlus, Menu, X } from 'lucide-react';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupsOpen, setIsGroupsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm font-['Inter',sans-serif]">
      {/* Top Bar (Target Replica) */}
      <div className="border-b border-gray-100 py-1 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[13px] font-medium text-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Office # 7,8,9 Ground Floor New Madina Market, Main bazar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <a href="mailto:info@fzeetravels.com" className="hover:text-primary transition-colors">info@fzeetravels.com</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Facebook className="w-3.5 h-3.5" /></a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors"><Linkedin className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[70px]">
          {/* Logo (Kept Fzee as requested) */}
          <Link href="/" className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-foreground group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <Plane className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-foreground font-black text-xl">FZEE</span>
              <span className="text-[10px] tracking-widest uppercase text-primary font-bold">Travels & Tours</span>
            </div>
          </Link>

          {/* Desktop Menu (Target Replica styles) */}
          <div className="hidden lg:flex items-center">
            <Link href="/" className="mx-1 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform">
              Home
            </Link>
            
            {/* Groups Dropdown */}
            <div className="relative group mx-1">
              <button 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform flex items-center gap-1.5"
                onMouseEnter={() => setIsGroupsOpen(true)}
                onMouseLeave={() => setIsGroupsOpen(false)}
              >
                Groups <ChevronDown className="w-4 h-4" />
              </button>
              {isGroupsOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  onMouseEnter={() => setIsGroupsOpen(true)}
                  onMouseLeave={() => setIsGroupsOpen(false)}
                >
                  <Link href="#" className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-primary hover:text-white transition-colors">Umrah Group</Link>
                  <Link href="#" className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-primary hover:text-white transition-colors">UAE Groups</Link>
                  <Link href="#" className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-primary hover:text-white transition-colors">KSA Groups</Link>
                  <Link href="#" className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-primary hover:text-white transition-colors">UK Groups</Link>
                </div>
              )}
            </div>

            <Link href="#deals" className="mx-1 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform">Deals</Link>
            <Link href="#about" className="mx-1 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform">About</Link>
            <Link href="#contact" className="mx-1 px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-transform">Contact</Link>

            <div className="ml-4 flex items-center gap-2">
              <Link href="/login" className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link href="/register" className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/" className="px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg">Home</Link>
            <Link href="#" className="px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg">Groups</Link>
            <Link href="#deals" className="px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg">Deals</Link>
            <Link href="#about" className="px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-lg">About</Link>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-primary hover:bg-gray-50 rounded-lg flex items-center gap-2"><LogIn className="w-4 h-4" /> Login</Link>
          </div>
        )}
      </div>
    </header>
  );
}
