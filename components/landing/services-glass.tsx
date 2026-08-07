'use client';

import { ShieldCheck, Zap, Globe2, Wallet, Users, HeadphonesIcon } from 'lucide-react';

export function ServicesGlass() {
  const services = [
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: "Global Reach",
      desc: "Access an extensive network of airlines and hotels worldwide at exclusive B2B rates."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Booking",
      desc: "Real-time availability and instant confirmations for seamless itinerary planning."
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Smart Wallet",
      desc: "Manage your funds efficiently with our secure and automated B2B wallet system."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Tours",
      desc: "Specialized in handling large group bookings, Umrah packages, and corporate travels."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Verified Partners",
      desc: "We work exclusively with trusted, verified travel agencies to ensure quality."
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: "24/7 Support",
      desc: "Our dedicated B2B support team is always ready to assist you round the clock."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0B]">
      {/* Dynamic Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-rose-600/10 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Services</span> for Agents
          </h2>
          <p className="text-lg text-white/70">
            Everything you need to scale your travel business under one unified, powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                  {srv.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{srv.title}</h3>
                <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                  {srv.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
