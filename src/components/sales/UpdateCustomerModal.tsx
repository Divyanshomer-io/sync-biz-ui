
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, useUpdateCustomer } from '@/hooks/useCustomers';

interface UpdateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const UpdateCustomerModal: React.FC<UpdateCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    contact: customer?.contact || '',
    email: customer?.email || '',
    address: customer?.address || '',
    gst_number: customer?.gst_number || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateCustomer } = useCustomers();

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        contact: customer.contact || '',
        email: customer.email || '',
        address: customer.address || '',
        gst_number: customer.gst_number || '',
      });
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !customer) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCustomer(customer.id, {
        name: formData.name,
        contact: formData.contact || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        gst_number: formData.gst_number || undefined,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        contact: customer.contact || '',
        email: customer.email || '',
        address: customer.address || '',
        gst_number: customer.gst_number || '',
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold">Edit Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Customer Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full"
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-sm font-medium">
              Contact Number
            </Label>
            <Input
              id="contact"
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Enter contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number" className="text-sm font-medium">
              GSTIN
            </Label>
            <Input
              id="gst_number"
              name="gst_number"
              type="text"
              value={formData.gst_number}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Enter GSTIN number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full min-h-[80px] resize-none"
              placeholder="Enter customer address"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim()}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Updating...' : 'Update Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCustomerModal;
