
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SaleItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Sale {
  id: string;
  customer_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  transport_company?: string;
  truck_number?: string;
  driver_contact?: string;
  transport_charges: number;
  total_amount: number;
  delivery_notes?: string;
  invoice_date: string;
  created_at: string;
}

export interface CreateSaleData {
  customerId: string;
  items: SaleItem[];
  gstRate: number;
  transportCharges: number;
  transportDetails: {
    companyName: string;
    truckNumber: string;
    driverContact: string;
  };
  notes: string;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSale = async (saleData: CreateSaleData) => {
    try {
      // For now, we'll create individual sales records for each item
      // In a real-world scenario, you might want to create a separate invoices table
      const salesPromises = saleData.items.map(async (item) => {
        const { data, error } = await supabase
          .from('sales')
          .insert([{
            customer_id: saleData.customerId,
            item_name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            rate_per_unit: item.rate,
            subtotal: item.amount,
            gst_percentage: saleData.gstRate,
            gst_amount: (item.amount * saleData.gstRate) / 100,
            transport_company: saleData.transportDetails.companyName || null,
            truck_number: saleData.transportDetails.truckNumber || null,
            driver_contact: saleData.transportDetails.driverContact || null,
            transport_charges: saleData.transportCharges / saleData.items.length, // Distribute transport charges
            total_amount: item.amount + (item.amount * saleData.gstRate) / 100 + (saleData.transportCharges / saleData.items.length),
            delivery_notes: saleData.notes || null
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      const newSales = await Promise.all(salesPromises);
      setSales(prev => [...newSales, ...prev]);
      return newSales;
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "Error",
        description: "Failed to create sale",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getSalesByCustomer = (customerId: string) => {
    return sales.filter(sale => sale.customer_id === customerId);
  };

  useEffect(() => {
    fetchSales();

    // Set up real-time subscription
    const subscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales'
      }, () => {
        fetchSales();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    sales,
    isLoading,
    createSale,
    getSalesByCustomer,
    refetch: fetchSales
  };
};
