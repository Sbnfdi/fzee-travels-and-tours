'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Check, X } from 'lucide-react';

interface Agency {
  id: string;
  businessName: string;
  user: { email: string; name: string };
  status: string;
  createdAt: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        
        const response = await fetch(`/api/admin/agencies?${params}`);
        const data = await response.json();
        setAgencies(data.data || []);
      } catch (error) {
        console.error('Failed to fetch agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/agencies/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });
      
      if (response.ok) {
        setAgencies(agencies.map(a => a.id === id ? { ...a, status: 'approved' } : a));
      }
    } catch (error) {
      console.error('Failed to approve agency:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/agencies/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, rejectionReason: 'Rejected by admin' }),
      });
      
      if (response.ok) {
        setAgencies(agencies.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
      }
    } catch (error) {
      console.error('Failed to reject agency:', error);
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.businessName.toLowerCase().includes(search.toLowerCase()) ||
    agency.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agencies</h1>
        <p className="text-muted-foreground mt-2">Manage travel agencies and approvals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agencies..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Agencies Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold">Business Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Registered</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading agencies...
                  </td>
                </tr>
              ) : filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No agencies found
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => (
                  <tr key={agency.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 font-medium">{agency.businessName}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{agency.user.name}</div>
                      <div className="text-muted-foreground">{agency.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[agency.status] || statusColors.pending}`}>
                        {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/agencies/${agency.id}`} className="p-2 hover:bg-muted rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {agency.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(agency.id)} className="p-2 hover:bg-green-100 dark:hover:bg-green-950 rounded-lg transition">
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button onClick={() => handleReject(agency.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-950 rounded-lg transition">
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
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
