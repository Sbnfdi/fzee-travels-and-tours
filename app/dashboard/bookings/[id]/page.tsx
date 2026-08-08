'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2,
  Calendar,
  CreditCard,
  MapPin,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  Plane
} from 'lucide-react';
import Link from 'next/link';

interface Passenger {
  seatNumber?: string;
  seat?: string;
  title?: string;
  name?: string;
  fullName?: string;
  gender?: string;
  age?: number | string;
  passport?: string;
  cnic?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface AdminBookingDetail {
  id: string;
  bookingNumber: string;
  bookingType: string;
  numberOfPax: number;
  totalAmount: number;
  commission: number;
  status: string;
  specialRequests?: string;
  createdAt: string;
  passengerDetails: any;
  agency?: {
    id: string;
    businessName: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
  };
  agent?: {
    id: string;
    commissionRate: number;
    user?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  group?: {
    name: string;
    destination: string;
    pricePerPerson: number;
    startDate?: string;
  };
  flight?: {
    airline: string;
    flightNumber: string;
    pnr?: string;
    departureCity: string;
    arrivalCity: string;
    departureTime?: string;
    arrivalTime?: string;
  };
  hotel?: {
    name: string;
    city: string;
  };
  visa?: {
    country: string;
    visaType: string;
  };
  payments?: any[];
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
        }
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleAction = async (status: 'confirmed' | 'rejected' | 'cancelled') => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(data.message || `Booking marked as ${status}.`);
        fetchBooking();
      } else {
        setActionMessage(data.error || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error(err);
      setActionMessage('An error occurred while updating status.');
    } finally {
      setProcessing(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

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
      alert('Failed to download Excel voucher. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground font-bold text-base">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Booking Record Not Found</h2>
        <Link href="/dashboard/bookings" className="text-primary hover:underline inline-block font-semibold">
          Return to Admin Bookings List
        </Link>
      </div>
    );
  }

  // Parse passenger list
  let passengers: Passenger[] = [];
  try {
    passengers = typeof booking.passengerDetails === 'string'
      ? JSON.parse(booking.passengerDetails)
      : booking.passengerDetails;
    if (!Array.isArray(passengers)) passengers = [];
  } catch (e) {
    passengers = [];
  }

  // Build service label
  let serviceName = 'Group Package';
  if (booking.bookingType === 'GROUP') serviceName = booking.group?.name || 'Group Package';
  if (booking.bookingType === 'FLIGHT') serviceName = booking.flight?.airline ? `${booking.flight.airline} (${booking.flight.flightNumber})` : 'Flight Ticket';
  if (booking.bookingType === 'HOTEL') serviceName = booking.hotel?.name || 'Hotel Reservation';
  if (booking.bookingType === 'VISA') serviceName = booking.visa?.country ? `${booking.visa.country} Visa` : 'Visa Service';

  const agentName = booking.agent?.user?.name || 'N/A';
  const agentEmail = booking.agent?.user?.email || 'N/A';
  const agencyName = booking.agency?.businessName || 'N/A';

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, aside, header, footer, .no-print {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8 text-foreground">
        {/* Navigation Link */}
        <Link href="/dashboard/bookings" className="no-print inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings Overview</span>
        </Link>

        {actionMessage && (
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-2xl font-black text-primary tracking-tight">{booking.bookingNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {booking.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                  {booking.bookingType}
                </span>
              </div>

              <h1 className="text-2xl font-black text-foreground tracking-tight mt-2">{serviceName}</h1>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Booked on {new Date(booking.createdAt).toLocaleString('en-PK')}
              </p>
            </div>

            <div className="no-print flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exporting ? 'Generating Excel...' : 'Export Excel File'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 border border-input rounded-xl hover:bg-muted font-bold text-xs inline-flex items-center gap-2 text-foreground transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>

              {booking.status === 'pending' && (
                <>
                  <button
                    disabled={processing}
                    onClick={() => handleAction('confirmed')}
                    className="px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-xs shadow-md transition disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={processing}
                    onClick={() => handleAction('rejected')}
                    className="px-4 py-2.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-xl text-xs transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}

              {booking.status === 'confirmed' && (
                <button
                  disabled={processing}
                  onClick={() => {
                    if (confirm(`Cancel confirmed booking ${booking.bookingNumber}? Seats will be restored to flight schedule.`)) {
                      handleAction('cancelled');
                    }
                  }}
                  className="px-4 py-2.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  {processing ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Total Passengers</span>
              <span className="text-xl font-black text-foreground mt-1 block">{booking.numberOfPax} PAX</span>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Booking Amount</span>
              <span className="text-xl font-black text-primary mt-1 block">PKR {booking.totalAmount.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Agent Commission</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">PKR {(booking.commission || 0).toLocaleString()}</span>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
              <span className="text-xs font-bold uppercase text-muted-foreground block">Payment Status</span>
              <span className="text-sm font-bold text-foreground mt-1.5 uppercase block">
                {booking.payments?.[0]?.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Flight Schedule Card if FLIGHT booking */}
          {booking.flight && (
            <div className="bg-muted/30 p-5 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-primary" />
                  <span className="font-black text-foreground text-base">{booking.flight.airline} ({booking.flight.flightNumber})</span>
                  {booking.flight.pnr && (
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-mono font-bold text-xs rounded-md border border-primary/20">
                      PNR: {booking.flight.pnr}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-xs text-muted-foreground uppercase tracking-widest">{booking.flight.departureCity} → {booking.flight.arrivalCity}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-xl border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Departure Date & Time</span>
                  <span className="text-base font-bold text-foreground block mt-1">
                    {booking.flight.departureTime ? new Date(booking.flight.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {booking.flight.departureTime ? new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>

                <div className="bg-background p-4 rounded-xl border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Arrival Date & Time</span>
                  <span className="text-base font-bold text-foreground block mt-1">
                    {booking.flight.arrivalTime ? new Date(booking.flight.arrivalTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                    {booking.flight.arrivalTime ? new Date(booking.flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent & Agency Tracking Details */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <UserCheck className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground text-base">Booking Agent Info</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Agent Name:</span>
                <span className="font-bold text-foreground">{agentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Agent Email:</span>
                <span className="font-medium text-foreground">{agentEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Commission Rate:</span>
                <span className="font-bold text-emerald-600">{booking.agent?.commissionRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground text-base">Travel Agency Details</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Agency Name:</span>
                <span className="font-bold text-foreground">{agencyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Agency Phone:</span>
                <span className="font-medium text-foreground">{booking.agency?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Location:</span>
                <span className="font-medium text-foreground">
                  {[booking.agency?.city, booking.agency?.address].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Manifest & Seat Mapping */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">Passenger Manifest & Seat Assignments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Detailed seat mappings and passenger identification records</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs">
              {passengers.length > 0 ? `${passengers.length} Assigned` : `${booking.numberOfPax} PAX Record(s)`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground uppercase">
                  <th className="px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3">Passenger Name</th>
                  <th className="px-4 py-3">Passport #</th>
                  <th className="px-4 py-3">Passport Expiry</th>
                  <th className="px-4 py-3">Date of Birth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {passengers.length > 0 ? (
                  passengers.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {p.name || p.fullName || `Passenger ${idx + 1}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary font-bold">
                        {p.passportNumber || p.passport || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        {p.passportExpiry || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        {p.dob || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  Array.from({ length: booking.numberOfPax }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-4 py-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-foreground">Passenger {idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">N/A</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">N/A</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">N/A</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {booking.specialRequests && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border text-sm space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">Special Instructions / Remarks</span>
              <p className="text-foreground font-medium">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
