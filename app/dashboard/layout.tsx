'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, CreditCard, Settings, LogOut, Plane, Layers, Building2, Globe, Compass, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/dashboard', icon: BarChart3, label: 'Overview' },
    { href: '/dashboard/agencies', icon: Briefcase, label: 'Agencies' },
    { href: '/dashboard/groups', icon: Layers, label: 'Tour Slots & Packages' },
    { href: '/dashboard/hotels', icon: Building2, label: 'Hotels Inventory' },
    { href: '/dashboard/flights', icon: Compass, label: 'Flight Schedules' },
    { href: '/dashboard/visa', icon: Globe, label: 'Visa Services' },
    { href: '/dashboard/bookings', icon: Users, label: 'Bookings' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Payments & Top-ups' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-3 font-black text-lg text-foreground group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30">
            <Plane className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-black text-base">FZEE</span>
            <span className="text-[9px] tracking-widest uppercase text-primary font-bold">Travels</span>
          </div>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-muted rounded-lg text-foreground"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 border-b border-border hidden md:block">
            <Link href="/" className="flex items-center gap-3 font-black text-lg text-foreground group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30">
                <Plane className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-foreground font-black text-base">FZEE</span>
                <span className="text-[9px] tracking-widest uppercase text-primary font-bold">Travels & Tours</span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'hover:bg-primary/10 hover:text-primary text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive font-medium transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20 w-full">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
