
-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact VARCHAR(15) CHECK (length(contact) >= 10),
  email TEXT,
  address TEXT,
  gstin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  rate NUMERIC(10,3) NOT NULL,
  total_amount NUMERIC(12,3) GENERATED ALWAYS AS (quantity * rate) STORED,
  status TEXT CHECK (status IN ('Paid', 'Unpaid')) DEFAULT 'Unpaid',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments_made table
CREATE TABLE IF NOT EXISTS public.payments_made (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount NUMERIC(12,3) NOT NULL,
  mode TEXT DEFAULT 'cash',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_made ENABLE ROW LEVEL SECURITY;

-- Create policies for vendors
CREATE POLICY "Enable all operations for vendors" ON public.vendors
FOR ALL USING (true) WITH CHECK (true);

-- Create policies for purchases
CREATE POLICY "Enable all operations for purchases" ON public.purchases
FOR ALL USING (true) WITH CHECK (true);

-- Create policies for payments_made
CREATE POLICY "Enable all operations for payments_made" ON public.payments_made
FOR ALL USING (true) WITH CHECK (true);
