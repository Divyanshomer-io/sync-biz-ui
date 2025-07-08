
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabaseClient';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePurchase } from '@/hooks/usePurchases';
import { useCreatePaymentMade } from '@/hooks/usePaymentsMade';
import { Vendor } from '@/hooks/useVendors';

const createPurchaseSchema = z.object({
  item: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  rate: z.number().min(0.001, 'Rate must be greater than 0'),
  status: z.enum(['Paid', 'Unpaid']),
  date: z.string(),
});

type CreatePurchaseForm = z.infer<typeof createPurchaseSchema>;

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
}

const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPurchase = useCreatePurchase();
  const createPayment = useCreatePaymentMade();

  const form = useForm<CreatePurchaseForm>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      item: '',
      quantity: 0,
      rate: 0,
      status: 'Unpaid',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: CreatePurchaseForm) => {
    setIsSubmitting(true);
    try {
  const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error("User not authenticated");
      // Create the purchase
      await createPurchase.mutateAsync({
        user_id: user.id,
        vendor_id: vendor.id,
        item: data.item,
        quantity: data.quantity,
        rate: data.rate,
        status: data.status,
        date: data.date,
      });

      // If status is "Paid", automatically create payment
      if (data.status === 'Paid') {
        const totalAmount = data.quantity * data.rate;
        await createPayment.mutateAsync({
           user_id: user.id,
          vendor_id: vendor.id,
          amount: totalAmount,
          mode: 'Auto-Paid',
          date: data.date,
        });
      }

      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating purchase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Purchase - {vendor.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                {isSubmitting ? 'Creating...' : 'Create Purchase'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseModal;
