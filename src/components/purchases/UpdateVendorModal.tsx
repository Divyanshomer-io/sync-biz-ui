
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateVendor } from '@/hooks/useVendors';
import { Vendor } from '@/hooks/useVendors';

const updateVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contact: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gstin: z.string().optional(),
  address: z.string().optional(),
});

type UpdateVendorForm = z.infer<typeof updateVendorSchema>;

interface UpdateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

const UpdateVendorModal: React.FC<UpdateVendorModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateVendor = useUpdateVendor();

  const form = useForm<UpdateVendorForm>({
    resolver: zodResolver(updateVendorSchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      gstin: '',
      address: '',
    },
  });

  useEffect(() => {
    if (vendor && isOpen) {
      form.reset({
        name: vendor.name || '',
        contact: vendor.contact || '',
        email: vendor.email || '',
        gstin: vendor.gstin || '',
        address: vendor.address || '',
      });
    }
  }, [vendor, isOpen, form]);

  const onSubmit = async (data: UpdateVendorForm) => {
    if (!vendor) return;
    
    setIsSubmitting(true);
    try {
      // Clean up empty string values
      const cleanData = {
        ...data,
        email: data.email || undefined,
        contact: data.contact || undefined,
        gstin: data.gstin || undefined,
        address: data.address || undefined,
      };

      await updateVendor.mutateAsync({ id: vendor.id, updates: cleanData });
      onClose();
    } catch (error) {
      console.error('Error updating vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Vendor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GSTIN number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Vendor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateVendorModal;
