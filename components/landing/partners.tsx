'use client';

export function Partners() {
  const partners = [
    'SECP',
    'ISO 9001',
    'HAJJ',
    'UMRAH',
  ];

  return (
    <section className="w-full py-16 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm md:text-base font-bold uppercase mb-8 tracking-[0.3em] text-white/70">
          Associated With
        </h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {partners.map((partner, i) => (
            <div 
              key={i} 
              className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white font-extrabold px-6 py-3 rounded-full text-xs md:text-sm min-w-[100px] md:min-w-[120px] shadow-lg border border-white/20 hover:border-white/50 hover:bg-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default uppercase tracking-widest"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
