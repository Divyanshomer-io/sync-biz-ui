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
  const downloadInvoiceAsPDF = (invoice: Invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- HEADER ---
  // Company Logo (Optional)
  // doc.addImage(profile.logo, 'PNG', 10, 10, 30, 30); // Uncomment if logo is available

  // Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(34, 34, 34);
  doc.text("INVOICE", pageWidth / 2, 22, { align: "center" });

  // Company Details
  if (profile) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(44, 44, 44);
    doc.text(profile.organization_name, pageWidth / 2, 32, { align: "center" });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    let yPos = 39;
    if (profile.address) {
      doc.text(profile.address, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
    }
    if (profile.phone) {
      doc.text(`Phone: ${profile.phone}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
    }
    if (profile.gst_number) {
      doc.text(`GST Number: ${profile.gst_number}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
    }
    if (profile.business_type) {
      doc.text(`Business Type: ${profile.business_type}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
    }
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.6);
  doc.line(10, 55, pageWidth - 10, 55);

  // --- INVOICE & CUSTOMER DETAILS ---
  let y = 63;
  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);

  // Two-column layout
  doc.setFont('helvetica', 'bold');
  doc.text("Invoice #:", 12, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.id}`, 35, y);
  doc.setFont('helvetica', 'bold');
  doc.text("Date:", pageWidth / 2 + 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(invoice.date).toLocaleDateString('en-IN')}`, pageWidth / 2 + 28, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", 12, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.customerName || 'N/A'}`, 35, y);
  doc.setFont('helvetica', 'bold');
  doc.text("Customer Address:", pageWidth / 2 + 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.customerAddress || 'N/A'}`, pageWidth / 2 + 45, y);
  y += 10;

  // --- ITEMS TABLE ---
  const tableColumn = ["Item", "Quantity", "Unit", "Rate per unit (inr)", "Amount (inr)"];
  const tableRows: any = [];
  invoice.items.forEach(item => {
    tableRows.push([
      item.name,
      item.quantity,
      item.unit || '',
      item.rate.toFixed(2),
      item.amount.toFixed(2)
    ]);
  });

  autoTable(doc, {
    startY: y,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [34, 34, 34],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: 'left'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    didDrawPage: function (data: any) {
      y = data.cursor.y;
    }
  });

  y += 8;

  // --- TOTALS SUMMARY ---
// Set up constants for layout
const marginX = 12;
const rowHeight = 8;
const highlightHeight = rowHeight + 4; // Extra padding for highlight
const totalLabelX = pageWidth - 70;
const totalValueX = pageWidth - 18;

// Subtotal
doc.setFontSize(10);
doc.setTextColor(44, 44, 44);
doc.setFont('helvetica', 'normal');
doc.text('Subtotal:', totalLabelX, y, { align: 'right' });
doc.text(`${(invoice.subtotal || 0).toFixed(2)} (inr)`, totalValueX, y, { align: 'right' });
y += rowHeight;

// GST Amount
doc.text('GST Amount:', totalLabelX, y, { align: 'right' });
doc.text(`${(invoice.gst_amount || 0).toFixed(2)} (inr)`, totalValueX, y, { align: 'right' });
y += rowHeight;

// Transport Charges
doc.text('Transport Charges:', totalLabelX, y, { align: 'right' });
doc.text(`${(invoice.transport_charges || 0).toFixed(2)} (inr)`, totalValueX, y, { align: 'right' });
y += rowHeight + 2; // Slightly more space before total

// Highlighted Total Amount Row
const highlightY = y - 4; // Start rectangle a bit above text
const highlightWidth = pageWidth - marginX * 2;
doc.setFillColor(230, 230, 230);
doc.rect(marginX, highlightY, highlightWidth, highlightHeight, 'F'); // Highlight full row

doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.setTextColor(44, 44, 44);
doc.text('Total Amount:', totalLabelX, y + 3, { align: 'right' });
doc.text(`${invoice.grandTotal.toFixed(2)} (inr)`, totalValueX, y + 3, { align: 'right' });

// Reset font and color for further content
doc.setFont('helvetica', 'normal');
doc.setTextColor(44, 44, 44);
y += highlightHeight + 6; // Move y for next section


  // --- AMOUNT IN WORDS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(44, 44, 44);
  doc.text('Amount in Words:', 14, y);
  doc.setFont('courier', 'italic');
  doc.setFontSize(10);
  const words = doc.splitTextToSize(amountInWords(invoice.grandTotal), pageWidth - 28);
  doc.text(words, 14, y + 7);
  y += words.length * 6 + 12;

  // --- TRANSPORT DETAILS (Boxed Section) ---
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(12, y, pageWidth - 24, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Transport Details:', 16, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Company: ${invoice.transport_company || 'N/A'}`, 16, y + 15);
  doc.text(`Truck Number: ${invoice.truck_number || 'N/A'}`, 80, y + 15);
  doc.text(`Driver Contact: ${invoice.driver_contact || 'N/A'}`, 150, y + 15);
  y += 32;

  // --- PAYMENT STATUS (Optional) ---
  // if (invoice.status || invoice.paidAmount) {
  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(10);
  //   doc.text('Payment Status:', 14, y);
  //   doc.setFont('helvetica', 'normal');
  //   doc.text(`${invoice.status ? invoice.status.toUpperCase() : 'N/A'}`, 45, y);
  //   if (invoice.paidAmount) {
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Paid Amount:', 90, y);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`₹${invoice.paidAmount.toFixed(2)}`, 120, y);
  //   }
  //   y += 10;
  // }

  // --- FOOTER ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Optional: Invoice Terms
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(8);
  // doc.text('Payment due within 15 days.', pageWidth / 2, pageHeight - 14, { align: 'center' });

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
