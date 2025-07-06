
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMade {
  id: string;
  vendor_id: string;
  amount: number;
  mode: string;
  date: string;
  created_at: string;
  vendor?: {
    name: string;
  };
}

export const usePaymentsMade = () => {
  return useQuery({
    queryKey: ['payments-made'],
    queryFn: async () => {
      console.log('Fetching payments made...');
      
      const { data, error } = await supabase
        .from('payments_made')
        .select(`
          *,
          vendors(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments made:', error);
        throw error;
      }

      console.log('Payments made fetched:', data);
      return data;
    },
  });
};

export const useVendorPayments = (vendorId: string) => {
  return useQuery({
    queryKey: ['payments-made', vendorId],
    queryFn: async () => {
      console.log('Fetching payments for vendor:', vendorId);
      
      const { data, error } = await supabase
        .from('payments_made')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor payments:', error);
        throw error;
      }

      return data;
    },
    enabled: !!vendorId,
  });
};

export const useCreatePaymentMade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: Omit<PaymentMade, 'id' | 'created_at'>) => {
      console.log('Creating payment made:', paymentData);
      
      const { data, error } = await supabase
        .from('payments_made')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating payment made:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-made'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      console.error('Error creating payment made:', error);
      toast.error('Failed to record payment');
    },
  });
};
