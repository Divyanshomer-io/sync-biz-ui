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
  showHeader?: boolean;
  title?: string;
}

const SalesInvoiceList: React.FC<SalesInvoiceListProps> = ({ 
  customerId, 
  invoices = [],
  onDeleteInvoice,
  showHeader = true,
  title = "Sales Invoices"
}) => {
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const downloadInvoiceAsJSON = (invoice: Invoice) => {
    const dataStr = JSON.stringify(invoice, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `invoice-${invoice.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadInvoiceAsPDF = (invoice: Invoice) => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(50, 50, 50); // Darker grey for main title
  doc.text("INVOICE", doc.internal.pageSize.width / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Lighter grey for company info (optional)
  // You can add your company's name, address, and contact here
  // doc.text("Your Company Name", doc.internal.pageSize.width / 2, 28, { align: "center" });
  // doc.text("Your Company Address, City, Pincode", doc.internal.pageSize.width / 2, 34, { align: "center" });
  // doc.text("Phone: XXX-XXX-XXXX | Email: info@yourcompany.com", doc.internal.pageSize.width / 2, 40, { align: "center" });

  // Add a line separator
  doc.setDrawColor(200, 200, 200); // Light grey line
  doc.line(10, 45, doc.internal.pageSize.width - 10, 45); // x1, y1, x2, y2

  // --- Invoice and Customer Details ---
  let y = 55;
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

  (doc as any).autoTable({
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

  doc.setFontSize(10);
  doc.text(`Payment Status:`, 10, y);
  doc.setFont(undefined, 'bold');
  doc.text(`${invoice.status.toUpperCase()}`, 50, y);
  doc.setFont(undefined, 'normal');
  y += 6;

  if (invoice.paidAmount) {
    doc.text(`Paid Amount:`, 10, y);
    doc.setFont(undefined, 'bold');
    doc.text(`₹${invoice.paidAmount.toFixed(2)}`, 50, y);
    doc.setFont(undefined, 'normal');
    y += 6;
  }

  // --- Transport Details ---
  y += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("Transport Details:", 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;

  doc.setFontSize(10);
  doc.text(`Company: ${invoice.transport_company || 'N/A'}`, 10, y); y += 6;
  doc.text(`Truck Number: ${invoice.truck_number || 'N/A'}`, 10, y); y += 6;
  doc.text(`Driver Contact: ${invoice.driver_contact || 'N/A'}`, 10, y); y += 6;

  // --- Notes ---
  y += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("Notes:", 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.setFontSize(10);
  // Max width for notes to wrap text
  const splitNotes = doc.splitTextToSize(invoice.delivery_notes || 'N/A', doc.internal.pageSize.width - 20);
  doc.text(splitNotes, 10, y);


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
