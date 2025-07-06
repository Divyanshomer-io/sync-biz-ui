
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Purchase {
  id: string;
  vendor_id: string;
  item: string;
  quantity: number;
  rate: number;
  total_amount: number;
  status: 'Paid' | 'Unpaid';
  date: string;
  created_at: string;
  vendor?: {
    name: string;
  };
}

export const usePurchases = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      console.log('Fetching purchases...');
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          vendors(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Purchases fetched:', data);
      return data;
    },
  });
};

export const useVendorPurchases = (vendorId: string) => {
  return useQuery({
    queryKey: ['purchases', vendorId],
    queryFn: async () => {
      console.log('Fetching purchases for vendor:', vendorId);
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor purchases:', error);
        throw error;
      }

      return data;
    },
    enabled: !!vendorId,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData: Omit<Purchase, 'id' | 'created_at' | 'total_amount'>) => {
      console.log('Creating purchase:', purchaseData);
      
      const { data, error } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Purchase created successfully');
    },
    onError: (error) => {
      console.error('Error creating purchase:', error);
      toast.error('Failed to create purchase');
    },
  });
};
