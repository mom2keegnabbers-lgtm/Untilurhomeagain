import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe.server";
import { grantLifetime } from "@/lib/plan.server";

// Lifetime access is granted ONLY here, after Stripe's signed message says the payment was paid.
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        const signature = request.headers.get("stripe-signature");
        if (!secret) return Response.json({ error: "Webhook not configured." }, { status: 500 });
        if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

        let event: Stripe.Event;
        try {
          const payload = await request.text();
          event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
        } catch (err) {
          console.error("webhook signature check failed", err);
          return Response.json({ error: "Invalid signature." }, { status: 400 });
        }

        try {
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.["user_id"] ?? session.client_reference_id;
            if (
              session.mode === "payment" &&
              session.payment_status === "paid" &&
              session.metadata?.["plan"] === "lifetime" &&
              userId
            ) {
              await grantLifetime(userId, session.id);
            }
          }
        } catch (err) {
          console.error("webhook handling failed", err);
          return Response.json({ error: "Could not save the update." }, { status: 500 });
        }
        return Response.json({ received: true });
      },
    },
  },
});
