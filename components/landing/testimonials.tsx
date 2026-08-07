'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ahmed Malik',
    company: 'Al-Noor Travels, Islamabad',
    role: 'CEO',
    rating: 5,
    content: 'Fzee Travels & Tours transformed how we manage Umrah group bookings. We\'ve increased operational efficiency by 40% and our clients love the quick turnaround.',
  },
  {
    name: 'Imran Khan',
    company: 'Shaheen Travels, Lahore',
    role: 'Operations Manager',
    rating: 5,
    content: 'The B2B agent portal is fast and reliable. Managing group inventories and payments with Fzee Travels has made our agent operations seamless.',
  },
  {
    name: 'Fatima Ali',
    company: 'Makka Tours, Islamabad',
    role: 'Founder',
    rating: 5,
    content: 'From small beginnings to handling hundreds of passenger bookings monthly. Fzee Travels & Tours provided the perfect portal to scale our business.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block text-primary font-bold text-xs uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-md">
            Partner Success
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Trusted by top travel agents across Pakistan
          </h2>
          <p className="text-base sm:text-lg text-white/80 font-medium max-w-2xl mx-auto">
            Hear what registered travel agencies have to say about working with Fzee Travels & Tours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl relative flex flex-col justify-between hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2">
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/10 pointer-events-none group-hover:text-primary/20 transition-colors" />

              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/90 leading-relaxed text-sm italic mb-8 font-medium">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg shadow-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-wide">{testimonial.name}</h4>
                  <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">
                    {testimonial.role} <span className="text-white/40 block sm:inline mt-0.5 sm:mt-0 sm:ml-1 font-medium">{testimonial.company}</span>
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
