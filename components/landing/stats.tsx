'use client';

export function Stats() {
  const stats = [
    { value: '50+', label: 'Registered Agencies' },
    { value: '1,000+', label: 'Bookings Processed' },
    { value: '12+', label: 'Destinations Covered' },
    { value: '24/7', label: 'Dedicated Support' },
  ];

  return (
    <section className="w-full py-12 border-y border-white/10 bg-black/20 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x md:divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center px-4">
              <div className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
