'use client';

import Link from 'next/link';

export function NavBar() {
  return (
    <nav className="w-full bg-white border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none">fzee</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Travels & Tours</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              Home
            </Link>
            <Link href="/b2b" className="px-4 py-1.5 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              B2B Portal
            </Link>
            <Link href="/login" className="px-4 py-1.5 bg-primary/80 text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              Login
            </Link>
            <Link href="/register" className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              Register
            </Link>
            <Link href="/blog" className="px-4 py-1.5 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              Blog
            </Link>
            <Link href="/contact" className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
