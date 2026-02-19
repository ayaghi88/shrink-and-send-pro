
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can check subscription by email" ON public.subscriptions;

-- Create a restrictive policy: only the stripe-webhook (service role) can write,
-- and users can only read their own subscription by matching email from JWT
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (email = (auth.jwt()->>'email'));

-- Allow anon users to check subscription by providing their email (needed for checkout flow)
-- This uses a function to limit exposure
CREATE OR REPLACE FUNCTION public.check_subscription_status(lookup_email text)
RETURNS TABLE(status text, plan text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.status, s.plan
  FROM public.subscriptions s
  WHERE s.email = lookup_email
  LIMIT 1;
$$;
