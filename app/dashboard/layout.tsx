'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Briefcase, CreditCard, Settings, LogOut, Plane, 
  Layers, Building2, Globe, Compass, Menu, X, Tag, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row overflow-hidden relative font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <Link href="/" className="flex items-center gap-3 font-black text-lg text-foreground group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/20">
            <span className="text-sm">F</span>
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-black text-base">FZEE</span>
            <span className="text-[9px] tracking-widest uppercase text-primary font-black">Admin Desk</span>
          </div>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-muted rounded-xl text-foreground hover:text-primary transition-colors"
          aria-label="Toggle Mobile Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 border-r border-border bg-card shadow-sm flex flex-col justify-between
        transform transition-all duration-300 ease-in-out md:static md:translate-x-0 shrink-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
      `}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Sidebar Top Bar with Toggle Button */}
          <div className="p-4 border-b border-border/80 hidden md:flex items-center justify-between gap-2">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center gap-3 font-black text-lg text-foreground group overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/20 shrink-0">
                  <span className="text-base">F</span>
                </div>
                <div className="flex flex-col">
                  <span className="leading-none text-foreground font-black text-lg tracking-tight">FZEE</span>
                  <span className="text-[9px] tracking-widest uppercase text-primary font-black mt-0.5">Admin Portal</span>
                </div>
              </Link>
            ) : (
              <Link href="/" className="mx-auto" title="FZEE Admin Portal">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/20">
                  <span className="text-base">F</span>
                </div>
              </Link>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted transition-colors shrink-0"
              title={isCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1.5 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={isCollapsed ? link.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive 
                      ? 'bg-primary text-primary-foreground font-extrabold shadow-md shadow-primary/20' 
                      : 'hover:bg-rose-50 hover:text-primary text-muted-foreground font-semibold'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-border shrink-0">
          <Link
            href="/login"
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-destructive font-bold transition-colors text-sm ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background/50 w-full relative z-10">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
