'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Printer, Search, Eye } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  groupName: string;
  issueDate: string;
  totalAmount: number;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoices');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.invoices)) {
            setInvoices(data.invoices);
          }
        }
      } catch (err) {
        console.error('Failed to load invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.groupName && inv.groupName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Billing Invoices</h1>
          <p className="text-muted-foreground mt-1">View and download invoices for your agency bookings</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-bold">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <p className="font-bold text-foreground text-base">No Invoices Issued Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">Invoices are automatically generated when you submit and confirm group tour bookings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Tour Package</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 hover:bg-muted/20">
                  <td className="px-6 py-4 font-bold text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{inv.groupName || 'Tour Package'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString('en-PK')}</td>
                  <td className="px-6 py-4 font-bold text-primary">PKR {inv.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/agent/invoices/${inv.id}`} className="p-2 hover:bg-muted rounded-lg text-foreground transition inline-flex items-center gap-1.5 text-xs font-bold" title="View & Print Invoice">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </div>
  );
}
