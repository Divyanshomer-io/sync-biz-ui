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
  // --- Header ---
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0); // Black for main title
  doc.text("INVOICE", doc.internal.pageSize.width / 2, 20, { align: "center" });

  // Company Information
  if (profile) {
    doc.setFontSize(14);
    doc.setTextColor(70, 70, 70);
    doc.text(profile.organization_name, doc.internal.pageSize.width / 2, 32, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let yPos = 40;
    
    if (profile.phone) {
      doc.text(`Phone: ${profile.phone}`, doc.internal.pageSize.width / 2, yPos, { align: "center" });
      yPos += 6;
    }
    
    if (profile.gst_number) {
      doc.text(`GST Number: ${profile.gst_number}`, doc.internal.pageSize.width / 2, yPos, { align: "center" });
      yPos += 6;
    }
    
    if (profile.business_type) {
      doc.text(`Business Type: ${profile.business_type}`, doc.internal.pageSize.width / 2, yPos, { align: "center" });
      yPos += 6;
    }
  }

  // Add a line separator
  doc.setDrawColor(0, 0, 0); // Black line for professional look
  doc.setLineWidth(0.5);
  doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

  // --- Invoice and Customer Details ---
  let y = 65;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black for main text

  doc.text("Invoice #:", 10, y);
  doc.setFont(undefined, 'bold');
  doc.text(`${invoice.id}`, 40, y);
  doc.setFont(undefined, 'normal');

  doc.text("Date:", doc.internal.pageSize.width / 2, y);
  doc.setFont(undefined, 'bold');
  doc.text(`${new Date(invoice.date).toLocaleDateString('en-IN')}`, doc.internal.pageSize.width / 2 + 20, y);
  doc.setFont(undefined, 'normal');
  y += 7;

  doc.text("Bill To:", 10, y);
  doc.setFont(undefined, 'bold');
  doc.text(`${invoice.customerName || 'N/A'}`, 40, y);
  doc.setFont(undefined, 'normal');
  // You might want to add customer address here if available in invoice object
  // doc.text(`Customer Address Line 1`, 40, y + 5);
  // doc.text(`Customer Address Line 2`, 40, y + 10);
  y += 15; // Adjust y after customer details

  // --- Items Table ---
  // Define table headers
  const tableColumn = ["Item", "Quantity", "Unit", "Rate (₹)", "Amount (₹)"];
  // Define table rows
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

  autoTable(doc,{
    startY: y,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid', // 'striped', 'grid', 'plain'
    headStyles: {
      fillColor: [230, 230, 230], // Light grey header
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    didDrawPage: function (data: any) {
      y = data.cursor.y; // Update y position after table
    }
  });

  y += 10; // Add some space after the table

  // --- Totals and Payment Status ---
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal'); // Ensure font is normal for this section

  const totalLabelX = doc.internal.pageSize.width - 60; // Align labels to the right
  const totalValueX = doc.internal.pageSize.width - 15; // Align values further right

  doc.text(`Subtotal:`, totalLabelX, y, { align: 'right' });
  doc.text(`₹${(invoice.subtotal || 0).toFixed(2)}`, totalValueX, y, { align: 'right' });
  y += 6;

  doc.text(`GST Amount:`, totalLabelX, y, { align: 'right' });
  doc.text(`₹${(invoice.gst_amount || 0).toFixed(2)}`, totalValueX, y, { align: 'right' });
  y += 6;

  doc.text(`Transport Charges:`, totalLabelX, y, { align: 'right' });
  doc.text(`₹${(invoice.transport_charges || 0).toFixed(2)}`, totalValueX, y, { align: 'right' });
  y += 8; // Extra space before total

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Amount:`, totalLabelX, y, { align: 'right' });
  doc.text(`₹${invoice.grandTotal.toFixed(2)}`, totalValueX, y, { align: 'right' });
  doc.setFont(undefined, 'normal');
  y += 10;

  // doc.setFontSize(10);
  // doc.text(`Payment Status:`, 10, y);
  // doc.setFont(undefined, 'bold');
  // doc.text(`${invoice.status.toUpperCase()}`, 50, y);
  // doc.setFont(undefined, 'normal');
  // y += 6;

  // if (invoice.paidAmount) {
  //   doc.text(`Paid Amount:`, 10, y);
  //   doc.setFont(undefined, 'bold');
  //   doc.text(`₹${invoice.paidAmount.toFixed(2)}`, 50, y);
  //   doc.setFont(undefined, 'normal');
  //   y += 6;
  // }
  // --- AMOUNT IN WORDS ---
  y += 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Amount in Words:', 40, y);
  doc.setFont('courier', 'italic');
  const words = doc.splitTextToSize(amountInWords(invoice.grandTotal), pageWidth - 80);
  doc.text(words, 40, y + 16);
// --- TRANSPORT DETAILS (BOXED) ---
  y += words.length * 12 + 24;
  doc.setDrawColor(180);
  doc.setLineWidth(0.5);
  doc.rect(40, y, pageWidth - 80, 60, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Transport Details:', 50, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Company: ${invoice.transport_company || 'N/A'}`, 50, y + 30);
  doc.text(`Truck Number: ${invoice.truck_number || 'N/A'}`, 200, y + 30);
  doc.text(`Driver Contact: ${invoice.driver_contact || 'N/A'}`, 400, y + 30);

  // --- FOOTER (THANK YOU) ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });

  // --- Footer (optional: add company details or thank you message) ---
  // You might want to add a footer here, e.g., "Thank you for your business!"
  // doc.setFontSize(10);
  // doc.setTextColor(150, 150, 150);
  // doc.text("Thank you for your business!", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });

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
