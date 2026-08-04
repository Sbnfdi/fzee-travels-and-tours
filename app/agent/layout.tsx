import Link from 'next/link';
import { BarChart3, Plane, Wallet, FileText, Settings, LogOut, Building2, Globe, Users, Compass } from 'lucide-react';

export default function AgentLayout({
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
              href="/agent"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/agent/available-tours"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Plane className="w-4 h-4" />
              <span>Group Tours</span>
            </Link>

            <Link
              href="/agent/hotels"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Hotel Reservations</span>
            </Link>

            <Link
              href="/agent/flights"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Flight Ticketing</span>
            </Link>

            <Link
              href="/agent/visa"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Visa Services</span>
            </Link>

            <Link
              href="/agent/bookings"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Bookings History</span>
            </Link>

            <Link
              href="/agent/wallet"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Agency Wallet</span>
            </Link>

            <Link
              href="/agent/crm"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Client CRM & Leads</span>
            </Link>

            <Link
              href="/agent/settings"
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Agency Settings</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <Link
            href="/login"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-destructive/10 text-destructive font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
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
