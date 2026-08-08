'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card text-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & About Us */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
                <span className="text-base">F</span>
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-foreground font-black text-lg tracking-tight">FZEE</span>
                <span className="text-[9px] tracking-widest uppercase text-primary font-black mt-0.5">Travel & Tours</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Premium B2B travel portal providing travel agents with group tours, flight management, and real-time seat bookings, backed by dedicated support.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-widest uppercase text-foreground">SERVICES</h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Group Tours</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Flight Reservations</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Hotel Accommodations</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Visa Assistance</Link></li>
            </ul>
          </div>

          {/* Agent Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-widest uppercase text-foreground">AGENT PORTAL</h4>
            <ul className="space-y-2 text-xs font-medium text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Agent Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Register Agency</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">B2B Dashboard Access</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-widest uppercase text-foreground">CONTACT US</h4>
            <div className="space-y-1.5 text-xs font-medium">
              <p className="font-extrabold text-foreground">Fzee Travel & Tours</p>
              <p className="text-muted-foreground">Support Helplines</p>
              <a href="mailto:info@fzeetravels.com" className="text-primary font-bold hover:underline block pt-1">
                info@fzeetravels.com
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <p>© {new Date().getFullYear()} Fzee Travel & Tours. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
