'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Briefcase, CreditCard } from 'lucide-react';

interface DashboardStats {
  totalAgencies: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agenciesRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/agencies'),
          fetch('/api/bookings'),
        ]);

        let agencyCount = 0;
        let pendingCount = 0;
        let bookingCount = 0;
        let revenueSum = 0;

        if (agenciesRes.ok) {
          const data = await agenciesRes.json();
          const agencies = data.agencies || data.data || [];
          if (Array.isArray(agencies)) {
            agencyCount = agencies.length;
            pendingCount = agencies.filter((a: any) => a.status === 'pending').length;
          }
        }

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          const bookings = data.bookings || data.data || [];
          if (Array.isArray(bookings)) {
            bookingCount = bookings.length;
            revenueSum = bookings
              .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
              .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
          }
        }

        setStats({
          totalAgencies: agencyCount,
          totalBookings: bookingCount,
          totalRevenue: revenueSum,
          pendingApprovals: pendingCount,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Registered Agencies',
      value: stats.totalAgencies,
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Revenue',
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Overview</h1>
        <p className="text-white/60 mt-1">Fzee Travels & Tours Enterprise Control Center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:border-primary/40 transition-all hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-2 drop-shadow-md">{loading ? '...' : card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
