
import React, { useState } from 'react';
import { User, Phone, MapPin, FileText, Package } from 'lucide-react';
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
import { useCustomers } from '@/hooks/useCustomers';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated
}) => {
  const { toast } = useToast();
  const { createCustomer } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    unitPreference: 'kg',
    notes: ''
  });

  const units = ['kg', 'pieces', 'litres', 'meters', 'tons', 'boxes', 'hours'];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCustomer(formData);
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        unitPreference: 'kg',
        notes: ''
      });

      onCustomerCreated();
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Create New Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <Label className="text-sm font-medium">Customer Name *</Label>
            <Input
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Contact Number */}
          <div>
            <Label className="text-sm font-medium">Contact Number</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-medium">Address</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                className="w-full h-16 px-10 py-2 rounded-md border border-input bg-background text-sm resize-none"
                placeholder="Enter customer address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* GSTIN */}
          <div>
            <Label className="text-sm font-medium">GST Number</Label>
            <div className="relative mt-1">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="07ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Preferred Unit */}
          <div>
            <Label className="text-sm font-medium">Preferred Unit</Label>
            <div className="relative mt-1">
              <Package className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <select
                className="w-full h-10 px-10 rounded-md border border-input bg-background text-sm"
                value={formData.unitPreference}
                onChange={(e) => setFormData({ ...formData, unitPreference: e.target.value })}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium">Notes</Label>
            <textarea
              className="w-full h-16 px-3 py-2 mt-1 rounded-md border border-input bg-background text-sm resize-none"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerModal;
