import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  FileText,
  Edit,
  IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useInvoices, type Invoice } from '@/hooks/useInvoices';
import { formatIndianCurrency, formatIndianDate, convertAmountToWords, generateEwayBillJSON } from '@/lib/invoiceUtils';
import InvoicePreviewModal from './InvoicePreviewModal';

interface InvoiceListEnhancedProps {
  customerId?: string;
  showHeader?: boolean;
  title?: string;
}

const InvoiceListEnhanced: React.FC<InvoiceListEnhancedProps> = ({ 
  customerId, 
  showHeader = true,
  title = "Invoices"
}) => {
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const { profile } = useAuth();
  const { invoices, deleteInvoice } = useInvoices();

  // Filter invoices by customer if customerId is provided
  const displayInvoices = customerId 
    ? invoices.filter(invoice => invoice.customer_id === customerId)
    : invoices;

  const downloadInvoiceAsPDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors
    const primaryColor: [number, number, number] = [41, 128, 185]; // Professional blue
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
    const lightGray: [number, number, number] = [236, 240, 241];
    
    // Header with company details
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
    
    // Company information box
    let yPos = 50;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(10, yPos, pageWidth - 20, 40, 'F');
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(profile?.organization_name || 'Your Company', 15, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 15;
    
    if ((profile as any)?.address) {
      doc.text(`Address: ${(profile as any).address}`, 15, yPos);
      yPos += 5;
    }
    
    if (profile?.phone) {
      doc.text(`Phone: ${profile.phone}`, 15, yPos);
      yPos += 5;
    }
    
    if (profile?.gst_number) {
      doc.text(`GST Number: ${profile.gst_number}`, 15, yPos);
    }
    
    // Invoice details section
    yPos = 100;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    // Invoice number and date
    doc.text(`Invoice Number: ${invoice.id}`, 15, yPos);
    doc.text(`Date: ${formatIndianDate(invoice.invoice_date)}`, pageWidth - 70, yPos);
    yPos += 8;
    
    // Bill to section
    doc.text('Bill To:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customer?.name || 'N/A', 15, yPos);
    yPos += 5;
    
    if (invoice.customer?.address) {
      const addressLines = doc.splitTextToSize(invoice.customer.address, pageWidth - 30);
      doc.text(addressLines, 15, yPos);
      yPos += addressLines.length * 5;
    }
    
    if (invoice.customer?.contact) {
      doc.text(`Phone: ${invoice.customer.contact}`, 15, yPos);
      yPos += 5;
    }
    
    if (invoice.customer?.gst_number) {
      doc.text(`GST Number: ${invoice.customer.gst_number}`, 15, yPos);
      yPos += 5;
    }
    
    yPos += 10;
    
    // Items table
    const tableHeaders = ['S.No.', 'Item Description', 'Qty', 'Unit', 'Rate (₹)', 'Amount (₹)'];
    const tableData = invoice.items?.map((item, index) => [
      (index + 1).toString(),
      item.item_name,
      item.quantity.toString(),
      item.unit,
      formatIndianCurrency(item.rate_per_unit).replace('₹', ''),
      formatIndianCurrency(item.amount).replace('₹', '')
    ]) || [];
    
    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60, halign: 'left' },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 35, halign: 'right' }
      },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y + 10;
      }
    });
    
    // Summary section
    const summaryStartX = pageWidth - 80;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    doc.text('Subtotal:', summaryStartX - 30, yPos);
    doc.text(formatIndianCurrency(invoice.subtotal), summaryStartX, yPos, { align: 'right' });
    yPos += 6;
    
    doc.text(`GST (${invoice.gst_percentage}%):`, summaryStartX - 30, yPos);
    doc.text(formatIndianCurrency(invoice.gst_amount), summaryStartX, yPos, { align: 'right' });
    yPos += 6;
    
    if (invoice.transport_charges > 0) {
      doc.text('Transport Charges:', summaryStartX - 30, yPos);
      doc.text(formatIndianCurrency(invoice.transport_charges), summaryStartX, yPos, { align: 'right' });
      yPos += 6;
    }
    
    // Total with border
    doc.setLineWidth(0.5);
    doc.line(summaryStartX - 35, yPos - 2, summaryStartX + 5, yPos - 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', summaryStartX - 30, yPos + 5);
    doc.text(formatIndianCurrency(invoice.total_amount), summaryStartX, yPos + 5, { align: 'right' });
    
    yPos += 15;
    
    // Amount in words
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Amount in Words:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const amountWords = convertAmountToWords(invoice.total_amount);
    const wordsLines = doc.splitTextToSize(amountWords, pageWidth - 30);
    doc.text(wordsLines, 15, yPos);
    yPos += wordsLines.length * 5 + 10;
    
    // Transport details
    if (invoice.transport_company || invoice.truck_number || invoice.driver_contact) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Transport Details:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      if (invoice.transport_company) {
        doc.text(`Company: ${invoice.transport_company}`, 15, yPos);
        yPos += 5;
      }
      if (invoice.truck_number) {
        doc.text(`Vehicle Number: ${invoice.truck_number}`, 15, yPos);
        yPos += 5;
      }
      if (invoice.driver_contact) {
        doc.text(`Driver Contact: ${invoice.driver_contact}`, 15, yPos);
        yPos += 5;
      }
      yPos += 5;
    }
    
    // Notes
    if (invoice.delivery_notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Notes:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const notesLines = doc.splitTextToSize(invoice.delivery_notes, pageWidth - 30);
      doc.text(notesLines, 15, yPos);
      yPos += notesLines.length * 5 + 10;
    }
    
    // Payment status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Payment Status:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.status.toUpperCase(), 80, yPos);
    
    if (invoice.status === 'partial' && invoice.paid_amount > 0) {
      yPos += 6;
      doc.text(`Paid Amount: ${formatIndianCurrency(invoice.paid_amount)}`, 15, yPos);
      doc.text(`Balance: ${formatIndianCurrency(invoice.total_amount - invoice.paid_amount)}`, 80, yPos);
    }
    
    // Footer
    if (yPos < pageHeight - 30) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    }
    
    doc.save(`invoice-${invoice.id}.pdf`);
  };

  const downloadEwayBillJSON = (invoice: Invoice) => {
    const ewayBillData = generateEwayBillJSON(invoice, invoice.customer, profile);
    const dataStr = JSON.stringify(ewayBillData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `eway-bill-${invoice.id}.json`);
    linkElement.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unpaid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-500" />;
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

  const handlePreviewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      await deleteInvoice(invoiceId);
    }
  };

  return (
    <>
      <Card className="glass-card">
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {title} ({displayInvoices.length})
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {displayInvoices.length > 0 ? (
            <div className="space-y-3">
              {displayInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="activity-item relative bg-card/20 border border-border/50 rounded-lg p-4 hover:bg-card/30 transition-colors"
                >
                  {/* Actions dropdown */}
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/20">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg">
                        <DropdownMenuItem 
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => downloadInvoiceAsPDF(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => downloadEwayBillJSON(invoice)}
                          className="cursor-pointer hover:bg-muted/20"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download E-way Bill
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="cursor-pointer hover:bg-destructive/20 text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-12">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(invoice.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          Invoice #{invoice.id}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatIndianDate(invoice.invoice_date)}
                          {invoice.customer && (
                            <>
                              <span>•</span>
                              <span>{invoice.customer.name}</span>
                            </>
                          )}
                        </div>
                        {invoice.items && invoice.items.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {invoice.items.length === 1 
                              ? invoice.items[0].item_name
                              : `${invoice.items[0].item_name} +${invoice.items.length - 1} more items`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {formatIndianCurrency(invoice.total_amount).replace('₹', '')}
                        </div>
                        {invoice.status === 'partial' && invoice.paid_amount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Paid: {formatIndianCurrency(invoice.paid_amount)}
                          </div>
                        )}
                      </div>
                      
                      <Badge className={`${getStatusColor(invoice.status)} whitespace-nowrap`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
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

export default InvoiceListEnhanced;
