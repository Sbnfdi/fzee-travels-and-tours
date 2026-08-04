'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    company: 'Global Voyage Agency',
    role: 'CEO',
    rating: 5,
    content: 'Fzee Travels & Tours transformed how we manage group bookings. We\'ve increased operational efficiency by 40% and our clients love the quick turnaround.',
  },
  {
    name: 'Michael Chen',
    company: 'Wanderlust Tours',
    role: 'Operations Manager',
    rating: 5,
    content: 'The B2B agent portal is fast and reliable. Managing group inventories and payments with Fzee Travels has made our agent operations seamless.',
  },
  {
    name: 'Emma Rodriguez',
    company: 'Adventure Express',
    role: 'Founder',
    rating: 5,
    content: 'From small beginnings to handling hundreds of passenger bookings monthly. Fzee Travels & Tours provided the perfect portal to scale our business.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Partner Success
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Trusted by travel agents worldwide
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Hear what registered travel agencies have to say about working with Fzee Travels & Tours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-card border border-border/80 shadow-xs relative flex flex-col justify-between hover:border-primary/40 transition">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 pointer-events-none" />

              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground leading-relaxed text-sm italic mb-8">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-xs">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, <span className="font-medium text-foreground/80">{testimonial.company}</span>
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
