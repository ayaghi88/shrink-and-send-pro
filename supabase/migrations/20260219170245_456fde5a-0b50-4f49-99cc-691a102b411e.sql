-- Drop the publicly callable check_subscription_status function (email enumeration risk)
DROP FUNCTION IF EXISTS public.check_subscription_status(text);

-- Deny anonymous access to subscriptions table
CREATE POLICY "Deny anon access to subscriptions"
ON public.subscriptions
FOR SELECT
TO anon
USING (false);
