
import React, { useState } from 'react';
import { X, Plus, Minus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, unit: 'kg', rate: 0, amount: 0 }
  ]);
  const [gstRate, setGstRate] = useState(18);
  const [transportCharges, setTransportCharges] = useState(0);
  const [notes, setNotes] = useState('');

  const units = ['kg', 'pieces', 'litres', 'meters', 'tons', 'boxes'];

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unit: 'kg',
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
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
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount + transportCharges;

  const handleSubmit = () => {
    // Handle form submission
    console.log('Creating sale:', {
      customer,
      items,
      subtotal,
      gstAmount,
      transportCharges,
      grandTotal,
      notes
    });
    onClose();
  };

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
          {/* Customer Info */}
          {customer && (
            <div className="bg-card/40 rounded-lg p-4">
              <div className="font-medium text-foreground">{customer.name}</div>
              <div className="text-sm text-muted-foreground">{customer.email}</div>
            </div>
          )}

          {/* Items */}
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

            {items.map((item) => (
              <div key={item.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Item {items.indexOf(item) + 1}</Label>
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
                    <Label className="text-sm">Product/Service</Label>
                    <Input
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    />
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
                    <Label className="text-sm">Rate per {item.unit}</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="bg-muted/20 rounded p-2 text-right">
                  <span className="text-sm text-muted-foreground">Amount: </span>
                  <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
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
