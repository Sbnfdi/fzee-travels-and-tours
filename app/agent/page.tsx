'use client';

import { useEffect, useState } from 'react';
import { Plane, Wallet, TrendingUp, Calendar, ArrowRight, Clock, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AgentStats {
  totalBookings: number;
  walletBalance: number;
  monthlyRevenue: number;
  upcomingTours: number;
}

interface Booking {
  id: string;
  bookingNumber: string;
  groupName: string;
  numberOfPax: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<AgentStats>({
    totalBookings: 0,
    walletBalance: 0,
    monthlyRevenue: 0,
    upcomingTours: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyStatus, setAgencyStatus] = useState<string>('pending');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [authRes, walletRes, bookingsRes, groupsRes] = await Promise.all([
          fetch('/api/auth/me', { cache: 'no-store' }),
          fetch('/api/wallet', { cache: 'no-store' }),
          fetch('/api/bookings?limit=5', { cache: 'no-store' }),
          fetch('/api/groups', { cache: 'no-store' }),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success) {
            const status = authData.user?.agency?.status || authData.user?.agent?.agency?.status;
            if (status) {
              setAgencyStatus(status);
            }
          }
        }

        let balance = 0;
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData.success && walletData.data) {
            balance = walletData.data.walletBalance || 0;
          }
        }

        let bookingsCount = 0;
        let revenue = 0;
        let recent: Booking[] = [];
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (bookingsData.success && Array.isArray(bookingsData.bookings)) {
            const allBookings = bookingsData.bookings;
            bookingsCount = allBookings.length;
            recent = allBookings.slice(0, 5);
            revenue = allBookings
              .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
              .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
          }
        }

        let upcoming = 0;
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          const groups = groupsData.groups || groupsData.data || [];
          if (Array.isArray(groups)) {
            upcoming = groups.filter((g: any) => g.status === 'open' && new Date(g.startDate) >= new Date()).length;
          }
        }

        setStats({
          walletBalance: balance,
          totalBookings: bookingsCount,
          monthlyRevenue: revenue,
          upcomingTours: upcoming,
        });
        setRecentBookings(recent);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Plane,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Wallet Balance',
      value: `PKR ${stats.walletBalance.toLocaleString()}`,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Expenditures',
      value: `PKR ${stats.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Upcoming Tours',
      value: stats.upcomingTours,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (agencyStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-3 tracking-tight">Approval Pending</h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
            Your agency registration is currently under review by our admin team. Once verified, you will get full access to the B2B portal, exclusive group fares, and wallet features.
          </p>
          <div className="space-y-4">
            <a 
              href="https://wa.me/923314084080" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp to Expedite
            </a>
            <p className="text-xs text-muted-foreground font-medium">
              We typically review applications within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your bookings, group tours, and agency wallet</p>
        </div>
        <Link
          href="/agent/available-tours"
          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm w-fit"
        >
          <span>Browse Available Tours</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:border-primary/40 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-foreground mt-2">{loading ? '...' : card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/agent/available-tours" className="block p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition font-semibold text-foreground text-sm">
              ✈️ Browse & Book Group Tours
            </Link>
            <Link href="/agent/wallet" className="block p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition font-semibold text-foreground text-sm">
              💳 Top Up Agency Wallet
            </Link>
            <Link href="/agent/bookings" className="block p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition font-semibold text-foreground text-sm">
              📋 View Booking History
            </Link>
            <Link href="/agent/invoices" className="block p-3.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition font-semibold text-foreground text-sm">
              📄 View Billing Invoices
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Bookings</h2>
            <Link href="/agent/bookings" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm font-semibold">Loading...</div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p className="font-semibold text-foreground">No bookings recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Book your first group tour package to see activity here.</p>
                <Link href="/agent/available-tours" className="inline-block mt-4 text-xs font-bold text-primary hover:underline">
                  Explore Available Tours →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60 border border-border rounded-xl">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition">
                    <div>
                      <p className="text-sm font-bold text-foreground">{b.groupName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-muted-foreground">{b.bookingNumber}</span>
                        <span className="text-xs text-muted-foreground">{b.numberOfPax} PAX</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">PKR {b.totalAmount.toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        b.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
