'use client';

export function Stats() {
  const stats = [
    { value: '50+', label: 'Registered Agencies' },
    { value: '1,000+', label: 'Bookings Processed' },
    { value: '12+', label: 'Destinations Covered' },
    { value: '24/7', label: 'Dedicated Support' },
  ];

  return (
    <section className="w-full py-16 border-y border-border/60 bg-muted/20 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-primary drop-shadow-xs mb-3 tracking-tighter transition-all duration-300">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
