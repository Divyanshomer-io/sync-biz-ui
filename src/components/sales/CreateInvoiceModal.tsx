
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useInvoices, type CreateInvoiceData, type InvoiceItem } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: () => void;
  preSelectedCustomerId?: string;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
  preSelectedCustomerId
}) => {
  const [customerId, setCustomerId] = useState(preSelectedCustomerId || '');
  const [gstRate, setGstRate] = useState(18);
  const [transportCharges, setTransportCharges] = useState(0);
  const [transportDetails, setTransportDetails] = useState({
    companyName: '',
    truckNumber: '',
    driverContact: ''
  });
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { item_name: '', quantity: 1, unit: 'pcs', rate_per_unit: 0, amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const { createInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { toast } = useToast();

  const units = ['pcs', 'kg', 'gm', 'ltr', 'mtr', 'ft', 'box', 'bag', 'bottle', 'carton'];

  const calculateItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate_per_unit') {
      updatedItems[index].amount = calculateItemAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate_per_unit
      );
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 1, unit: 'pcs', rate_per_unit: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount + transportCharges;
    
    return { subtotal, gstAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    if (items.some(item => !item.item_name || item.quantity <= 0 || item.rate_per_unit < 0)) {
      toast({
        title: "Error",
        description: "Please fill in all item details correctly",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create ONE invoice with ALL items
      const invoiceData: CreateInvoiceData = {
        customerId,
        items, // All items in one invoice
        gstRate,
        transportCharges,
        transportDetails,
        notes
      };

      console.log('Creating invoice with data:', invoiceData);
      await createInvoice(invoiceData);
      
      onClose();
      resetForm();
      onInvoiceCreated?.();
    } catch (error) {
      console.error('Error creating invoice:', error);
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerId(preSelectedCustomerId || '');
    setGstRate(18);
    setTransportCharges(0);
    setTransportDetails({ companyName: '', truckNumber: '', driverContact: '' });
    setNotes('');
    setItems([{ item_name: '', quantity: 1, unit: 'pcs', rate_per_unit: 0, amount: 0 }]);
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Customer *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone || customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No customers found. Add a customer first.
              </p>
            )}
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Invoice Items</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Unit</Label>
                    <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      value={item.rate_per_unit}
                      onChange={(e) => updateItem(index, 'rate_per_unit', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* GST and Transport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>GST Rate (%)</Label>
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <Label>Transport Charges (₹)</Label>
              <Input
                type="number"
                value={transportCharges}
                onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Transport Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={transportDetails.companyName}
                  onChange={(e) => setTransportDetails(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Transport company name"
                />
              </div>
              <div>
                <Label>Truck Number</Label>
                <Input
                  value={transportDetails.truckNumber}
                  onChange={(e) => setTransportDetails(prev => ({ ...prev, truckNumber: e.target.value }))}
                  placeholder="Vehicle number"
                />
              </div>
              <div>
                <Label>Driver Contact</Label>
                <Input
                  value={transportDetails.driverContact}
                  onChange={(e) => setTransportDetails(prev => ({ ...prev, driverContact: e.target.value }))}
                  placeholder="Driver phone number"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Delivery Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gstRate}%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport Charges:</span>
                  <span>₹{transportCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceModal;
