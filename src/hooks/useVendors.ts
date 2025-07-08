
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching vendors...');
      
      // Fetch vendors with aggregated data
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
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
            .eq('vendor_id', vendor.id)
            .eq('user_id', user.id);

          // Get total payments made
          const { data: payments } = await supabase
            .from('payments_made')
            .select('amount')
            .eq('vendor_id', vendor.id)
            .eq('user_id', user.id);

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
    enabled: !!user,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'totalPurchases' | 'totalPaid' | 'pending'>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating vendor:', vendorData);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...vendorData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', user?.id] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor');
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vendor> }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating vendor:', id, updates);
      
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vendor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', user?.id] });
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Deleting vendor:', id);
      
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting vendor:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['payments-made'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    },
  });
};
