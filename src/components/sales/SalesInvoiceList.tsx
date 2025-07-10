import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useState } from 'react';
import { 
  Calendar, 
  Receipt, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InvoicePreviewModal from './InvoicePreviewModal';
import { useAuth } from '@/hooks/useAuth';

interface Invoice {
  id: string;
  date: string;
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'partial';
  items: any[];
  paidAmount?: number;
  customerName?: string;
  gst_amount?: number;
  transport_charges?: number;
  subtotal?: number;
  delivery_notes?: string;
  transport_company?: string;
  truck_number?: string;
  driver_contact?: string;
}

interface SalesInvoiceListProps {
  customerId?: string;
  invoices?: Invoice[];
  onDeleteInvoice?: (invoiceId: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  showHeader?: boolean;
  title?: string;
}

const SalesInvoiceList: React.FC<SalesInvoiceListProps> = ({ 
  customerId, 
  invoices = [],
  onDeleteInvoice,
  onEditInvoice,
  showHeader = true,
  title = "Sales Invoices"
}) => {
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { profile } = useAuth();

const formatINR = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const amountInWords = (num: number) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + (n % 100 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + ' Crore ' + inWords(n % 10000000);
  };
  return inWords(Math.floor(num)).trim() + ' Rupees Only';
};

const downloadInvoiceAsPDF = (invoice: Invoice, profile: any) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', doc.internal.pageSize.width - 20, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 20;

  // LEFT: Invoice metadata
  doc.text('Invoice #: ', 10, y);
  doc.text(`${invoice.id}`, 35, y);

  y += 6;
  doc.text('Invoice Date: ', 10, y);
  doc.text(`${new Date(invoice.date).toLocaleDateString('en-IN')}`, 35, y);

  y += 6;
  doc.text('Due Date: ', 10, y);
  doc.text(`${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}`, 35, y);

  // BILL TO (Customer)
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 10, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.customerName || 'N/A'}`, 10, y); y += 5;
  if (invoice.customerAddress) {
    doc.text(invoice.customerAddress, 10, y); y += 5;
  }
  doc.text(`Phone: ${invoice.customerPhone || 'N/A'}`, 10, y);

  // BILL FROM (Company)
  y = 40;
  const rightX = doc.internal.pageSize.width / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill From:', rightX, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  if (profile) {
    doc.text(`${profile.organization_name || 'Company'}`, rightX, y); y += 5;
    if (profile.business_address) {
      doc.text(profile.business_address, rightX, y); y += 5;
    }
    doc.text(`Phone: ${profile.phone || 'N/A'}`, rightX, y); y += 5;
    doc.text(`GST: ${profile.gst_number || 'N/A'}`, rightX, y);
  }

  // Items Table
  y = 90;
  const tableRows = invoice.items.map((item, index) => [
    `${index + 1}`,
    item.name,
    formatINR(item.rate),
    `${item.quantity}`,
    formatINR(item.amount)
  ]);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Description', 'Price', 'Qty', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
    didDrawPage: function (data) {
      y = data.cursor.y;
    },
  });

  // Totals
  y += 10;
  const labelX = doc.internal.pageSize.width - 60;
  const valueX = doc.internal.pageSize.width - 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', labelX, y, { align: 'right' });
  doc.text(formatINR(invoice.subtotal || 0), valueX, y, { align: 'right' }); y += 6;

  doc.text('GST:', labelX, y, { align: 'right' });
  doc.text(formatINR(invoice.gst_amount || 0), valueX, y, { align: 'right' }); y += 6;

  doc.text('Transport:', labelX, y, { align: 'right' });
  doc.text(formatINR(invoice.transport_charges || 0), valueX, y, { align: 'right' }); y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DUE:', labelX, y, { align: 'right' });
  doc.text(formatINR(invoice.grandTotal), valueX, y, { align: 'right' }); y += 10;

  // Amount in words
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', 10, y); y += 5;
  doc.setFont('helvetica', 'normal');
  const words = doc.splitTextToSize(amountInWords(invoice.grandTotal), doc.internal.pageSize.width - 20);
  doc.text(words, 10, y);
  y += words.length * 5 + 5;

  // Payment status
  // doc.setFont('helvetica', 'bold');
  // doc.text(`Payment Status:`, 10, y);
  // doc.setFont('helvetica', 'normal');
  // doc.text(`${invoice.status?.toUpperCase() || 'UNPAID'}`, 50, y); y += 6;

  // if (invoice.paidAmount) {
  //   doc.text(`Paid Amount: ₹${invoice.paidAmount.toFixed(2)}`, 10, y);
  //   y += 6;
  // }

  // Transport Details
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Transport Details:', 10, y); y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Company: ${invoice.transport_company || 'N/A'}`, 10, y); y += 5;
  doc.text(`Truck Number: ${invoice.truck_number || 'N/A'}`, 10, y); y += 5;
  doc.text(`Driver Contact: ${invoice.driver_contact || 'N/A'}`, 10, y); y += 8;

  // Notes (if any)
  if (invoice.delivery_notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 10, y); y += 5;
    doc.setFont('helvetica', 'normal');
    const notes = doc.splitTextToSize(invoice.delivery_notes, doc.internal.pageSize.width - 20);
    doc.text(notes, 10, y);
  }

  doc.save(`invoice-${invoice.id}.pdf`);
};

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
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'unpaid':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/20';
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

  const handlePreviewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (onDeleteInvoice) {
      onDeleteInvoice(invoiceId);
    }
  };

  const hasInvoices = invoices.length > 0;

  return (
    <>
      <Card className="glass-card">
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {title} ({invoices.length})
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {hasInvoices ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="activity-item relative bg-card/20 border border-border/50 rounded-lg p-4"
                  id={`invoice-${invoice.id}`}
                >
                  {/* Three dots at top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/20">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg z-50">
                        <DropdownMenuItem 
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Invoice
                        </DropdownMenuItem>
                        {onEditInvoice && (
                          <DropdownMenuItem 
                            onClick={() => onEditInvoice(invoice)}
                            className="cursor-pointer hover:bg-muted/20"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Invoice
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => downloadInvoiceAsJSON(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => downloadInvoiceAsPDF(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {onDeleteInvoice && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="cursor-pointer hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
{/*                       <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(invoice.status)}
                      </div> */}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">{invoice.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invoice.date)} • {getItemsSummary(invoice.items)}
                        </div>
                        {invoice.customerName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Customer: {invoice.customerName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center items-start sm:items-end gap-1 sm:gap-3 mt-2 sm:mt-0">
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
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)} whitespace-nowrap`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
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

      <InvoicePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        invoice={previewInvoice}
      />
    </>
  );
};

export default SalesInvoiceList;
