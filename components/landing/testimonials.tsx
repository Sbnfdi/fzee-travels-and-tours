'use client';

import { useState } from 'react';
import { Star, Quote, ShieldCheck, MapPin, CheckCircle2, Building2, UserCheck, Sparkles, ThumbsUp } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  province: string;
  category: 'b2b' | 'umrah' | 'group';
  rating: number;
  badge: string;
  content: string;
  avatarBg: string;
  initials: string;
  verified: boolean;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Chaudhry Muhammad Tariq',
    role: 'Managing Director',
    company: 'Al-Makkah Travel & Tours (Pvt) Ltd',
    city: 'Lahore',
    province: 'Punjab',
    category: 'b2b',
    rating: 5,
    badge: 'Umrah & Group Fares Partner',
    content:
      "Fzee Travels has transformed how we handle group ticket bookings from Lahore to Jeddah and Madinah. Their B2B portal pricing is completely unbeatable, and instant seat confirmation saved our agency hundreds of hours during peak Ramadan and Rabi-ul-Awal seasons.",
    avatarBg: 'bg-emerald-600',
    initials: 'MT',
    verified: true,
    date: 'Agent since 2021',
  },
  {
    id: '2',
    name: 'Sheikh Usman Ali',
    role: 'CEO',
    company: 'Falcon Express Travel Services',
    city: 'Karachi',
    province: 'Sindh',
    category: 'b2b',
    rating: 5,
    badge: 'B2B Agent Portal',
    content:
      'As a travel agency operating in Karachi for over 12 years, finding reliable fixed-seat inventory for Dubai, Baku, and Gulf routes was always a struggle until we partnered with Fzee Travel. Their real-time wallet ledger and sub-agent ticketing system are top-notch.',
    avatarBg: 'bg-indigo-600',
    initials: 'UA',
    verified: true,
    date: 'Agent since 2020',
  },
  {
    id: '3',
    name: 'Hajra Bibi & Family',
    role: 'Pilgrim / Family Lead',
    company: 'Executive Umrah Group',
    city: 'Islamabad',
    province: 'ICT',
    category: 'umrah',
    rating: 5,
    badge: 'VIP Umrah Package',
    content:
      'We booked our family 15-day VIP Umrah package through Fzee Travels. From PIA flight ticketing to 5-star luxury hotel accommodations in Makkah right near the Haram boundary, everything was flawlessly organized. Truly transparent and honorable service.',
    avatarBg: 'bg-amber-600',
    initials: 'HB',
    verified: true,
    date: 'Traveled Dec 2024',
  },
  {
    id: '4',
    name: 'Malik Hammad Raza',
    role: 'Founder',
    company: 'Raza International Tourism',
    city: 'Rawalpindi',
    province: 'Punjab',
    category: 'group',
    rating: 5,
    badge: 'Bulk Seat Specialist',
    content:
      "Fzee's sub-agent ticket issuance portal is lighting fast. We regularly issue 50+ group flight tickets weekly for Muscat and Qatar. Their refund and reissuance support is smoother and more transparent than any other vendor in Pakistan.",
    avatarBg: 'bg-blue-600',
    initials: 'HR',
    verified: true,
    date: 'Agent since 2022',
  },
  {
    id: '5',
    name: 'Syed Shahzaib Gillani',
    role: 'Head of Operations',
    company: 'Khyber Tour Operators',
    city: 'Peshawar',
    province: 'KPK',
    category: 'b2b',
    rating: 5,
    badge: 'Corporate & Visa Partner',
    content:
      'The Baku and Dubai fixed-seat allocations provided by Fzee Travels allowed us to offer guaranteed group departures from Islamabad and Peshawar. Highly professional team with excellent 24/7 WhatsApp agent support.',
    avatarBg: 'bg-teal-600',
    initials: 'SG',
    verified: true,
    date: 'Agent since 2021',
  },
  {
    id: '6',
    name: 'Zubair Ahmed Khan',
    role: 'Director',
    company: 'Al-Baraka Travels',
    city: 'Faisalabad',
    province: 'Punjab',
    category: 'group',
    rating: 5,
    badge: 'Flight Inventory Partner',
    content:
      'Hands down the best flight inventory rates in Pakistan for registered travel agencies. Automated GDS ticket printing and wallet balance management make daily operations completely effortless for my staff.',
    avatarBg: 'bg-rose-600',
    initials: 'ZK',
    verified: true,
    date: 'Agent since 2023',
  },
];

export function Testimonials() {
  const [activeTab, setActiveTab] = useState<'all' | 'b2b' | 'umrah' | 'group'>('all');

  const filteredTestimonials =
    activeTab === 'all'
      ? testimonials
      : testimonials.filter((item) => item.category === activeTab);

  return (
    <section id="testimonials" className="w-full py-24 bg-gradient-to-b from-slate-50 via-muted/30 to-background border-t border-border/40 relative overflow-hidden">
      {/* Background Decorative Blur Element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] bg-rose-100/70 text-rose-700 px-4 py-1.5 rounded-full border border-rose-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            PARTNER SUCCESS & VERIFIED REVIEWS
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Trusted by 500+ Travel Agencies Across Pakistan
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            From Lahore and Karachi to Islamabad and Peshawar, see why top Pakistani travel agents and pilgrims choose <span className="font-bold text-foreground">Fzee Travel & Tours</span> for group flights & Umrah packages.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All Reviews', count: testimonials.length },
            { id: 'b2b', label: 'B2B Travel Agencies', count: testimonials.filter(t => t.category === 'b2b').length },
            { id: 'umrah', label: 'Umrah & Hajj Pilgrims', count: testimonials.filter(t => t.category === 'umrah').length },
            { id: 'group', label: 'Group Ticket Partners', count: testimonials.filter(t => t.category === 'group').length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border/60'
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-7 rounded-2xl bg-card border border-border/80 shadow-xs relative flex flex-col justify-between hover:border-primary/40 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 w-9 h-9 text-rose-200/50 pointer-events-none group-hover:text-rose-300/80 transition-colors" />

              <div>
                {/* Badge & City */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                    <Building2 className="w-3 h-3" />
                    {testimonial.badge}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {testimonial.city}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-muted-foreground ml-1.5">5.0</span>
                </div>

                {/* Content */}
                <p className="text-foreground/90 leading-relaxed text-sm italic mb-6 font-medium">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-5 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${testimonial.avatarBg} text-white font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-white shrink-0`}>
                    {testimonial.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-foreground text-sm tracking-tight truncate">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (
                        <span title="Verified Travel Partner">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                      {testimonial.role}
                    </p>
                    <p className="text-[11px] text-foreground/80 font-bold truncate">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust & Verification Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck className="w-8 h-8 text-rose-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pakistan Registered Travel & Tourism Partner
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  IATA & DTS Compliant
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Providing verified group fares, sub-agent balance ledgers, and direct hotel contract rates for travel agencies across Lahore, Karachi, Islamabad, Peshawar, Rawalpindi & Faisalabad.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6">
            <div className="text-center">
              <p className="text-2xl font-black text-white">4.9 / 5.0</p>
              <p className="text-[11px] text-slate-300 font-medium">Agent Rating</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">500+</p>
              <p className="text-[11px] text-slate-300 font-medium">Pakistani Agencies</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">100k+</p>
              <p className="text-[11px] text-slate-300 font-medium">Seats Issued</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

