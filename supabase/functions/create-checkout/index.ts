import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string, maxRequests = 5, windowMs = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, returnUrl } = await req.json();

    // Validate email
    if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate returnUrl to prevent open redirect
    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        const allowedHosts = ["shrink-and-send-pro.lovable.app", "shrinkandsend.com", "www.shrinkandsend.com", "localhost"];
        const allowedPatterns = [/\.lovable\.app$/, /\.lovableproject\.com$/];
        if (!allowedHosts.includes(url.hostname) && !allowedPatterns.some(p => p.test(url.hostname))) {
          throw new Error("Invalid return URL");
        }
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid return URL" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;

      // Check if already has active subscription
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      if (subs.data.length > 0) {
        return new Response(
          JSON.stringify({ error: "You already have an active Premium subscription." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    const successUrl = returnUrl ? `${returnUrl}?checkout=success` : undefined;
    const cancelUrl = returnUrl ? `${returnUrl}?checkout=cancelled` : undefined;

    // Create a checkout session for a $9.99/mo subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shrink & Send Premium",
              description: "Unlimited compressions, 2GB packages, password protection & more",
            },
            unit_amount: 999,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      ...(successUrl && { success_url: successUrl }),
      ...(cancelUrl && { cancel_url: cancelUrl }),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
