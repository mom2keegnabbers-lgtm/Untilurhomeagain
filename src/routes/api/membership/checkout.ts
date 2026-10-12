import { createFileRoute } from "@tanstack/react-router";
import { getAuthedContext } from "@/lib/session.server";
import { getStripe, isStripeConnected } from "@/lib/stripe.server";
import { userHasLifetime } from "@/lib/plan.server";
import { CURRENCY, LIFETIME_PLAN_NAME, LIFETIME_PRICE_CENTS } from "@/lib/membership";

export const Route = createFileRoute("/api/membership/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isStripeConnected()) {
          return Response.json(
            { error: "Payments aren't set up yet. Please try again soon." },
            { status: 503 },
          );
        }
        const ctx = await getAuthedContext(request);
        if (!ctx) return Response.json({ error: "Please sign in first." }, { status: 401 });

        try {
          // Block repeat purchases.
          if (await userHasLifetime(ctx.userId)) {
            return Response.json({ error: "You already have Lifetime access." }, { status: 400 });
          }
          const stripe = getStripe();
          const origin = new URL(request.url).origin;
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            client_reference_id: ctx.userId,
            ...(ctx.email ? { customer_email: ctx.email } : {}),
            line_items: [
              {
                price_data: {
                  currency: CURRENCY,
                  unit_amount: LIFETIME_PRICE_CENTS,
                  product_data: {
                    name: LIFETIME_PLAN_NAME,
                    description: "One-time payment. All Kindred premium features, no recurring charges.",
                  },
                },
                quantity: 1,
              },
            ],
            metadata: { user_id: ctx.userId, plan: "lifetime" },
            payment_intent_data: { metadata: { user_id: ctx.userId, plan: "lifetime" } },
            success_url: `${origin}/membership?joined=1`,
            cancel_url: `${origin}/membership?cancelled=1`,
          });
          if (!session.url) {
            return Response.json({ error: "Couldn't open the payment page." }, { status: 502 });
          }
          return Response.json({ url: session.url });
        } catch (err) {
          console.error("checkout failed", err);
          return Response.json({ error: "Couldn't start the payment. Please try again." }, { status: 500 });
        }
      },
    },
  },
});
