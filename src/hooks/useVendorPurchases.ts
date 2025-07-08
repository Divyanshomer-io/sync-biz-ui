
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Purchase } from './usePurchases';

export const useVendorPurchases = (vendorId: string) => {
  return useQuery({
    queryKey: ['purchases', vendorId],
    queryFn: async (): Promise<Purchase[]> => {
      console.log('Fetching purchases for vendor:', vendorId);
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('vendor_id', vendorId)
         .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor purchases:', error);
        throw error;
      }

      // Ensure status is properly typed
      return data.map(purchase => ({
        ...purchase,
        status: purchase.status as 'Paid' | 'Unpaid'
      }));
    },
    enabled: !!vendorId,
  });
};
