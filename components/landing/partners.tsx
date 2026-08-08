'use client';

export function Partners() {
  const partners = [
    'SECP Registered',
    'DTS Certified',
    'Hajj Specialist',
    'Umrah Licensed',
  ];

  return (
    <section className="w-full py-16 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-black uppercase mb-8 tracking-[0.2em] text-muted-foreground">
          ASSOCIATED WITH & CERTIFIED
        </h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {partners.map((partner, i) => (
            <div 
              key={i} 
              className="flex items-center justify-center bg-card text-foreground font-black px-6 py-3 rounded-xl text-xs min-w-[120px] shadow-xs border border-border/80 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
