
import React, { useState } from 'react';
import { CreditCard, Calendar, Banknote } from 'lucide-react';
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
import { usePayments } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onPaymentAdded?: (payment: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  customer,
  onPaymentAdded
}) => {
  const { toast } = useToast();
  const { createPayment } = usePayments();
  const { refetch: refetchCustomers } = useCustomers();
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'card', label: 'Card' }
  ];

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    if (!customer) {
      toast({
        title: "Error",
        description: "No customer selected",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create payment in backend
      await createPayment({
        customerId: customer.id,
        amount: Number(amount),
        paymentMode,
        date,
        notes
      });

      // Refetch customer data to get updated totals
      await refetchCustomers();

      toast({
        title: "Success",
        description: `Payment of ₹${Number(amount).toLocaleString()} added successfully!`
      });

      if (onPaymentAdded) {
        onPaymentAdded({
          customerId: customer.id,
          amount: Number(amount),
          paymentMode,
          date,
          notes
        });
      }

      // Reset form
      setAmount('');
      setPaymentMode('cash');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');

      onClose();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          {customer && (
            <div className="bg-card/40 rounded-lg p-3">
              <div className="font-medium text-foreground">{customer.name}</div>
              <div className="text-sm text-muted-foreground">
                Pending: ₹{(customer.pending || 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Sales: ₹{(customer.totalSales || 0).toLocaleString()}
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label className="text-sm">Amount *</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg mt-1 w-full"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Mode */}
          <div>
            <Label className="text-sm">Payment Mode</Label>
            <select
              className="w-full h-10 px-3 mt-1 rounded-md border border-input bg-background text-sm"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              disabled={isSubmitting}
            >
              {paymentModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <Label className="text-sm">Payment Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm">Notes (Optional)</Label>
            <textarea
              className="w-full h-16 px-3 py-2 mt-1 rounded-md border border-input bg-background text-sm resize-none"
              placeholder="Payment reference or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Quick Amount Buttons */}
          {customer && customer.pending > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Quick Amount</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((customer.pending / 2).toString())}
                  disabled={isSubmitting}
                  className="flex-1 text-xs"
                >
                  Half (₹{(customer.pending / 2).toLocaleString()})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(customer.pending.toString())}
                  disabled={isSubmitting}
                  className="flex-1 text-xs"
                >
                  Full (₹{customer.pending.toLocaleString()})
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!amount || Number(amount) <= 0 || isSubmitting}
            >
              <Banknote className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
