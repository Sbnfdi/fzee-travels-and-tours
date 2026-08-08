'use client';

import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Eye, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface AdminBooking {
  id: string;
  bookingNumber: string;
  agencyName?: string;
  agent?: {
    user?: {
      name: string;
      email: string;
    };
  };
  groupName: string;
  numberOfPax: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (id: string, status: 'confirmed' | 'rejected' | 'cancelled') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(data.message || `Booking marked as ${status}.`);
        fetchBookings();
      } else {
        setActionMessage(data.error || 'Failed to process booking action.');
      }
    } catch (err) {
      console.error(err);
      setActionMessage('An error occurred.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

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
      alert('Failed to download Excel file.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const agentName = b.agent?.user?.name || '';
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.groupName.toLowerCase().includes(search.toLowerCase()) ||
      (b.agencyName && b.agencyName.toLowerCase().includes(search.toLowerCase())) ||
      agentName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBulkExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await fetch(`/api/bookings/export?${params}`);
      if (!res.ok) throw new Error('Bulk export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bookings_Report_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Bulk export error:', err);
      alert('Failed to download bulk bookings report.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Agency Bookings Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, view details, and export Excel reports for all bookings</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking #, agent or package..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleBulkExport}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center justify-center gap-2 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-2">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Agency Bookings Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">Bookings placed by registered agencies will appear here for admin review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                  <th className="px-6 py-4">Booking #</th>
                  <th className="px-6 py-4">Agency / Agent</th>
                  <th className="px-6 py-4">Tour / Item</th>
                  <th className="px-6 py-4">PAX</th>
                  <th className="px-6 py-4">Total Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const agentName = b.agent?.user?.name;
                  return (
                    <tr key={b.id} className="border-b border-border/60 hover:bg-muted/20">
                      <td className="px-6 py-4 font-bold text-foreground">
                        <Link href={`/dashboard/bookings/${b.id}`} className="hover:text-primary transition">
                          {b.bookingNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        <div className="font-bold">{b.agencyName || 'Travel Agency'}</div>
                        {agentName && (
                          <div className="text-xs text-muted-foreground font-medium">Agent: {agentName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{b.groupName}</td>
                      <td className="px-6 py-4 text-foreground">{b.numberOfPax} PAX</td>
                      <td className="px-6 py-4 font-bold text-primary">PKR {b.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/bookings/${b.id}`}
                            title="View Full Booking Details"
                            className="p-2 border border-input rounded-lg hover:bg-muted font-bold text-xs inline-flex items-center gap-1 transition"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                            <span className="hidden sm:inline">Details</span>
                          </Link>

                          <button
                            onClick={() => handleDownloadExcel(b.id, b.bookingNumber)}
                            title="Export Single Booking Excel Voucher"
                            className="p-2 border border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="hidden sm:inline">Excel</span>
                          </button>

                          {b.status === 'pending' && (
                            <>
                              <button
                                disabled={processingId === b.id}
                                onClick={() => handleAction(b.id, 'confirmed')}
                                className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 text-xs shadow-sm transition disabled:opacity-50"
                              >
                                {processingId === b.id ? '...' : 'Approve'}
                              </button>
                              <button
                                disabled={processingId === b.id}
                                onClick={() => handleAction(b.id, 'rejected')}
                                className="px-3 py-1.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-lg text-xs transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              disabled={processingId === b.id}
                              onClick={() => {
                                if (confirm(`Cancel confirmed booking ${b.bookingNumber}? Seats will be restored to flight schedule.`)) {
                                  handleAction(b.id, 'cancelled');
                                }
                              }}
                              className="px-3 py-1.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-lg text-xs transition disabled:opacity-50"
                            >
                              {processingId === b.id ? '...' : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
