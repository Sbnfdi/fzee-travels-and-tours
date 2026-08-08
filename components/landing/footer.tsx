'use client';

import Link from 'next/link';
import { Plane, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-3xl pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & About Us */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <Plane className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-white font-black text-2xl tracking-tight">FZEE</span>
                <span className="text-[11px] tracking-widest uppercase text-primary font-extrabold">Travel & Tours</span>
              </div>
            </Link>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed font-medium">
              <p>
                Established in 2012, Fzee Travel & Tours is a premier B2B travel management company empowering travel agents across Pakistan with exclusive deals and seamless booking technology.
              </p>
              <ul className="space-y-2 pt-2 text-xs">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> IATA Accredited Agent</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> SECP Registered Company</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Department of Tourist Services (DTS)</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest uppercase text-sm">Contact Us</h4>
            <div className="space-y-4">
              <a href="tel:03304084080" className="flex items-start gap-3 text-white/70 hover:text-primary transition-colors group">
                <Phone className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">
                  <div className="text-white font-bold">General Inquiries</div>
                  0330 4084080
                </div>
              </a>
              <a href="tel:03314084080" className="flex items-start gap-3 text-white/70 hover:text-primary transition-colors group">
                <Phone className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">
                  <div className="text-white font-bold">B2B Agent Desk</div>
                  0331 4084080
                </div>
              </a>
              <a href="mailto:info@fzeetravels.com" className="flex items-start gap-3 text-white/70 hover:text-primary transition-colors group">
                <Mail className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">
                  <div className="text-white font-bold">Email Support</div>
                  info@fzeetravels.com
                </div>
              </a>
              <div className="flex items-start gap-3 text-white/70 group">
                <MapPin className="w-5 h-5 shrink-0 group-hover:text-primary transition-colors" />
                <div className="text-sm font-medium">
                  <div className="text-white font-bold">Head Office</div>
                  Shop 06, Building Services Plaza, Mall Road, Saddar, Rawalpindi / Islamabad
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest uppercase text-sm">Portal Access</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-block text-sm font-medium">Agent Login</Link>
              </li>
              <li>
                <Link href="/register" className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-block text-sm font-medium">Register New Agency</Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-block text-sm font-medium">Group Fare Inventory</Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-white hover:translate-x-1 transition-all inline-block text-sm font-medium">Umrah Packages 2024</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Legal */}
          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest uppercase text-sm">Stay Updated</h4>
            <p className="text-sm text-white/70 font-medium">Subscribe for exclusive B2B fare alerts.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="agent@agency.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-semibold text-white/50">
            &copy; {new Date().getFullYear()} Fzee Travel & Tours. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Terms of Service</Link>
            <Link href="#" className="text-white/50 hover:text-white text-xs font-medium transition-colors">Agent Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
