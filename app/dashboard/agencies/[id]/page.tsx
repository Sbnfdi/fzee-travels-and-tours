'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, XCircle, ArrowLeft, Phone, Mail, MapPin, Building2, ShieldCheck, Users, Edit, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AgentDetail {
  id: string;
  commissionRate: number;
  status: string;
  user: { name: string; email: string };
  createdAt: string;
}

interface AgencyDetail {
  id: string;
  businessName: string;
  businessRegistration: string;
  taxId: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
  creditLimit: number;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function AdminAgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [agents, setAgents] = useState<AgentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '', password: '', commissionRate: 10 });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const res = await fetch(`/api/admin/agencies`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.agencies)) {
            const found = data.agencies.find((a: any) => a.id === id);
            if (found) setAgency(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAgents = async () => {
      try {
        const res = await fetch(`/api/admin/agents?agencyId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAgents(data.data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchAgency();
      fetchAgents();
    }
  }, [id]);

  const handleApproveReject = async (status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/agencies/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setActionMessage(`Agency has been ${status} successfully.`);
        if (agency) setAgency({ ...agency, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAgent = async (agentId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/agents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId, ...updates }),
      });
      if (res.ok) {
        setActionMessage(`Agent updated successfully.`);
        setAgents(agents.map(a => a.id === agentId ? { ...a, ...updates } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch(`/api/admin/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: id, ...newAgent }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage('Agent added successfully.');
        setAgents([data.data, ...agents]);
        setShowAddForm(false);
        setNewAgent({ name: '', email: '', phone: '', password: '', commissionRate: 10 });
      } else {
        setAddError(data.error || 'Failed to add agent');
      }
    } catch (err) {
      setAddError('An error occurred');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-bold">Loading agency profile...</div>;
  }

  const currentAgency = agency || {
    id: id || 'ag-1',
    businessName: 'Fzee Partner Travel Agency',
    businessRegistration: 'REG-884920',
    taxId: 'TAX-99401',
    phone: '+92 333 9453658',
    address: 'Main Boulevard, Gulberg III',
    city: 'Lahore',
    country: 'Pakistan',
    status: 'approved',
    creditLimit: 100000,
    createdAt: new Date().toLocaleDateString('en-PK'),
    user: { name: 'Demo Agent', email: 'agent@fzeetravels.com' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-foreground">
      <Link href="/dashboard/agencies" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Agencies</span>
      </Link>

      {actionMessage && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-8 space-y-8 shadow-xl shadow-black/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground tracking-tight">{currentAgency.businessName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                currentAgency.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'
              }`}>
                {currentAgency.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registration Reg: <span className="font-mono text-foreground font-bold">{currentAgency.businessRegistration}</span></p>
          </div>

          <div className="flex items-center gap-3">
            {currentAgency.status !== 'approved' && (
              <button
                onClick={() => handleApproveReject('approved')}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 text-xs shadow-md shadow-primary/20 transition"
              >
                Approve Agency
              </button>
            )}
            {currentAgency.status !== 'rejected' && (
              <button
                onClick={() => handleApproveReject('rejected')}
                className="px-5 py-2.5 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-xl text-xs transition"
              >
                Reject Agency
              </button>
            )}
          </div>
        </div>

        {/* Agency Information */}
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-2">
            <span className="text-xs font-bold uppercase text-muted-foreground block">Contact Person</span>
            <span className="text-base font-bold text-foreground block">{currentAgency.user?.name || 'N/A'}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary" /> {currentAgency.user?.email}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary" /> {currentAgency.phone}</span>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 space-y-2">
            <span className="text-xs font-bold uppercase text-muted-foreground block">Business Location</span>
            <span className="text-base font-bold text-foreground block">{currentAgency.address}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> {currentAgency.city}, {currentAgency.country}</span>
            <span className="text-xs text-muted-foreground">Tax ID: <span className="font-mono text-foreground font-bold">{currentAgency.taxId}</span></span>
          </div>
        </div>

        {/* Financial Limits */}
        <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-primary block">Approved Agency Credit Limit</span>
            <span className="text-3xl font-black text-primary">PKR {currentAgency.creditLimit.toLocaleString()}</span>
          </div>
          <ShieldCheck className="w-10 h-10 text-primary opacity-80" />
        </div>

        {/* Agents List */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Registered Agents</h2>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/90 transition"
            >
              {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Agent</>}
            </button>
          </div>
          
          {showAddForm && (
            <form onSubmit={handleAddAgent} className="p-4 bg-muted/30 border border-border rounded-xl space-y-4 mb-4">
              <h3 className="font-bold text-sm">Add New Agent</h3>
              {addError && <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">{addError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" className="px-3 py-2 rounded-lg text-sm border" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
                <input required type="email" placeholder="Email" className="px-3 py-2 rounded-lg text-sm border" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} />
                <input required placeholder="Phone" className="px-3 py-2 rounded-lg text-sm border" value={newAgent.phone} onChange={e => setNewAgent({...newAgent, phone: e.target.value})} />
                <input required type="password" placeholder="Password (min 6 chars)" minLength={6} className="px-3 py-2 rounded-lg text-sm border" value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} />
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-sm font-semibold">Commission Rate (%):</span>
                  <input required type="number" min="0" max="100" className="px-3 py-2 rounded-lg text-sm border w-24" value={newAgent.commissionRate} onChange={e => setNewAgent({...newAgent, commissionRate: Number(e.target.value)})} />
                  <button type="submit" disabled={adding} className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2">
                    {adding && <Loader2 className="w-4 h-4 animate-spin" />} Create Agent
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="border border-border rounded-xl divide-y divide-border/60">
            {agents.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm font-medium">
                No agents registered under this agency yet.
              </div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card hover:bg-muted/30 transition">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{agent.user?.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-primary" /> {agent.user?.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Commission</span>
                      <span className="text-sm font-black text-primary">{agent.commissionRate}%</span>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-20 text-center ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.status}
                    </span>
                    
                    <div className="flex gap-2 border-l border-border pl-4 ml-2">
                      <button 
                        onClick={() => {
                          const newRate = prompt('Enter new commission rate (0-100):', agent.commissionRate.toString());
                          if (newRate !== null && !isNaN(Number(newRate))) {
                            handleUpdateAgent(agent.id, { commissionRate: Number(newRate) });
                          }
                        }}
                        className="p-2 hover:bg-muted rounded-lg transition" title="Update Commission"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      <button 
                        onClick={() => handleUpdateAgent(agent.id, { status: agent.status === 'active' ? 'suspended' : 'active' })}
                        className="p-2 hover:bg-muted rounded-lg transition" title="Toggle Status"
                      >
                        {agent.status === 'active' ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
