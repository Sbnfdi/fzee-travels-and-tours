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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl font-bold uppercase mb-8 text-foreground">Associated With</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {partners.map((partner, i) => (
            <div key={i} className="flex items-center justify-center bg-gray-400 text-white font-bold px-6 py-3 rounded text-sm min-w-[100px] shadow-sm">
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
