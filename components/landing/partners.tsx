'use client';

export function Partners() {
  const partners = [
    'IATA',
    'DCCI',
    'SECP',
    'ISO 9001',
    'DTS',
    'HAJJ',
    'UMRAH',
  ];

  return (
    <section className="bg-white py-12 border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm md:text-base font-bold uppercase mb-8 tracking-[0.2em] text-primary/80">
          Associated With
        </h2>
        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {partners.map((partner, i) => (
            <div 
              key={i} 
              className="flex items-center justify-center bg-card text-foreground font-extrabold px-6 py-3 rounded-xl text-xs md:text-sm min-w-[100px] md:min-w-[120px] shadow-sm border border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
