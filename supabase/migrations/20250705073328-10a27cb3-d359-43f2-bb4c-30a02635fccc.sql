
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  preferred_unit TEXT DEFAULT 'kg',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  rate_per_unit NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  gst_percentage NUMERIC DEFAULT 18,
  gst_amount NUMERIC NOT NULL,
  transport_company TEXT,
  truck_number TEXT,
  driver_contact TEXT,
  transport_charges NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  delivery_notes TEXT,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE NULL,
  amount_paid NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'cash',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a business app without user auth)
-- You can modify these later if you implement user authentication
CREATE POLICY "Enable all operations for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_sales_invoice_date ON public.sales(invoice_date);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);

-- Enable realtime for all tables
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
