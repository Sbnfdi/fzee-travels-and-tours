'use client';

import Link from 'next/link';

export function FlightsTable() {
  const flightGroups = [
    {
      airline: 'PIA',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/PIA_Logo.svg/1200px-PIA_Logo.svg.png',
      flights: [
        { date: '18-09-2024', sector: 'ISB-JED', fltNo: 'PK 739', dep: '22:45', arr: '02:00', fare: '44,500', available: false },
        { date: '18-09-2024', sector: 'LHE-JED', fltNo: 'PK 759', dep: '23:30', arr: '02:45', fare: '45,500', available: true },
        { date: '20-09-2024', sector: 'KHI-JED', fltNo: 'PK 731', dep: '18:15', arr: '21:00', fare: '42,000', available: true },
      ]
    },
    {
      airline: 'Airblue',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Airblue_Logo.svg/2560px-Airblue_Logo.svg.png',
      flights: [
        { date: '19-09-2024', sector: 'ISB-DXB', fltNo: 'PA 210', dep: '14:20', arr: '16:40', fare: '35,000', available: true },
        { date: '21-09-2024', sector: 'LHE-DXB', fltNo: 'PA 410', dep: '10:15', arr: '12:35', fare: '34,500', available: true },
        { date: '22-09-2024', sector: 'ISB-SHJ', fltNo: 'PA 212', dep: '08:00', arr: '10:20', fare: '33,000', available: false },
      ]
    },
    {
      airline: 'SereneAir',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Serene_Air_logo.svg/2560px-Serene_Air_logo.svg.png',
      flights: [
        { date: '20-09-2024', sector: 'KHI-ISB', fltNo: 'ER 502', dep: '09:00', arr: '11:00', fare: '18,500', available: true },
        { date: '20-09-2024', sector: 'ISB-KHI', fltNo: 'ER 503', dep: '13:00', arr: '15:00', fare: '18,500', available: true },
      ]
    },
    {
      airline: 'Emirates',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1024px-Emirates_logo.svg.png',
      flights: [
        { date: '25-09-2024', sector: 'KHI-DXB', fltNo: 'EK 601', dep: '12:00', arr: '13:20', fare: '55,000', available: true },
        { date: '26-09-2024', sector: 'LHE-DXB', fltNo: 'EK 623', dep: '03:20', arr: '05:40', fare: '58,000', available: true },
      ]
    }
  ];

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="w-full border border-border shadow-sm rounded-lg overflow-hidden bg-white">
          {/* Table Header */}
          <div className="bg-indigo-900 text-white flex flex-wrap text-xs md:text-sm font-bold uppercase py-3 px-4">
            <div className="w-1/6">Date</div>
            <div className="w-1/6">Sector</div>
            <div className="w-1/6">Airline</div>
            <div className="w-1/6">FLT No.</div>
            <div className="w-[10%]">DEP</div>
            <div className="w-[10%]">ARR</div>
            <div className="w-1/6 text-center">FARE</div>
            <div className="flex-1 text-center">BOOK</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {flightGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Airline Section Header */}
                <div className="bg-indigo-50/50 py-3 px-4 flex justify-center border-y border-border">
                  <div className="h-6 w-32 relative">
                    <img src={group.logo} alt={group.airline} className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Flights List */}
                {group.flights.map((flight, idx) => (
                  <div key={idx} className="flex flex-wrap items-center text-xs md:text-sm py-3 px-4 hover:bg-muted/30 transition-colors">
                    <div className="w-1/6 font-medium text-foreground">{flight.date}</div>
                    <div className="w-1/6 font-bold text-foreground">{flight.sector}</div>
                    <div className="w-1/6 text-muted-foreground">{group.airline}</div>
                    <div className="w-1/6 font-medium">{flight.fltNo}</div>
                    <div className="w-[10%] font-semibold text-green-700">{flight.dep}</div>
                    <div className="w-[10%] font-semibold text-red-600">{flight.arr}</div>
                    <div className="w-1/6 text-center font-bold text-base text-foreground">Rs {flight.fare}</div>
                    <div className="flex-1 flex justify-center">
                      {flight.available ? (
                        <Link href="/login" className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded shadow-sm hover:bg-orange-600 transition block text-center w-full max-w-[100px]">
                          Book Now
                        </Link>
                      ) : (
                        <span className="px-4 py-1.5 bg-gray-300 text-gray-500 text-xs font-bold rounded block text-center w-full max-w-[100px] cursor-not-allowed">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
