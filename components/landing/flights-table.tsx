'use client';

import { Flight } from '@prisma/client';
import { PlaneTakeoff, Clock, Briefcase, Utensils } from 'lucide-react';
import Link from 'next/link';

export function FlightsTable({ flights }: { flights: Flight[] }) {
  if (flights.length === 0) return null;

  return (
    <section className="py-12 bg-[#f5f7fa] pb-12" id="flights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse m-0">
              <thead>
                <tr className="bg-[#1a3a5c] text-white text-[13px] font-[700] uppercase tracking-[0.5px]">
                  <th className="py-4 px-3 border-b-4 border-primary">Date</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Flight No</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Dep/Arr</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Time</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Bag</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Meal</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Seats</th>
                  <th className="py-4 px-3 border-b-4 border-primary">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Sector Header */}
                <tr className="bg-[#f8f9fa] hover:bg-[#e9ecef] transition-colors border-b border-gray-200">
                  <td colSpan={3} className="py-4 px-4 text-right align-middle">
                    <img 
                      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=40&fit=crop" 
                      alt="Airline" 
                      className="w-[100px] h-auto rounded-[4px] p-[8px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)] inline-block" 
                    />
                  </td>
                  <td colSpan={2} className="py-4 px-4 text-center align-middle">
                    <PlaneTakeoff className="w-6 h-6 text-primary inline-block" />
                  </td>
                  <td colSpan={3} className="py-4 px-4 text-left align-middle">
                    <h5 className="text-[#1a3a5c] font-[700] text-[16px] m-0">Available Inventory</h5>
                  </td>
                </tr>

                {/* Data Rows */}
                {flights.map((flight, idx) => (
                  <tr key={idx} className="bg-white border-b border-[#e0e0e0] hover:bg-[#fff8f3] hover:shadow-[0_2px_8px_rgba(225,29,72,0.1)] transition-all duration-200">
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0] font-[500]">
                       {new Date(flight.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0] font-[500]">
                       {flight.airline}
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0] font-[500]">
                       {flight.departureCity} - {flight.arrivalCity}
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0] font-[500]">
                      <span className="flex justify-center items-center gap-1.5">
                        {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <Clock className="w-3 h-3 text-primary" />
                      </span>
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0] font-[600]">
                      <Briefcase className="w-3.5 h-3.5 text-[#1a3a5c] inline-block mr-1" />
                      20+7 KG
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-red-500 font-[600] border-r border-[#f0f0f0]">
                      <Utensils className="w-3.5 h-3.5 inline-block mr-1" /> NO
                    </td>
                    <td className="py-[14px] px-[10px] align-middle text-[13px] text-[#333] border-r border-[#f0f0f0]">
                      <div className="flex justify-center items-center gap-1">
                        <img src="https://cdn-icons-png.freepik.com/512/566/566235.png" width="15px" alt="seat" />
                      </div>
                    </td>
                    <td className="py-[14px] px-[10px] align-middle">
                      <Link 
                        href="/login" 
                        className="inline-block bg-primary text-white font-[600] text-[12px] uppercase tracking-[0.5px] px-[20px] py-[8px] rounded-[4px] hover:bg-primary/90 hover:-translate-y-[1px] shadow-[0_2px_6px_rgba(225,29,72,0.3)] transition-all"
                      >
                        Login
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
