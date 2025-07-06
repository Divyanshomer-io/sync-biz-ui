
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vendor {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  gstin?: string;
  created_at: string;
  totalPurchases?: number;
  totalPaid?: number;
  pending?: number;
}

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      console.log('Fetching vendors...');
      
      // Fetch vendors with aggregated data
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
        throw vendorsError;
      }

      // For each vendor, calculate totals
      const vendorsWithTotals = await Promise.all(
        vendors.map(async (vendor) => {
          // Get total purchases
          const { data: purchases } = await supabase
            .from('purchases')
            .select('total_amount')
            .eq('vendor_id', vendor.id);

          // Get total payments made
          const { data: payments } = await supabase
            .from('payments_made')
            .select('amount')
            .eq('vendor_id', vendor.id);

          const totalPurchases = purchases?.reduce((sum, purchase) => 
            sum + Number(purchase.total_amount || 0), 0) || 0;
          
          const totalPaid = payments?.reduce((sum, payment) => 
            sum + Number(payment.amount || 0), 0) || 0;

          return {
            ...vendor,
            totalPurchases,
            totalPaid,
            pending: totalPurchases - totalPaid
          };
        })
      );

      console.log('Vendors with totals:', vendorsWithTotals);
      return vendorsWithTotals;
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendorData: Omit<Vendor, 'id' | 'created_at'>) => {
      console.log('Creating vendor:', vendorData);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendorData)
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor');
    },
  });
};
