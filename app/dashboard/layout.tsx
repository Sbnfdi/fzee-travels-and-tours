'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, CreditCard, Settings, LogOut, Plane, Layers, Building2, Globe, Compass, Menu, X, Tag } from 'lucide-react';

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
    { href: '/dashboard/deals', icon: Tag, label: 'Sample Deals' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white flex-col md:flex-row overflow-hidden relative font-sans">
      
      {/* Global Video Background with Premium Mesh Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-slate-950">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-lighten"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[4px]" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 font-black text-lg text-white group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/30">
            <Plane className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-white font-black text-base">FZEE</span>
            <span className="text-[9px] tracking-widest uppercase text-primary font-bold">Travels</span>
          </div>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-slate-900/40 backdrop-blur-2xl flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 border-b border-white/5 hidden md:block">
            <Link href="/" className="flex items-center gap-3 font-black text-lg text-white group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.8)] transition-all">
                <Plane className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-white font-black text-base">FZEE</span>
                <span className="text-[9px] tracking-widest uppercase text-primary font-bold">Travel & Tours</span>
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
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(var(--primary),0.1)]' 
                      : 'hover:bg-white/5 hover:text-white text-white/70'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-destructive/20 text-destructive font-medium transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-transparent w-full relative z-10">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
