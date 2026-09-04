'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Plus, CheckCircle2, XCircle, Mail, Phone, 
  Building2, ShieldAlert, ShieldCheck, Loader2, Filter, Percent, ArrowUpRight
} from 'lucide-react';

interface Agent {
  id: string;
  agencyId: string;
  commissionRate: number;
  walletBalance: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  agency: {
    businessName: string;
  };
}

interface AgencyOption {
  id: string;
  businessName: string;
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add Agent Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    agencyId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    commissionRate: 0,
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Commission Modal State
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(0);
  const [savingCommission, setSavingCommission] = useState(false);

  // Fetch agents and agencies
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAgents(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const res = await fetch('/api/admin/agencies');
      if (res.ok) {
        const data = await res.json();
        const agencyList = data.agencies || data.data || [];
        if (Array.isArray(agencyList)) {
          setAgencies(agencyList.map((a: any) => ({ id: a.id, businessName: a.businessName })));
        }
      }
    } catch (err) {
      console.error('Failed to fetch agencies:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchAgencies();
  }, []);

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`Agent status changed to ${nextStatus}.`);
        setAgents(agents.map(a => a.id === agentId ? { ...a, status: nextStatus } : a));
      } else {
        setError(data.error || 'Failed to update agent status.');
      }
    } catch (err) {
      setError('An error occurred while updating status.');
    } finally {
      setTimeout(() => { setMessage(''); setError(''); }, 3500);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setSavingCommission(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAgent.id, commissionRate: Number(newCommissionRate) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`Commission rate updated to ${newCommissionRate}%.`);
        setAgents(agents.map(a => a.id === editingAgent.id ? { ...a, commissionRate: Number(newCommissionRate) } : a));
        setEditingAgent(null);
      } else {
        setError(data.error || 'Failed to update commission rate.');
      }
    } catch (err) {
      setError('An error occurred while updating commission rate.');
    } finally {
      setSavingCommission(false);
      setTimeout(() => { setMessage(''); setError(''); }, 3500);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('New agent created and linked to agency successfully!');
        setShowAddModal(false);
        setNewAgent({
          agencyId: '',
          name: '',
          email: '',
          phone: '',
          password: '',
          commissionRate: 0,
        });
        fetchAgents();
      } else {
        setAddError(data.error || 'Failed to create agent.');
      }
    } catch (err) {
      setAddError('An unexpected network error occurred.');
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const nameMatch = agent.user?.name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = agent.user?.email?.toLowerCase().includes(search.toLowerCase());
    const phoneMatch = agent.user?.phone?.toLowerCase().includes(search.toLowerCase());
    const agencyMatch = agent.agency?.businessName?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || nameMatch || emailMatch || phoneMatch || agencyMatch;

    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesAgency = agencyFilter === 'all' || agent.agencyId === agencyFilter;

    return matchesSearch && matchesStatus && matchesAgency;
  });

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const suspendedAgents = agents.filter(a => a.status === 'suspended').length;
  const uniqueAgencies = new Set(agents.map(a => a.agencyId)).size;

  return (
    <div className="space-y-8 text-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Agents Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Oversee travel agents, configure commission rates, monitor status, and manage agency staff
          </p>
        </div>

        <button
          onClick={() => {
            if (agencies.length > 0 && !newAgent.agencyId) {
              setNewAgent(prev => ({ ...prev, agencyId: agencies[0].id }));
            }
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/20 inline-flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Agent</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-medium text-sm flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Agents</span>
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground mt-3">{loading ? '...' : totalAgents}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Agents</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground mt-3">{loading ? '...' : activeAgents}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suspended</span>
            <div className="p-2 bg-red-500/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground mt-3">{loading ? '...' : suspendedAgents}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linked Agencies</span>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground mt-3">{loading ? '...' : uniqueAgencies}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent name, email, phone, or agency..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-input bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-input bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-[200px] truncate"
          >
            <option value="all">All Agencies</option>
            {agencies.map(agency => (
              <option key={agency.id} value={agency.id}>
                {agency.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Loading agents list...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-foreground text-base">No Agents Found</p>
            <p className="text-xs max-w-sm mx-auto">
              {search || statusFilter !== 'all' || agencyFilter !== 'all'
                ? 'Try adjusting your search criteria or filter options.'
                : 'Click "Add New Agent" above to create an agent under any agency.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                  <th className="px-6 py-4">Agent Name & Contact</th>
                  <th className="px-6 py-4">Agency</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-sm">{agent.user?.name || 'Unnamed Agent'}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-primary" /> {agent.user?.email}
                        </span>
                        {agent.user?.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-primary" /> {agent.user?.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/agencies/${agent.agencyId}`}
                        className="inline-flex items-center gap-1.5 font-bold text-foreground hover:text-primary transition group text-sm"
                        title="View Agency Profile"
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                        <span>{agent.agency?.businessName || 'Unknown Agency'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingAgent(agent);
                          setNewCommissionRate(agent.commissionRate || 0);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-lg text-xs font-bold text-foreground transition"
                        title="Click to change commission rate"
                      >
                        <Percent className="w-3 h-3 text-primary" />
                        <span>{agent.commissionRate || 0}%</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        agent.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        {agent.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{agent.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition border ${
                            agent.status === 'active'
                              ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
                              : 'border-green-600/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40'
                          }`}
                        >
                          {agent.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">Add New Agent</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Register an agent and assign to an agency</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive font-semibold text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Select Agency <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={newAgent.agencyId}
                  onChange={(e) => setNewAgent({ ...newAgent, agencyId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="" disabled>-- Select Travel Agency --</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>
                      {agency.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Agent Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="e.g. Ali Khan"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="agent@agency.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Initial Password <span className="text-destructive">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-sm shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{adding ? 'Creating Agent...' : 'Create Agent Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border border-input font-bold rounded-xl hover:bg-muted text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-foreground">Set Commission Rate</h2>
                <p className="text-xs text-muted-foreground">{editingAgent.user?.name}</p>
              </div>
              <button 
                onClick={() => setEditingAgent(null)} 
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Commission Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    required
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Percent className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingCommission}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-xs shadow-md shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {savingCommission && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingCommission ? 'Saving...' : 'Update Commission'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2.5 border border-input font-bold rounded-xl hover:bg-muted text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
