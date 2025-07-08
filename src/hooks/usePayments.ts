
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Payment {
  id: string;
  customer_id: string;
  amount_paid: number;
  payment_mode: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface CreatePaymentData {
  customerId: string;
  amount: number;
  paymentMode: string;
  date: string;
  notes: string;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (paymentData: CreatePaymentData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          customer_id: paymentData.customerId,
          amount_paid: paymentData.amount,
          payment_mode: paymentData.paymentMode,
          payment_date: paymentData.date,
          notes: paymentData.notes || null,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to create payment",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getPaymentsByCustomer = (customerId: string) => {
    return payments.filter(payment => payment.customer_id === customerId);
  };

  useEffect(() => {
    if (user) {
      fetchPayments();

      // Set up real-time subscription
      const subscription = supabase
        .channel('payments-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'payments'
        }, () => {
          fetchPayments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
    };
    }
  }, [user]);

  return {
    payments,
    isLoading,
    createPayment,
    getPaymentsByCustomer,
    refetch: fetchPayments
  };
};
