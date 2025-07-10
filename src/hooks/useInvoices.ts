import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface InvoiceItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  user_id: string;
  invoice_date: string;
  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  transport_charges: number;
  total_amount: number;
  transport_company?: string;
  truck_number?: string;
  driver_contact?: string;
  delivery_notes?: string;
  status: string;
  paid_amount: number;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  customer?: {
    name: string;
    address?: string;
    contact?: string;
    email?: string;
    gst_number?: string;
  };
}

export interface CreateInvoiceData {
  customerId: string;
  items: InvoiceItem[];
  gstRate: number;
  transportCharges: number;
  transportDetails: {
    companyName: string;
    truckNumber: string;
    driverContact: string;
  };
  notes: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch invoices with customer data
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey (
            name,
            address,
            contact,
            email,
            gst_number
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch invoice items for each invoice
      const invoicesWithItems = await Promise.all(
        (invoicesData || []).map(async (invoice) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id)
            .order('created_at', { ascending: true });

          if (itemsError) {
            console.error('Error fetching invoice items:', itemsError);
            return { ...invoice, items: [] };
          }

          return {
            ...invoice,
            items: itemsData || [],
            customer: invoice.customers
          };
        })
      );

      setInvoices(invoicesWithItems);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
      const gstAmount = (subtotal * invoiceData.gstRate) / 100;
      const totalAmount = subtotal + gstAmount + invoiceData.transportCharges;

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          customer_id: invoiceData.customerId,
          user_id: user.id,
          subtotal,
          gst_percentage: invoiceData.gstRate,
          gst_amount: gstAmount,
          transport_charges: invoiceData.transportCharges,
          total_amount: totalAmount,
          transport_company: invoiceData.transportDetails.companyName || null,
          truck_number: invoiceData.transportDetails.truckNumber || null,
          driver_contact: invoiceData.transportDetails.driverContact || null,
          delivery_notes: invoiceData.notes || null,
          status: 'unpaid',
          paid_amount: 0
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        rate_per_unit: item.rate_per_unit,
        amount: item.amount
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Fetch the complete invoice with items and customer data
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey (
            name,
            address,
            contact,
            email,
            gst_number
          )
        `)
        .eq('id', invoice.id)
        .single();

      if (fetchError) throw fetchError;

      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      const newInvoice = {
        ...completeInvoice,
        items: items || [],
        customer: completeInvoice.customers
      };

      setInvoices(prev => [newInvoice, ...prev]);
      
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, ...updates }
            : invoice
        )
      );

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      // Delete invoice items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      // Delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getInvoicesByCustomer = (customerId: string) => {
    return invoices.filter(invoice => invoice.customer_id === customerId);
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();

      // Set up real-time subscription
      const subscription = supabase
        .channel('invoices-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'invoices'
        }, () => {
          fetchInvoices();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'invoice_items'
        }, () => {
          fetchInvoices();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByCustomer,
    refetch: fetchInvoices
  };
};