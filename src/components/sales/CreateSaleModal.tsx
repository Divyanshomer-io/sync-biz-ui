
import React, { useState } from 'react';
import { X, Plus, Minus, Calculator, User, Edit, Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onInvoiceCreated?: (invoice: any) => void;
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  isOpen,
  onClose,
  customer,
  onInvoiceCreated
}) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, unit: 'kg', rate: 0, amount: 0 }
  ]);
  const [gstRate, setGstRate] = useState(18);
  const [transportCharges, setTransportCharges] = useState(0);
  const [transportDetails, setTransportDetails] = useState({
    companyName: '',
    truckNumber: '',
    driverContact: ''
  });
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const units = ['kg', 'pieces', 'litres', 'meters', 'tons', 'boxes'];

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unit: customer?.unitPreference || 'kg',
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
    
    // Clear errors for this field
    if (errors[`item-${id}-${field}`]) {
      setErrors(prev => ({ ...prev, [`item-${id}-${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item-${item.id}-name`] = 'Product name is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item-${item.id}-quantity`] = 'Quantity must be greater than 0';
      }
      if (item.rate <= 0) {
        newErrors[`item-${item.id}-rate`] = 'Rate must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount + transportCharges;

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV/${year}/${month}/${random}`;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    const invoice = {
      id: generateInvoiceNumber(),
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString().split('T')[0],
      items: items,
      subtotal,
      gstRate,
      gstAmount,
      transportCharges,
      transportDetails,
      grandTotal,
      notes,
      status: 'unpaid',
      createdAt: new Date().toISOString()
    };

    console.log('Creating invoice:', invoice);
    
    if (onInvoiceCreated) {
      onInvoiceCreated(invoice);
    }

    toast({
      title: "Success",
      description: `Invoice ${invoice.id} created successfully!`
    });

    onClose();
  };

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="bg-card/40 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-foreground">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">#{generateInvoiceNumber()}</p>
                  <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <p className="text-xs text-muted-foreground">{customer.address}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Item</th>
                    <th className="text-right p-3 text-sm font-medium">Qty</th>
                    <th className="text-right p-3 text-sm font-medium">Rate</th>
                    <th className="text-right p-3 text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-t border-border/50">
                      <td className="p-3 text-sm">{item.name}</td>
                      <td className="p-3 text-sm text-right">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-sm text-right">₹{item.rate}</td>
                      <td className="p-3 text-sm text-right">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-card/40 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST ({gstRate}%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              {transportCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Transport:</span>
                  <span>₹{transportCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border/50 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Sale
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info Recap */}
          {customer && (
            <div className="bg-card/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                    <div className="text-xs text-muted-foreground">{customer.address}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Info
                </Button>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Item {index + 1}</Label>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Product/Service *</Label>
                    <Input
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className={errors[`item-${item.id}-name`] ? 'border-red-500' : ''}
                    />
                    {errors[`item-${item.id}-name`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`item-${item.id}-name`]}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Quantity *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className={errors[`item-${item.id}-quantity`] ? 'border-red-500' : ''}
                    />
                    {errors[`item-${item.id}-quantity`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`item-${item.id}-quantity`]}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm">Unit</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm">Rate per {item.unit} *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      className={errors[`item-${item.id}-rate`] ? 'border-red-500' : ''}
                    />
                    {errors[`item-${item.id}-rate`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`item-${item.id}-rate`]}</p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/20 rounded p-2 text-right">
                  <span className="text-sm text-muted-foreground">Amount: </span>
                  <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Transport Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <Label className="text-base font-semibold">Transport Information</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Transport Company</Label>
                <Input
                  placeholder="Transport company name"
                  value={transportDetails.companyName}
                  onChange={(e) => setTransportDetails({
                    ...transportDetails,
                    companyName: e.target.value
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Truck Number</Label>
                <Input
                  placeholder="MH 01 AB 1234"
                  value={transportDetails.truckNumber}
                  onChange={(e) => setTransportDetails({
                    ...transportDetails,
                    truckNumber: e.target.value
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Driver Contact</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={transportDetails.driverContact}
                  onChange={(e) => setTransportDetails({
                    ...transportDetails,
                    driverContact: e.target.value
                  })}
                />
              </div>
              <div>
                <Label className="text-sm">Transport Charges</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transportCharges}
                  onChange={(e) => setTransportCharges(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Additional Charges */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Additional Charges</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">GST Rate (%)</Label>
                <Input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm">Delivery Notes</Label>
            <textarea
              className="w-full h-20 px-3 py-2 mt-1 rounded-md border border-input bg-background text-sm resize-none"
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Calculation Summary */}
          <div className="bg-card/40 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST ({gstRate}%):</span>
              <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transport:</span>
              <span className="font-medium">₹{transportCharges.toFixed(2)}</span>
            </div>
            <div className="border-t border-border/50 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="flex-1"
            >
              Preview
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSaleModal;
