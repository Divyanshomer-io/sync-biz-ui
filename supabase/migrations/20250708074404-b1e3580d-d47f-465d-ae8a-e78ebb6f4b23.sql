-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  phone TEXT,
  gst_number TEXT,
  business_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles
CREATE POLICY "Users can access and update their own profile"
ON public.user_profiles
FOR ALL
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Add user_id column to existing tables and update RLS policies
ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.vendors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.purchases ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments_made ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for customers
DROP POLICY IF EXISTS "Enable all operations for customers" ON public.customers;
CREATE POLICY "Users can access their own customers"
ON public.customers
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for vendors
DROP POLICY IF EXISTS "Enable all operations for vendors" ON public.vendors;
CREATE POLICY "Users can access their own vendors"
ON public.vendors
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for sales
DROP POLICY IF EXISTS "Enable all operations for sales" ON public.sales;
CREATE POLICY "Users can access their own sales"
ON public.sales
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for purchases
DROP POLICY IF EXISTS "Enable all operations for purchases" ON public.purchases;
CREATE POLICY "Users can access their own purchases"
ON public.purchases
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for payments
DROP POLICY IF EXISTS "Enable all operations for payments" ON public.payments;
CREATE POLICY "Users can access their own payments"
ON public.payments
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for payments_made
DROP POLICY IF EXISTS "Enable all operations for payments_made" ON public.payments_made;
CREATE POLICY "Users can access their own payments_made"
ON public.payments_made
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create trigger function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the frontend setup flow instead of auto-creating
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;