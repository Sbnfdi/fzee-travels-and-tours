'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plane, Calendar, Users, ArrowLeft, Printer, CreditCard, ShieldCheck, MapPin, FileText, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface BookingDetail {
  id: string;
  bookingNumber: string;
  groupName: string;
  destination: string;
  numberOfPax: number;
  totalAmount: number;
  status: string;
  passengerDetails: { seatNumber?: string; seat?: string; title?: string; name?: string; fullName?: string; email?: string; phone?: string; passport?: string; passportNumber?: string; passportExpiry?: string; dob?: string; cnic?: string; gender?: string; age?: number }[];
  specialRequests?: string;
  createdAt: string;
  group: any;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.booking) {
            let parsedPassengers = [];
            try {
              parsedPassengers = typeof data.booking.passengerDetails === 'string' 
                ? JSON.parse(data.booking.passengerDetails) 
                : data.booking.passengerDetails;
            } catch (e) {
              parsedPassengers = [];
            }
            
            setBooking({
              ...data.booking,
              groupName: data.booking.group?.name || 'Group Package',
              destination: data.booking.group?.destination || 'N/A',
              passengerDetails: Array.isArray(parsedPassengers) ? parsedPassengers : [],
              createdAt: new Date(data.booking.createdAt).toLocaleDateString('en-PK'),
            });
          }
        }

        // Fetch matching invoice for this booking
        const invRes = await fetch('/api/invoices');
        if (invRes.ok) {
          const invData = await invRes.json();
          if (invData.success && Array.isArray(invData.invoices)) {
            const matchingInv = invData.invoices.find((inv: any) => inv.bookingId === id);
            if (matchingInv) setInvoiceId(matchingInv.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const handleExportExcel = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/bookings/${id}/export`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Booking_Voucher_${booking?.bookingNumber || id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel download error:', err);
      alert('Failed to download Excel voucher.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground font-bold">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-foreground">Booking Not Found</h2>
        <Link href="/agent/bookings" className="text-primary hover:underline mt-4 inline-block">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, aside, header, footer, .no-print, [data-sidebar], [class*="sidebar"] {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .print-voucher-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8 text-foreground">
        <Link href="/agent/bookings" className="no-print inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="print-voucher-card bg-card rounded-2xl border border-border p-8 space-y-8 shadow-xl shadow-black/5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-black text-primary">{booking.bookingNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                } border`}>
                  {booking.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight mt-2">{booking.groupName}</h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{booking.destination}</span>
              </p>
            </div>

            <div className="no-print flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exporting ? 'Generating...' : 'Export Excel File'}</span>
              </button>

              {invoiceId && (
                <Link
                  href={`/agent/invoices/${invoiceId}?print=true`}
                  className="px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-xs inline-flex items-center gap-2 shadow-md shadow-primary/20 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print Official Invoice</span>
                </Link>
              )}

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 border border-input rounded-xl hover:bg-muted font-bold text-xs inline-flex items-center gap-2 text-foreground transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>

              {booking.status === 'pending' && (
                <Link
                  href={`/agent/bookings/${booking.id}/payment`}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-xs inline-flex items-center gap-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now</span>
                </Link>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Passenger Count</span>
              <span className="text-lg font-black text-foreground mt-1 block">{booking.numberOfPax} PAX</span>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Booking Date</span>
              <span className="text-lg font-black text-foreground mt-1 block">{booking.createdAt}</span>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <span className="text-xs font-bold uppercase text-primary block">Total Package Amount</span>
              <span className="text-xl font-black text-primary mt-1 block">PKR {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Passenger List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Passenger Manifest</h2>
            <div className="border border-border rounded-xl divide-y divide-border/60">
              {booking.passengerDetails.map((p, idx) => {
                const fullName = p.name || p.fullName || `Passenger ${idx + 1}`;
                const passportNum = p.passportNumber || p.passport || 'N/A';
                const expiry = p.passportExpiry || 'N/A';
                const dob = p.dob || 'N/A';

                return (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-foreground block text-sm">{fullName}</span>
                        <span className="text-xs font-mono font-bold text-primary block mt-0.5">
                          Passport: {passportNum}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                      <span className="bg-muted px-3 py-1 rounded-lg border border-border/60">
                        Expiry: <strong className="text-foreground">{expiry}</strong>
                      </span>
                      <span className="bg-muted px-3 py-1 rounded-lg border border-border/60">
                        DOB: <strong className="text-foreground">{dob}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
              {booking.passengerDetails.length === 0 && (
                Array.from({ length: booking.numberOfPax }).map((_, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary font-black rounded-lg text-xs border border-primary/20 shrink-0">
                        Seat {idx + 1}
                      </span>
                      <span className="font-bold text-foreground">Passenger {idx + 1}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      Standard Seat Assignment
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {booking.specialRequests && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">Special Instructions</span>
              <p className="text-foreground font-medium">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
