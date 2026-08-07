'use client';

export function Stats() {
  const stats = [
    { value: '50+', label: 'Registered Agencies' },
    { value: '1,000+', label: 'Bookings Processed' },
    { value: '12+', label: 'Destinations Covered' },
    { value: '24/7', label: 'Dedicated Support' },
  ];

  return (
    <section className="w-full py-16 border-y border-white/10 relative z-10 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-primary/10 blur-[80px] pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-primary/40 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 group">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl mb-3 tracking-tighter group-hover:from-primary group-hover:to-primary/60 transition-all duration-500">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-white/60 group-hover:text-white/90 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
