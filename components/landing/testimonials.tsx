'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    company: 'Global Voyage Agency',
    role: 'CEO',
    rating: 5,
    content: 'Fzee Travel & Tours transformed how we manage group bookings. We\'ve increased operational efficiency by 40% and our clients love the quick turnaround.',
  },
  {
    name: 'Michael Chen',
    company: 'West Coast Tours',
    role: 'Operations Manager',
    rating: 5,
    content: 'The B2B agent portal is fast and profitable. Managing group inventories and payments with Fzee Travel & Tours has made our agent operations seamless.',
  },
  {
    name: 'Emma Rodriguez',
    company: 'Adventure Express',
    role: 'Founder',
    rating: 5,
    content: 'From small beginnings to handling hundreds of passenger bookings monthly. Fzee Travel & Tours provided the perfect portal to scale our business.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-24 bg-muted/20 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block text-primary font-black text-xs uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200/80 shadow-xs">
            PARTNER SUCCESS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Trusted by travel agents worldwide
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Hear what registered travel agencies have to say about working with Fzee Travel & Tours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-card border border-border/80 shadow-sm relative flex flex-col justify-between hover:border-primary/30 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-rose-100/70 pointer-events-none group-hover:text-rose-200 transition-colors" />

              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/90 leading-relaxed text-sm italic mb-8 font-medium">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border/60">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-lg shadow-md">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm tracking-tight">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {testimonial.role} • <span className="font-semibold text-foreground/80">{testimonial.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
