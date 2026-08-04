import Link from 'next/link';
import { BarChart3, Users, Briefcase, CreditCard, Settings, LogOut, Plane, Layers, Building2, Globe, Compass } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-border">
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
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Overview</span>
            </Link>

            <Link
              href="/dashboard/agencies"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Agencies</span>
            </Link>

            <Link
              href="/dashboard/groups"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Layers className="w-5 h-5" />
              <span>Tour Slots & Packages</span>
            </Link>

            <Link
              href="/dashboard/hotels"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span>Hotels Inventory</span>
            </Link>

            <Link
              href="/dashboard/flights"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Compass className="w-5 h-5" />
              <span>Flight Schedules</span>
            </Link>

            <Link
              href="/dashboard/visa"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>Visa Services</span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Bookings</span>
            </Link>

            <Link
              href="/dashboard/payments"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span>Payments & Top-ups</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-border">
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
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
