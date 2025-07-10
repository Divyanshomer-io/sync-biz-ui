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

  const downloadInvoiceAsPDF = (invoice: Invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;

  // --- Header: Company Info & Invoice Title ---
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", pageWidth - 20, 20, { align: "right" });

  if (profile) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(profile.organization_name, 10, 20);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    let y = 26;
    if (profile.address) {
      doc.text(profile.address, 10, y); y += 5;
    }
    if (profile.phone) {
      doc.text(`Phone: ${profile.phone}`, 10, y); y += 5;
    }
    if (profile.gst_number) {
      doc.text(`GST: ${profile.gst_number}`, 10, y); y += 5;
    }
  }

  // --- To and Ship To ---
  doc.setFont(undefined, "bold");
  doc.text("TO:", 10, 50);
  doc.text("SHIP TO:", centerX, 50);

  doc.setFont(undefined, "normal");
  doc.text(invoice.customerName || 'N/A', 10, 55);
  doc.text(invoice.customerCompany || 'N/A', 10, 60);
  doc.text(invoice.customerAddress || 'N/A', 10, 65);

  doc.text(invoice.shipToName || 'N/A', centerX, 55);
  doc.text(invoice.shipToCompany || 'N/A', centerX, 60);
  doc.text(invoice.shipToAddress || 'N/A', centerX, 65);

  // --- Invoice Meta ---
  doc.text("Invoice #:", 10, 80);
  doc.text(`${invoice.id}`, 40, 80);
  doc.text("Date:", 10, 85);
  doc.text(`${new Date(invoice.date).toLocaleDateString('en-IN')}`, 40, 85);
  doc.text("Terms:", 10, 90);
  doc.text("Due on receipt", 40, 90);

  // --- Comments / Instructions ---
  doc.setFont(undefined, "bold");
  doc.text("COMMENTS OR SPECIAL INSTRUCTIONS:", 10, 100);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.text("You may add special notes or terms here if needed.", 10, 105);

  // --- Items Table ---
  const tableColumn = ["QUANTITY", "DESCRIPTION", "UNIT PRICE", "TOTAL"];
  const tableRows: any = [];

  invoice.items.forEach((item) => {
    tableRows.push([
      item.quantity.toString(),
      item.name,
      `₹${item.rate.toFixed(2)}`,
      `₹${item.amount.toFixed(2)}`
    ]);
  });

  autoTable(doc, {
    startY: 115,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 0,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 25 },
      1: { halign: "left", cellWidth: 80 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    didDrawPage: function (data) {
      let y = data.cursor.y + 10;

      // --- Totals ---
      const labelX = pageWidth - 70;
      const valueX = pageWidth - 15;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      doc.text("SUBTOTAL:", labelX, y, { align: "right" });
      doc.text(`₹${invoice.subtotal.toFixed(2)}`, valueX, y, { align: "right" }); y += 6;

      doc.text("GST:", labelX, y, { align: "right" });
      doc.text(`₹${invoice.gst_amount.toFixed(2)}`, valueX, y, { align: "right" }); y += 6;

      doc.text("TRANSPORT:", labelX, y, { align: "right" });
      doc.text(`₹${invoice.transport_charges.toFixed(2)}`, valueX, y, { align: "right" }); y += 8;

      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text("TOTAL DUE:", labelX, y, { align: "right" });
      doc.text(`₹${invoice.grandTotal.toFixed(2)}`, valueX, y, { align: "right" }); y += 10;

      // --- Payment Info ---
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      doc.text(`Payment Status: ${invoice.status.toUpperCase()}`, 10, y); y += 6;

      if (invoice.paidAmount) {
        doc.text(`Paid Amount: ₹${invoice.paidAmount.toFixed(2)}`, 10, y); y += 6;
      }

      // --- Footer ---
      y += 10;
      doc.setFont(undefined, "bold");
      doc.text("THANK YOU FOR YOUR BUSINESS!", centerX, y, { align: "center" });

      y += 6;
      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      doc.text("If you have questions, contact us via phone or email.", centerX, y, { align: "center" });
    },
  });

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
