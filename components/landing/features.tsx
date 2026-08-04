'use client';

import { Bookmark, Users, TrendingUp, Lock, Clock, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Bookmark,
    title: 'Easy Booking Management',
    description: 'Create, track, and manage group packages and individual bookings with real-time status updates.',
  },
  {
    icon: Users,
    title: 'Manage Groups & Tours',
    description: 'Organize flight allocations, hotel rooms, and client rosters effortlessly from one central portal.',
  },
  {
    icon: TrendingUp,
    title: 'Business Growth & Analytics',
    description: 'Track commission earnings, agency performance, and financial statements with live dashboards.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Protect agency data with robust token authentication and secure database encryption.',
  },
  {
    icon: Clock,
    title: '24/7 Portal Availability',
    description: 'Access inventory, generate customer quotes, and issue travel vouchers anytime, anywhere.',
  },
  {
    icon: ShieldCheck,
    title: 'Free Agent Registration',
    description: 'Join Fzee Travels & Tours network with zero upfront registration charges or hidden software costs.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/40 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Everything your travel business needs to excel
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Complete B2B tools tailored for travel agents and tour operators. Streamlined, fast, and completely free.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
