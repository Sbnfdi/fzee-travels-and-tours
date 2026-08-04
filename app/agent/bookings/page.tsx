'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, CreditCard, FileSpreadsheet } from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  group: { name: string; destination: string };
  numberOfPax: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        
        const response = await fetch(`/api/bookings?${params}`);
        const data = await response.json();
        setBookings(data.bookings || data.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filter]);

  const handleDownloadExcel = async (bId: string, bNum: string) => {
    try {
      const res = await fetch(`/api/bookings/${bId}/export`);
      if (!res.ok) throw new Error('Download error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Booking_${bNum}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel download error:', err);
      alert('Failed to download Excel voucher.');
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
    booking.group?.destination?.toLowerCase().includes(search.toLowerCase()) ||
    (booking as any).groupName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-2">Manage your tour bookings and download Excel vouchers</p>
        </div>
        <Link
          href="/agent/bookings/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
        >
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-sm font-semibold">
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Tour</th>
                <th className="px-6 py-3">Passengers</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-medium">{booking.bookingNumber}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{booking.group?.name || (booking as any).groupName || 'Tour Package'}</div>
                      <div className="text-muted-foreground">{booking.group?.destination || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{booking.numberOfPax}</td>
                    <td className="px-6 py-4 font-medium">PKR {booking.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status] || statusColors.pending}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/agent/bookings/${booking.id}`} title="View Details" className="p-2 hover:bg-muted rounded-lg transition">
                          <Eye className="w-4 h-4 text-primary" />
                        </Link>
                        <button
                          onClick={() => handleDownloadExcel(booking.id, booking.bookingNumber)}
                          title="Export Excel Voucher"
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <Link href={`/agent/bookings/${booking.id}/payment`} title="Pay Now" className="p-2 hover:bg-muted rounded-lg transition">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
