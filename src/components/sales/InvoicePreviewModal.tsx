
import React from 'react';
import { X, Calendar, Receipt, Package, Truck, FileText } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invoice {
  id: string;
  date: string;
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'partial';
  items: any[];
  customerName?: string;
  gst_amount?: number;
  transport_charges?: number;
  subtotal?: number;
  delivery_notes?: string;
  transport_company?: string;
  truck_number?: string;
  driver_contact?: string;
}

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  if (!invoice) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-400/10';
      case 'unpaid':
        return 'text-red-400 bg-red-400/10';
      case 'partial':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-muted-foreground bg-muted/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Invoice Preview</h2>
                <p className="text-sm text-muted-foreground">Invoice ID: {invoice.id}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{formatDate(invoice.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                {invoice.customerName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer:</span>
                    <span className="text-sm font-medium">{invoice.customerName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Amount Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="text-sm font-medium">₹{(invoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">GST:</span>
                  <span className="text-sm font-medium">₹{(invoice.gst_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transport:</span>
                  <span className="text-sm font-medium">₹{(invoice.transport_charges || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-sm font-bold text-primary">₹{invoice.grandTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                Items ({invoice.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} × ₹{item.rate?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="font-semibold text-foreground">
                      ₹{(item.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transport Details */}
          {(invoice.transport_company || invoice.truck_number || invoice.driver_contact) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Transport Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.transport_company && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Company:</span>
                    <span className="text-sm font-medium">{invoice.transport_company}</span>
                  </div>
                )}
                {invoice.truck_number && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Truck Number:</span>
                    <span className="text-sm font-medium">{invoice.truck_number}</span>
                  </div>
                )}
                {invoice.driver_contact && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Driver Contact:</span>
                    <span className="text-sm font-medium">{invoice.driver_contact}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Notes */}
          {invoice.delivery_notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Delivery Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{invoice.delivery_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
