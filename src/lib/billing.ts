import { Purchases } from "@revenuecat/purchases-capacitor";
import { supabase } from "@/integrations/supabase/client";
import { apiUrl } from "./api-url";

// ---------------------------------------------------------------------------
// Native (Google Play) billing via RevenueCat.
//
// SETUP TODO — the user must do this once in the RevenueCat dashboard:
//   1. Create a free RevenueCat account at https://app.revenuecat.com
//   2. Add this Android app (package id from capacitor.config.ts, e.g.
//      com.kindred.app) and connect it to the Google Play Console.
//   3. Create an entitlement with id "lifetime" and attach the $4.99
//      one-time Play product to the default offering.
//   4. Copy the *public* Google SDK API key into VITE_REVENUECAT_API_KEY
//      (safe to ship in the client; it is not a secret).
//   5. For server-side verification, also set REVENUECAT_SECRET_KEY on the
//      backend (see src/routes/api/membership/revenuecat.ts).
//
// Google Play policy requires Play Billing (via RevenueCat) for digital
// purchases inside the app — the Stripe checkout must never be offered on
// native builds. Web builds keep using Stripe.
// ---------------------------------------------------------------------------

const REVENUECAT_API_KEY = import.meta.env['VITE_REVENUECAT_API_KEY'] as string | undefined;

/** Entitlement id for the lifetime unlock, as configured in RevenueCat. */
export const LIFETIME_ENTITLEMENT_ID = "lifetime";

let configured = false;

async function ensureRevenueCat(appUserId: string): Promise<void> {
  if (!REVENUECAT_API_KEY) {
    throw new Error(
      "In-app purchases aren't set up yet. The app owner needs to add a RevenueCat " +
        "API key (VITE_REVENUECAT_API_KEY) — see src/lib/billing.ts for setup steps.",
    );
  }
  if (!configured) {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: appUserId });
    configured = true;
  }
}

export type NativePurchaseResult = { ok: true } | { ok: false; error: string; cancelled?: boolean };

/**
 * Buy the Lifetime unlock inside the native app through Google Play Billing
 * (via RevenueCat). On success the purchase is recorded server-side so the
 * plan unlocks on every device the user signs in on.
 */
export async function purchaseLifetimeNative(): Promise<NativePurchaseResult> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  const accessToken = data.session?.access_token;
  if (!userId || !accessToken) {
    return { ok: false, error: "Please sign in first." };
  }

  try {
    await ensureRevenueCat(userId);

    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) {
      return { ok: false, error: "No purchase options are available right now. Please try again later." };
    }

    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const entitlement = customerInfo.entitlements.active[LIFETIME_ENTITLEMENT_ID];
    if (!entitlement) {
      return {
        ok: false,
        error: "The purchase went through but access wasn't unlocked. Please contact support.",
      };
    }

    // Record it server-side (verified against RevenueCat when the backend
    // has REVENUECAT_SECRET_KEY; see the endpoint for details).
    const res = await fetch(apiUrl("/api/membership/revenuecat"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ transactionId: entitlement.latestPurchaseDate ?? `rc_${Date.now()}` }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return { ok: false, error: body.error ?? "Couldn't save your purchase. Please contact support." };
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && /cancel/i.test(err.message)) {
      return { ok: false, error: "cancelled", cancelled: true };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Purchase failed. Please try again." };
  }
}
