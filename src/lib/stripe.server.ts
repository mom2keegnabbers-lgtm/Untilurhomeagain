import Stripe from "stripe";

// Server-only. The secret key comes from the connected Stripe account and must
// never reach the browser bundle.
let client: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Stripe is not connected yet.");
  client ??= new Stripe(key);
  return client;
}

export function isStripeConnected(): boolean {
  return !!process.env["STRIPE_SECRET_KEY"];
}
