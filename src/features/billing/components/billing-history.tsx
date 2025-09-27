'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Download, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { InvoiceDetails } from '../types/billing-types';

interface BillingHistoryProps {
  companyId?: string;
  limit?: number;
}

export function BillingHistory({ companyId, limit = 10 }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<InvoiceDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [companyId, limit]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/billing/invoices?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load billing history');
      toast.error('Failed to load billing history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Paid', variant: 'default' as const },
      open: { label: 'Open', variant: 'secondary' as const },
      draft: { label: 'Draft', variant: 'outline' as const },
      uncollectible: { label: 'Uncollectible', variant: 'destructive' as const },
      void: { label: 'Void', variant: 'outline' as const },
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleDownloadInvoice = (invoice: InvoiceDetails) => {
    if (invoice.invoicePdf) {
      window.open(invoice.invoicePdf, '_blank');
    } else if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank');
    } else {
      toast.error('Invoice download not available');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchInvoices} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No invoices found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invoices will appear here after your first billing cycle
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View and download past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.number || invoice.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>{formatDate(invoice.periodStart)}</TableCell>
                  <TableCell>
                    {formatCurrency(invoice.amountPaid || invoice.amountDue, invoice.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.hostedInvoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.hostedInvoiceUrl!, '_blank')}
                          title="View Invoice"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {(invoice.invoicePdf || invoice.hostedInvoiceUrl) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {invoices.length >= limit && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => {
                const portal = async () => {
                  try {
                    const response = await fetch('/api/billing/portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        returnUrl: window.location.href,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to create billing portal session');
                    }

                    const { url } = await response.json();
                    window.location.href = url;
                  } catch (error) {
                    toast.error('Failed to open billing portal');
                  }
                };
                portal();
              }}
            >
              View All Invoices
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
