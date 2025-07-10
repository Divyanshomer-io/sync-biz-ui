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

const downloadInvoiceAsPDF = (invoice, profile) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- HEADER: Title & Company Info ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(34, 49, 63); // Brand color
  doc.text("INVOICE", pageWidth / 2, 40, { align: "center" });

  // Company Info Centered
  let y = 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(profile?.organization_name || 'N/A', pageWidth / 2, y, { align: "center" });
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (profile?.phone) {
    doc.text(`Phone: ${profile.phone}`, pageWidth / 2, y, { align: "center" });
    y += 12;
  }
  if (profile?.gst_number) {
    doc.text(`GST: ${profile.gst_number}`, pageWidth / 2, y, { align: "center" });
    y += 12;
  }
  if (profile?.business_type) {
    doc.text(`Business Type: ${profile.business_type}`, pageWidth / 2, y, { align: "center" });
    y += 12;
  }
  if (profile?.address) {
    doc.text(profile.address, pageWidth / 2, y, { align: "center" });
    y += 12;
  }

  // --- Divider ---
  y += 8;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(1);
  doc.line(40, y, pageWidth - 40, y);
  y += 16;

  // --- Invoice & Customer Details ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #:`, 40, y);
  doc.setFont('courier', 'bold');
  doc.text(`${invoice.id}`, 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date:`, pageWidth/2, y);
  doc.setFont('courier', 'bold');
  doc.text(`${new Date(invoice.date).toLocaleDateString('en-IN')}`, pageWidth/2 + 35, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text("Bill To:", 40, y);
  doc.setFont('courier', 'bold');
  doc.text(`${invoice.customerName || 'N/A'}`, 110, y);
  doc.setFont('helvetica', 'normal');
  y += 18;

  // --- Items Table with Monospaced Numbers ---
  const tableColumn = [
    { header: "Item", dataKey: "name" },
    { header: "Qty", dataKey: "quantity" },
    { header: "Unit", dataKey: "unit" },
    { header: "Rate (₹)", dataKey: "rate" },
    { header: "Amount (₹)", dataKey: "amount" }
  ];
  const tableRows = invoice.items.map(item => ({
    name: item.name,
    quantity: String(item.quantity),
    unit: item.unit || '',
    rate: item.rate.toFixed(2),
    amount: item.amount.toFixed(2)
  }));

  autoTable(doc, {
    startY: y,
    head: [tableColumn.map(col => col.header)],
    body: tableRows.map(row => tableColumn.map(col => row[col.dataKey])),
    theme: 'grid',
    headStyles: {
      fillColor: [34, 49, 63],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center', font: 'courier', fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'right', font: 'courier', fontStyle: 'bold' },
      4: { halign: 'right', font: 'courier', fontStyle: 'bold' }
    },
    didDrawCell: (data) => {
      // Monospaced font for numbers
      if ([1, 3, 4].includes(data.column.index)) {
        data.cell.styles.font = 'courier';
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage: function (data) {
      y = data.cursor.y + 16;
    }
  });

  // --- Totals Section (Boxed, Monospaced) ---
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - 210, y, 170, 70, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const labelX = pageWidth - 200;
  const valueX = pageWidth - 50;
  let ty = y + 16;

  const drawTotalRow = (label, value, bold = false, color = null) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    if (color) doc.setTextColor(...color); else doc.setTextColor(0, 0, 0);
    doc.text(label, labelX, ty, { align: 'left' });
    doc.setFont('courier', 'bold');
    doc.text(`₹${value}`, valueX, ty, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    ty += 14;
  };

  drawTotalRow('Subtotal:', (invoice.subtotal || 0).toFixed(2));
  drawTotalRow('GST Amount:', (invoice.gst_amount || 0).toFixed(2));
  drawTotalRow('Transport:', (invoice.transport_charges || 0).toFixed(2));
  drawTotalRow('TOTAL:', invoice.grandTotal.toFixed(2), true, [34, 49, 63]);

  y = Math.max(y + 70, ty);

  // --- Payment Status ---
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Payment Status:`, 40, y);
  doc.setFont('courier', 'bold');
  doc.text(`${invoice.status.toUpperCase()}`, 140, y);
  y += 14;
  if (invoice.paidAmount) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Paid Amount:`, 40, y);
    doc.setFont('courier', 'bold');
    doc.text(`₹${invoice.paidAmount.toFixed(2)}`, 140, y);
    y += 14;
  }

  // --- Transport Details ---
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Transport Details:", 40, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Company: ${invoice.transport_company || 'N/A'}`, 40, y); y += 12;
  doc.text(`Truck Number: ${invoice.truck_number || 'N/A'}`, 40, y); y += 12;
  doc.text(`Driver Contact: ${invoice.driver_contact || 'N/A'}`, 40, y); y += 12;

  // --- Notes Section ---
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Notes:", 40, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitNotes = doc.splitTextToSize(invoice.delivery_notes || 'N/A', pageWidth - 80);
  doc.text(splitNotes, 40, y);

  // --- Footer ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for your business!", pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: "center" });

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
