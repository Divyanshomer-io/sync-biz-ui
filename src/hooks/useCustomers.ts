
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact?: string;
  address?: string;
  gst_number?: string;
  gstin?: string;
  preferred_unit: string;
  notes?: string;
  created_at: string;
  // Calculated fields
  totalSales?: number;
  totalPaid?: number;
  pending?: number;
  unitPreference?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate financial totals for each customer
      const customersWithTotals = await Promise.all(
        (data || []).map(async (customer) => {
          // Get sales total
          const { data: salesData } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('customer_id', customer.id);

          const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

          // Get payments total
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('amount_paid')
            .eq('customer_id', customer.id);

          const totalPaid = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount_paid), 0) || 0;

          return {
            ...customer,
            email: customer.email || `${customer.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            phone: customer.contact || '+91 98765 43210',
            contact: customer.contact || '+91 98765 43210',
            address: customer.address || 'Address not provided',
            gst_number: customer.gst_number || 'GSTIN not provided',
            gstin: customer.gst_number || 'GSTIN not provided',
            totalSales,
            totalPaid,
            pending: Math.max(0, totalSales - totalPaid),
            unitPreference: customer.preferred_unit || 'kg'
          };
        })
      );

      setCustomers(customersWithTotals);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
    unitPreference?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customerData.name,
          email: customerData.email || null,
          contact: customerData.phone || null,
          address: customerData.address || null,
          gst_number: customerData.gstin || null,
          preferred_unit: customerData.unitPreference || 'kg',
          notes: customerData.notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      const newCustomer = {
        ...data,
        email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: data.contact || '+91 98765 43210',
        contact: data.contact || '+91 98765 43210',
        address: data.address || 'Address not provided',
        gst_number: data.gst_number || 'GSTIN not provided',
        gstin: data.gst_number || 'GSTIN not provided',
        totalSales: 0,
        totalPaid: 0,
        pending: 0,
        unitPreference: data.preferred_unit
      };

      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCustomer = async (customerId: string, customerData: {
    name?: string;
    email?: string;
    contact?: string;
    address?: string;
    gst_number?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          email: customerData.email || null,
          contact: customerData.contact || null,
          address: customerData.address || null,
          gst_number: customerData.gst_number || null,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      // Update the local state
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId 
          ? { 
              ...customer, 
              ...data,
              phone: data.contact || customer.phone,
              contact: data.contact || customer.contact,
              gst_number: data.gst_number || customer.gst_number,
              gstin: data.gst_number || customer.gstin,
            }
          : customer
      ));

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      // Update the local state
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('customers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'customers'
      }, () => {
        fetchCustomers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};

// Export individual hooks for backward compatibility
export const useUpdateCustomer = () => {
  const { updateCustomer } = useCustomers();
  return { updateCustomer };
};

export const useDeleteCustomer = () => {
  const { deleteCustomer } = useCustomers();
  return { deleteCustomer };
};
