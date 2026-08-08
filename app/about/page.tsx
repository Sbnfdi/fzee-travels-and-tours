import { NavBar } from '@/components/landing/nav-bar';
import { Footer } from '@/components/landing/footer';
import { Plane, ShieldCheck, MapPin, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export default function AboutPage() {
  const certifications = [
    { title: 'IATA Accredited', desc: 'Officially certified by the International Air Transport Association.' },
    { title: 'SECP Registered', desc: 'A verified corporate entity recognized by the Govt. of Pakistan.' },
    { title: 'DTS License', desc: 'Approved by the Department of Tourist Services for global travel operations.' },
    { title: 'ISO 9001:2015', desc: 'Adhering to strict international quality management standards.' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-background text-foreground">

      <NavBar />

      <main className="flex-1 relative z-10 flex flex-col items-center w-full overflow-hidden">
        
        {/* Hero Section */}
        <section className="w-full pt-20 pb-16 px-4 bg-gradient-to-b from-rose-50/40 via-background to-background">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block text-primary font-black text-xs uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200/80 shadow-xs">
              Established 2012
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground">
              Pioneering the Future of <br className="hidden md:block" />
              <span className="text-primary mt-2 block">B2B Travel in Pakistan</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Fzee Travel & Tours empowers hundreds of travel agencies across Pakistan with state-of-the-art booking technology, exclusive group fares, and dedicated support.
            </p>
          </div>
        </section>

        {/* Mission & Story - White Cards */}
        <section className="w-full py-16 px-4 border-t border-border/40 bg-card">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Story */}
            <div className="bg-background border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Plane className="w-32 h-32 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground font-medium leading-relaxed relative z-10 text-base">
                <p>
                  Founded over a decade ago, Fzee Travel & Tours began with a simple mission: to simplify complex travel operations for local agents.
                </p>
                <p>
                  Today, we are a leading B2B travel wholesaler, providing unparalleled access to international airline inventories, premium Umrah packages, and global hotel reservations. 
                </p>
                <p>
                  We believe that when our partner agencies grow, we grow. That's why we've built a digital ecosystem that removes the friction from ticketing and allows you to focus on what matters most—your clients.
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-foreground px-4">Why Partner With Us?</h2>
              
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, title: 'Unmatched Reliability', desc: 'Over 12 years of zero-default operational excellence in the travel industry.' },
                  { icon: Award, title: 'Exclusive Inventories', desc: 'Direct allocations for Saudia, PIA, Airblue, SereneAir, and exclusive Umrah quotas.' },
                  { icon: MapPin, title: 'Dedicated Support Desk', desc: 'Dedicated support agents ready 24/7 to assist with PNRs and agency top-ups.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all group shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <item.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Certifications */}
        <section className="w-full py-24 px-4 bg-muted/20 border-t border-border/40">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-foreground tracking-tight uppercase mb-4">Official Certifications</h2>
              <p className="text-muted-foreground font-medium text-lg">Recognized by the world's leading travel authorities.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, idx) => (
                <div key={idx} className="bg-card border border-border/80 rounded-2xl p-8 text-center hover:border-primary/30 shadow-xs transition-colors">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 px-4 mb-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-rose-100/90 via-rose-50/60 to-rose-100/90 rounded-3xl p-12 text-center border border-rose-200/80 shadow-xl shadow-rose-500/5 relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 relative z-10">Ready to elevate your agency?</h2>
            <p className="text-muted-foreground text-lg font-medium mb-8 relative z-10 max-w-2xl mx-auto">
              Join Pakistan's fastest-growing B2B travel network and get instant access to premium tools and exclusive fares.
            </p>
            <Link href="/register" className="inline-block px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-wider text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-transform relative z-10">
              Register Agency Free
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
