'use client';

import Link from 'next/link';
import { Plane } from 'lucide-react';

export function FlightsTable() {
  const flightGroups = [
    {
      airline: 'PIA',
      flights: [
        { date: '18-09-2024', sector: 'ISB-JED', fltNo: 'PK 739', dep: '22:45', arr: '02:00', fare: '44,500', available: false },
        { date: '18-09-2024', sector: 'LHE-JED', fltNo: 'PK 759', dep: '23:30', arr: '02:45', fare: '45,500', available: true },
        { date: '20-09-2024', sector: 'KHI-JED', fltNo: 'PK 731', dep: '18:15', arr: '21:00', fare: '42,000', available: true },
      ]
    },
    {
      airline: 'Airblue',
      flights: [
        { date: '19-09-2024', sector: 'ISB-DXB', fltNo: 'PA 210', dep: '14:20', arr: '16:40', fare: '35,000', available: true },
        { date: '21-09-2024', sector: 'LHE-DXB', fltNo: 'PA 410', dep: '10:15', arr: '12:35', fare: '34,500', available: true },
        { date: '22-09-2024', sector: 'ISB-SHJ', fltNo: 'PA 212', dep: '08:00', arr: '10:20', fare: '33,000', available: false },
      ]
    },
    {
      airline: 'SereneAir',
      flights: [
        { date: '20-09-2024', sector: 'KHI-ISB', fltNo: 'ER 502', dep: '09:00', arr: '11:00', fare: '18,500', available: true },
        { date: '20-09-2024', sector: 'ISB-KHI', fltNo: 'ER 503', dep: '13:00', arr: '15:00', fare: '18,500', available: true },
      ]
    },
    {
      airline: 'Emirates',
      flights: [
        { date: '25-09-2024', sector: 'KHI-DXB', fltNo: 'EK 601', dep: '12:00', arr: '13:20', fare: '55,000', available: true },
        { date: '26-09-2024', sector: 'LHE-DXB', fltNo: 'EK 623', dep: '03:20', arr: '05:40', fare: '58,000', available: true },
      ]
    }
  ];

  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="w-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
          <div className="w-full">
            
            {/* Table Header - Hidden on Mobile */}
            <div className="hidden md:flex bg-primary text-primary-foreground flex-wrap text-sm font-bold uppercase py-4 px-6 tracking-widest border-b border-primary-foreground/20">
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
            <div className="divide-y divide-white/10">
              {flightGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Airline Section Header */}
                  <div className="bg-white/5 py-4 px-4 sm:px-6 flex justify-center border-y border-white/10">
                    <div className="flex items-center justify-center h-10 px-8 bg-white/10 rounded-lg border border-white/20 shadow-inner">
                      <span className="font-black text-white text-lg tracking-[0.2em] uppercase drop-shadow-sm">{group.airline}</span>
                    </div>
                  </div>

                  {/* Flights List */}
                  {group.flights.map((flight, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center text-sm py-4 px-4 sm:px-6 hover:bg-white/10 transition-colors duration-200 gap-4 md:gap-0">
                      
                      {/* Mobile Top Row: Sector, Date, Flt No */}
                      <div className="flex justify-between items-center md:hidden border-b border-white/10 pb-3">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Sector</div>
                          <div className="font-bold text-white tracking-wide text-lg">{flight.sector}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Date</div>
                          <div className="font-medium text-white/90">{flight.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Flight</div>
                          <div className="font-bold text-white">{flight.fltNo}</div>
                        </div>
                      </div>

                      {/* Desktop Grid Columns */}
                      <div className="hidden md:block w-1/6 font-medium text-white/90">{flight.date}</div>
                      <div className="hidden md:block w-1/6 font-bold text-white tracking-wide">{flight.sector}</div>
                      <div className="hidden md:block w-1/6 text-white/60 font-medium uppercase tracking-wider">{group.airline}</div>
                      <div className="hidden md:block w-1/6 font-bold text-white">{flight.fltNo}</div>
                      
                      {/* Mobile & Desktop: DEP / ARR / FARE */}
                      <div className="flex justify-between items-center md:hidden">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="font-bold text-[#4ade80] drop-shadow-sm text-xl">{flight.dep}</div>
                          </div>
                          <Plane className="w-5 h-5 text-white/30 rotate-45" />
                          <div className="text-center">
                            <div className="font-bold text-[#f87171] drop-shadow-sm text-xl">{flight.arr}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Fare</div>
                          <div className="font-black text-xl text-white">Rs {flight.fare}</div>
                        </div>
                      </div>

                      <div className="hidden md:block w-[10%] font-bold text-[#4ade80] drop-shadow-sm">{flight.dep}</div>
                      <div className="hidden md:block w-[10%] font-bold text-[#f87171] drop-shadow-sm">{flight.arr}</div>
                      <div className="hidden md:block w-1/6 text-center font-black text-lg text-white">Rs {flight.fare}</div>
                      
                      {/* Mobile & Desktop: Book Button */}
                      <div className="w-full md:flex-1 flex justify-center mt-2 md:mt-0">
                        {flight.available ? (
                          <Link href="/login" className="px-5 py-3 md:py-2 bg-primary text-primary-foreground text-sm md:text-xs font-black rounded-full shadow-lg hover:shadow-primary/50 hover:bg-primary/90 hover:-translate-y-0.5 transition-all block text-center w-full md:max-w-[120px] uppercase tracking-wider">
                            Book Now
                          </Link>
                        ) : (
                          <span className="px-5 py-3 md:py-2 bg-white/10 border border-white/20 text-white/50 text-sm md:text-xs font-bold rounded-full block text-center w-full md:max-w-[120px] cursor-not-allowed uppercase tracking-wider">
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

      </div>
    </section>
  );
}
