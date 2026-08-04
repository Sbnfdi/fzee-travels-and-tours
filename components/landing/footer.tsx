'use client';

import Link from 'next/link';
import { Plane } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 font-black text-xl text-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Plane className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-foreground font-black text-lg">FZEE</span>
                <span className="text-[9px] tracking-widest uppercase text-primary font-bold">Travels & Tours</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Premium B2B travel portal providing travel agents with seamless group tour management, real-time bookings, and dedicated support.
            </p>
          </div>

          {/* Navigation Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Group Tours
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Flight Reservations
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Hotel Accommodations
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Visa Assistance
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Agent Portal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Agent Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                  Register Agency
                </Link>
              </li>
              <li>
                <Link href="/agent" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="font-medium text-foreground">Fzee Travels and Tours</li>
              <li>Support & Inquiries</li>
              <li className="text-primary font-semibold">info@fzeetravels.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Fzee Travels and Tours. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
