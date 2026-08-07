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
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Global Video Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="https://cdn.pixabay.com/video/2016/09/21/5412-183786499_large.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to ensure white text readability */}
        <div className="absolute inset-0 bg-slate-950/80" />
      </div>

      <NavBar />

      <main className="flex-1 relative z-10 flex flex-col items-center w-full overflow-hidden">
        
        {/* Hero Section */}
        <section className="w-full pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block text-primary font-bold text-xs uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-md">
              Established 2012
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-2xl">
              Pioneering the Future of <br className="hidden md:block" />
              <span className="text-primary mt-2 block">B2B Travel in Pakistan</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Fzee Travels & Tours empowers hundreds of travel agencies across Pakistan with state-of-the-art booking technology, exclusive group fares, and dedicated support.
            </p>
          </div>
        </section>

        {/* Mission & Story - Glass Cards */}
        <section className="w-full py-16 px-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Story */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Plane className="w-32 h-32 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-md">Our Story</h2>
              <div className="space-y-4 text-white/80 font-medium leading-relaxed relative z-10">
                <p>
                  Founded over a decade ago, Fzee Travels & Tours began with a simple mission: to simplify complex travel operations for local agents.
                </p>
                <p>
                  Today, headquartered at <strong>Shop 06, Building Services Plaza, Mall Road, Saddar, Rawalpindi</strong>, we are a leading B2B travel wholesaler, providing unparalleled access to international airline inventories, premium Umrah packages, and global hotel reservations. 
                </p>
                <p>
                  We believe that when our partner agencies grow, we grow. That's why we've built a digital ecosystem that removes the friction from ticketing and allows you to focus on what matters most—your clients.
                </p>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white drop-shadow-md px-4">Why Partner With Us?</h2>
              
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, title: 'Unmatched Reliability', desc: 'Over 12 years of zero-default operational excellence in the travel industry.' },
                  { icon: Award, title: 'Exclusive Inventories', desc: 'Direct allocations for Saudia, PIA, Emirates, and exclusive Umrah quotas.' },
                  { icon: MapPin, title: 'Islamabad / Rawalpindi Presence', desc: 'Located at Shop 06, Building Services Plaza, Mall Road, Saddar, Rawalpindi with dedicated support agents.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <item.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-white/70 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Certifications */}
        <section className="w-full py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white tracking-widest uppercase drop-shadow-lg mb-4">Official Certifications</h2>
              <p className="text-white/60 font-medium text-lg">Recognized by the world's leading travel authorities.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">{cert.title}</h3>
                  <p className="text-sm text-white/60 font-medium">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 px-4 mb-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/80 to-primary rounded-3xl p-12 text-center border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">Ready to elevate your agency?</h2>
            <p className="text-white/90 text-lg font-medium mb-8 relative z-10 max-w-2xl mx-auto">
              Join Pakistan's fastest-growing B2B travel network and get instant access to premium tools and exclusive fares.
            </p>
            <Link href="/register" className="inline-block px-8 py-4 bg-white text-primary font-black uppercase tracking-widest text-sm rounded-full shadow-xl hover:scale-105 transition-transform relative z-10">
              Register Agency Free
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
