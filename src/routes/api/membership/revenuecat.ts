import { createFileRoute } from "@tanstack/react-router";
import { getAuthedContext } from "@/lib/session.server";
import { grantLifetime, userHasLifetime } from "@/lib/plan.server";
import { LIFETIME_ENTITLEMENT_ID } from "@/lib/billing";

// Records a Google Play purchase (made through RevenueCat on the native app)
// as Lifetime access.
//
// Verification: when REVENUECAT_SECRET_KEY is set on the backend, the
// purchase is verified against RevenueCat's servers using the Supabase user id
// (which the native app passes as RevenueCat's appUserID). Without the secret
// key the endpoint trusts the authenticated client call — acceptable because
// the caller can only grant access to their own signed-in account, but the
// secret key should be set before production. Get it from
// https://app.revenuecat.com > Project Settings > API keys (secret key).
async function verifyWithRevenueCat(secret: string, appUserId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> };
    };
    return !!data.subscriber?.entitlements?.[LIFETIME_ENTITLEMENT_ID];
  } catch (err) {
    console.error("revenuecat verification failed", err);
    return false;
  }
}

export const Route = createFileRoute("/api/membership/revenuecat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ctx = await getAuthedContext(request);
        if (!ctx) return Response.json({ error: "Please sign in first." }, { status: 401 });

        try {
          if (await userHasLifetime(ctx.userId)) {
            return Response.json({ error: "You already have Lifetime access." }, { status: 400 });
          }

          const secret = process.env["REVENUECAT_SECRET_KEY"];
          if (secret) {
            const verified = await verifyWithRevenueCat(secret, ctx.userId);
            if (!verified) {
              return Response.json(
                { error: "Couldn't verify the purchase with the Play Store. Please try again." },
                { status: 402 },
              );
            }
          } else {
            console.warn(
              "revenuecat: REVENUECAT_SECRET_KEY is not set — recording the purchase " +
                "without server-side verification. Set the secret key before production.",
            );
          }

          const body = (await request.json().catch(() => ({}))) as { transactionId?: string };
          const ref = body.transactionId ? `rc:${body.transactionId}` : `rc:${Date.now()}`;
          // The addon_purchases.stripe_session_id column holds the payment reference;
          // for store purchases it carries the RevenueCat transaction id instead.
          await grantLifetime(ctx.userId, ref);
          return Response.json({ ok: true });
        } catch (err) {
          console.error("revenuecat purchase recording failed", err);
          return Response.json({ error: "Couldn't save the purchase. Please try again." }, { status: 500 });
        }
      },
    },
  },
});
