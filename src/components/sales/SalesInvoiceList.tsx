
import React, { useState } from 'react';
import { 
  Calendar, 
  Receipt, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Invoice {
  id: string;
  date: string;
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'partial';
  items: any[];
  paidAmount?: number;
}

interface SalesInvoiceListProps {
  customerId: number;
  invoices?: Invoice[];
}

const SalesInvoiceList: React.FC<SalesInvoiceListProps> = ({ 
  customerId, 
  invoices = [] 
}) => {
  // Mock invoice data - in real app this would come from database
  const defaultInvoices: Invoice[] = [
    {
      id: 'INV-001',
      date: '2024-01-15',
      grandTotal: 25000,
      status: 'paid',
      items: [{ name: 'Steel Rods' }, { name: 'Cement' }]
    },
    {
      id: 'INV-002',
      date: '2024-01-20',
      grandTotal: 18000,
      status: 'partial',
      items: [{ name: 'Iron Sheets' }],
      paidAmount: 10000
    },
    {
      id: 'INV-003',
      date: '2024-01-25',
      grandTotal: 32000,
      status: 'unpaid',
      items: [{ name: 'Construction Materials' }]
    }
  ];

  const allInvoices = [...defaultInvoices, ...invoices];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'unpaid':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Receipt className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-overdue';
      case 'partial':
        return 'status-pending';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getItemsSummary = (items: any[]) => {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) return items[0].name;
    return `${items[0].name} +${items.length - 1} more`;
  };

  const hasInvoices = allInvoices.length > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Sales Invoices ({allInvoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasInvoices ? (
          <div className="space-y-3">
            {allInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="activity-item"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{invoice.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)} • {getItemsSummary(invoice.items)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        ₹{invoice.grandTotal.toLocaleString()}
                      </div>
                      {invoice.status === 'partial' && invoice.paidAmount && (
                        <div className="text-xs text-muted-foreground">
                          Paid: ₹{invoice.paidAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Yet</h3>
            <p className="text-muted-foreground text-sm">
              Create your first invoice to start tracking sales
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesInvoiceList;
