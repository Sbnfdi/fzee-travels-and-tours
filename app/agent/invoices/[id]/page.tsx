'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle2, Building2, Calendar, Phone, Mail, FileText, Globe } from 'lucide-react';
import Link from 'next/link';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  agencyId: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes?: string;
  groupName: string;
  agencyName: string;
  booking: {
    bookingNumber: string;
    bookingType: string;
    numberOfPax: number;
    totalAmount: number;
    commission: number;
    status: string;
    passengerDetails: string;
    createdAt: string;
    group?: { name: string; destination: string; duration: number; startDate: string; endDate: string; pricePerPerson: number };
    hotel?: { name: string; city: string; country: string; pricePerNight: number; starRating: number };
    flight?: { airline: string; flightNumber: string; departureCity: string; arrivalCity: string; departureTime: string; arrivalTime: string; pricePerSeat: number; pnr?: string };
    visa?: { country: string; visaType: string; processingDays: number; pricePerPerson: number };
  };
  agency: {
    businessName: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email?: string;
    website?: string;
  };
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const shouldAutoPrint = searchParams?.get('print') === 'true';

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.invoices)) {
            const found = data.invoices.find((inv: any) => inv.id === id || inv.invoiceNumber === id);
            if (found) setInvoice(found);
          }
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (invoice && shouldAutoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, shouldAutoPrint]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground font-bold">Generating invoice document...</div>;
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-muted-foreground text-sm">The requested invoice reference could not be located.</p>
        <Link href="/agent/invoices" className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm inline-block">Back to Invoices</Link>
      </div>
    );
  }

  const booking = invoice.booking;
  const agency = invoice.agency;
  let passengers: any[] = [];
  try {
    passengers = typeof booking?.passengerDetails === 'string' ? JSON.parse(booking.passengerDetails) : booking?.passengerDetails || [];
  } catch { passengers = []; }

  // Build line items based on booking type
  const lineItems: { description: string; details?: string; qty: number; unitPrice: number; total: number }[] = [];
  if (booking) {
    if (booking.bookingType === 'GROUP' && booking.group) {
      lineItems.push({
        description: `${booking.group.name}`,
        details: `Destination: ${booking.group.destination} • Duration: ${booking.group.duration} Days`,
        qty: booking.numberOfPax,
        unitPrice: booking.group.pricePerPerson,
        total: booking.group.pricePerPerson * booking.numberOfPax,
      });
    } else if (booking.bookingType === 'HOTEL' && booking.hotel) {
      lineItems.push({
        description: `${booking.hotel.name}`,
        details: `${booking.hotel.city}, ${booking.hotel.country} • Rating: ${'★'.repeat(booking.hotel.starRating)}`,
        qty: booking.numberOfPax,
        unitPrice: booking.hotel.pricePerNight,
        total: booking.hotel.pricePerNight * booking.numberOfPax,
      });
    } else if (booking.bookingType === 'FLIGHT' && booking.flight) {
      lineItems.push({
        description: `${booking.flight.airline} (Flight ${booking.flight.flightNumber})`,
        details: `Route: ${booking.flight.departureCity} → ${booking.flight.arrivalCity}${booking.flight.pnr ? ` • PNR: ${booking.flight.pnr}` : ''}`,
        qty: booking.numberOfPax,
        unitPrice: booking.flight.pricePerSeat,
        total: booking.flight.pricePerSeat * booking.numberOfPax,
      });
    } else if (booking.bookingType === 'VISA' && booking.visa) {
      lineItems.push({
        description: `${booking.visa.country} ${booking.visa.visaType} Visa`,
        details: `Processing Time: ${booking.visa.processingDays} Business Days`,
        qty: booking.numberOfPax,
        unitPrice: booking.visa.pricePerPerson,
        total: booking.visa.pricePerPerson * booking.numberOfPax,
      });
    } else {
      lineItems.push({
        description: invoice.groupName || 'Travel Service Reservation',
        details: `Booking Ref: ${booking.bookingNumber}`,
        qty: booking.numberOfPax,
        unitPrice: invoice.subtotal / (booking.numberOfPax || 1),
        total: invoice.subtotal,
      });
    }
  }

  return (
    <>
      {/* Precision Print Engine Styles */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 12mm 15mm;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }

          nav, aside, header, footer, .no-print, [data-sidebar], [class*="sidebar"] {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            margin: 0 !important;
          }

          .print-header-bg {
            background-color: #dc2626 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-header-bg * {
            color: #ffffff !important;
          }

          .print-badge-paid {
            background-color: #dcfce7 !important;
            color: #15803d !important;
            border: 1px solid #86efac !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-badge-issued {
            background-color: #fef9c3 !important;
            color: #a16207 !important;
            border: 1px solid #fef08a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-table-th {
            background-color: #f3f4f6 !important;
            color: #374151 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-total-box {
            background-color: #fef2f2 !important;
            border: 1.5px solid #fca5a5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-red-text {
            color: #dc2626 !important;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 print-container">
        {/* Top Control Bar (Screen only) */}
        <div className="no-print flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
          <Link href="/agent/invoices" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Invoice</span>
            </button>
          </div>
        </div>

        {/* Invoice Document Body */}
        <div className="print-card bg-white rounded-2xl border border-border shadow-2xl overflow-hidden text-gray-900">
          
          {/* Header Banner */}
          <div className="print-header-bg bg-primary px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-xl border border-white/30">
                  F
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white leading-none">FZEE TRAVELS & TOURS</h1>
                  <p className="text-xs font-semibold text-white/80 mt-1">Authorized B2B Travel Management Services</p>
                </div>
              </div>
            </div>
            <div className="sm:text-right border-t sm:border-t-0 border-white/20 pt-3 sm:pt-0">
              <span className="text-xs font-black uppercase tracking-widest text-white/80 block">OFFICIAL TAX INVOICE</span>
              <p className="text-2xl font-black tracking-tight text-white font-mono mt-0.5">{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Metadata & Billing Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-gray-200 pb-8">
              {/* Agency / Bill To Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Billed To (Travel Agency)</span>
                <h3 className="text-lg font-black text-gray-900 leading-tight">{agency?.businessName || 'Travel Partner'}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  {agency?.address && <p>{agency.address}</p>}
                  <p>{agency?.city || 'Lahore'}{agency?.country ? `, ${agency.country}` : ', Pakistan'}</p>
                  {agency?.phone && <p className="font-medium">Phone: {agency.phone}</p>}
                  {agency?.email && <p>Email: {agency.email}</p>}
                </div>
              </div>

              {/* Invoice Specific Details */}
              <div className="sm:text-right space-y-2.5">
                <div className="flex sm:justify-end items-center gap-2">
                  <span className={`print-badge-${invoice.status === 'paid' ? 'paid' : 'issued'} px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {invoice.status === 'paid' ? '✓ FULLY PAID' : 'ISSUED / PENDING'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex sm:justify-end gap-3">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Invoice Date:</span>
                    <span className="font-bold text-gray-800">{new Date(invoice.issueDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex sm:justify-end gap-3">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Due Date:</span>
                    <span className="font-bold text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex sm:justify-end gap-3">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Booking Ref:</span>
                    <span className="font-black text-red-600 print-red-text font-mono">{booking?.bookingNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Service Breakdown & Pricing</span>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="print-table-th bg-gray-100 border-b border-gray-200 font-black text-gray-600 uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3.5 w-12 text-center">#</th>
                      <th className="px-5 py-3.5">Service Description</th>
                      <th className="px-5 py-3.5 text-center w-24">PAX / Qty</th>
                      <th className="px-5 py-3.5 text-right w-36">Unit Fare (PKR)</th>
                      <th className="px-5 py-3.5 text-right w-40">Total Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900 text-sm">{item.description}</p>
                          {item.details && <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.details}</p>}
                        </td>
                        <td className="px-5 py-4 text-center font-black text-gray-900 text-sm">{item.qty}</td>
                        <td className="px-5 py-4 text-right font-medium text-gray-600 font-mono">PKR {item.unitPrice.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-black text-gray-900 font-mono text-sm">PKR {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="flex justify-end pt-2 page-break-inside-avoid">
              <div className="w-full sm:w-80 space-y-2">
                <div className="flex justify-between text-xs text-gray-600 font-medium px-2">
                  <span>Subtotal Amount:</span>
                  <span className="font-bold text-gray-900 font-mono">PKR {invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 font-medium px-2">
                  <span>Standard Service Tax (5%):</span>
                  <span className="font-bold text-gray-900 font-mono">PKR {invoice.tax.toLocaleString()}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-bold px-2">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-PKR {invoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-1" />
                <div className="print-total-box bg-red-50 border-2 border-red-200 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 print-red-text block">Grand Total Due</span>
                    <span className="text-xs text-gray-500 font-medium">All taxes & fees included</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-red-600 print-red-text font-mono">PKR {invoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Manifest */}
            {passengers.length > 0 && (
              <div className="space-y-3 pt-4 page-break-inside-avoid">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Registered Travelers Manifest</span>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="print-table-th bg-gray-100 border-b border-gray-200 font-black text-gray-600 uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-2.5 w-10 text-center">#</th>
                        <th className="px-4 py-2.5">Passenger Full Name</th>
                        <th className="px-4 py-2.5">Contact Details</th>
                        <th className="px-4 py-2.5 font-mono">Passport #</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {passengers.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 text-center font-bold text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-bold text-gray-900">{p.name}</td>
                          <td className="px-4 py-2.5 text-gray-600">{p.email || p.phone || 'N/A'}</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-gray-800">{p.passport || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Terms & Bank Information Footer */}
            <div className="border-t-2 border-red-600 pt-6 space-y-6 page-break-inside-avoid">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600">
                <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">Bank Wire Payment Info</h4>
                  <p className="text-gray-700">Bank Name: <span className="font-bold">Meezan Bank / HBL Pakistan</span></p>
                  <p className="text-gray-700">Account Title: <span className="font-bold">Fzee Travels & Tours (Pvt) Ltd</span></p>
                  <p className="text-gray-700 font-mono">Account #: <span className="font-bold">0102-0105849201</span></p>
                  <p className="text-gray-700 font-mono">IBAN: <span className="font-bold">PK36MEZN0001020105849201</span></p>
                </div>

                <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">Terms & Guidelines</h4>
                  <p>1. Invoices must be settled within the designated due date.</p>
                  <p>2. Tickets & Vouchers are issued only after payment verification.</p>
                  <p>3. All transactions are billed in Pakistani Rupees (PKR).</p>
                  <p>4. Computer-generated official document. No physical stamp required.</p>
                </div>
              </div>

              {/* Company Footer Stamp */}
              <div className="text-center pt-2 border-t border-gray-200 space-y-1">
                <p className="text-xs font-black text-gray-800 tracking-wider">FZEE TRAVELS & TOURS (PVT) LTD</p>
                <p className="text-[10px] font-semibold text-gray-400">Head Office: Suite 402, Travel Hub Tower, Main Boulevard, Gulberg III, Lahore, Pakistan</p>
                <p className="text-[10px] text-gray-400">UAN: +92 42 111-786-393 • Support: support@fzeetravels.com • Web: www.fzeetravels.com</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
