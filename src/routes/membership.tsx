import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/use-auth";
import { usePlan } from "@/lib/use-membership";
import { LIFETIME_PRICE_LABEL, PLAN_COMPARISON } from "@/lib/membership";
import { apiUrl } from "@/lib/api-url";
import { isNativeApp } from "@/lib/platform";
import { purchaseLifetimeNative } from "@/lib/billing";

type Search = { joined?: boolean; cancelled?: boolean };

export const Route = createFileRoute("/membership")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const out: Search = {};
    if (search["joined"] === "1" || search["joined"] === true) out.joined = true;
    if (search["cancelled"] === "1" || search["cancelled"] === true) out.cancelled = true;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Kindred — Plans: Free Basic or $4.99 Lifetime" },
      {
        name: "description",
        content:
          "Kindred Basic is free forever. Kindred Lifetime unlocks every premium tool for a single $4.99 payment — no subscription.",
      },
      { property: "og:title", content: "Kindred — Free Basic or $4.99 Lifetime" },
      {
        property: "og:description",
        content: "Stay close to loved ones for free, or unlock every Kindred tool once for $4.99.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembershipPage,
});

async function startCheckout(): Promise<{ url?: string; error?: string }> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(apiUrl("/api/membership/checkout"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) return { error: body.error ?? "Something went wrong. Please try again." };
  return body;
}

function MembershipPage() {
  const { joined, cancelled } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isLifetime, loading, refresh } = usePlan(user?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState(0);
  // Native builds (Android/iOS) must use Google Play Billing via RevenueCat —
  // Play policy forbids the Stripe checkout inside the app, so it stays web-only.
  const native = isNativeApp();

  // Returning from Stripe does NOT unlock anything — we re-read the saved purchase
  // a few times while Stripe's confirmation reaches our server.
  useEffect(() => {
    if (!joined || isLifetime || !user) return;
    const id = window.setInterval(async () => {
      setChecks((c) => c + 1);
      await refresh();
    }, 2000);
    const stop = window.setTimeout(() => window.clearInterval(id), 20000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [joined, isLifetime, user, refresh]);

  async function unlock() {
    setError(null);
    setBusy(true);
    if (native) {
      const res = await purchaseLifetimeNative();
      setBusy(false);
      if (!res.ok) {
        if (res.cancelled) return; // user dismissed the Play billing sheet
        return setError(res.error);
      }
      await refresh(); // pick up the newly granted Lifetime access
      return;
    }
    const res = await startCheckout();
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.url) window.location.assign(res.url);
  }

  function startSignIn() {
    sessionStorage.setItem("kindred_next", "/membership");
    navigate({ to: "/auth" });
  }

  const planName = !user ? null : loading ? "…" : isLifetime ? "Kindred Lifetime" : "Kindred Basic (free)";

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Plans</p>
        <h1 className="text-[22px] font-extrabold tracking-tight">
          Free forever, or <span className="text-primary">yours for life</span>
        </h1>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Kindred Basic stays free. Lifetime unlocks every premium tool with one payment — never a monthly bill.
        </p>
      </header>

      {planName && (
        <div className="glass-card mb-3 flex items-center justify-between px-4 py-3">
          <p className="text-[12px] text-muted-foreground">Your plan</p>
          <p className="text-[13px] font-bold">{planName}</p>
        </div>
      )}

      {cancelled && !isLifetime && (
        <p className="glass-card mb-3 px-4 py-3 text-[12px] text-muted-foreground">
          Checkout was cancelled and nothing was charged. You can upgrade any time.
        </p>
      )}
      {joined && !isLifetime && user && (
        <p className="glass-card mb-3 px-4 py-3 text-[12px] text-muted-foreground">
          {checks < 10
            ? "Confirming your payment with Stripe… this takes a few seconds."
            : "We haven't received payment confirmation yet. If you were charged, refresh in a minute — your access will appear once Stripe confirms."}
        </p>
      )}

      {/* Lifetime — highlighted */}
      <div className="glass-card mb-3 overflow-hidden border-2 border-primary p-5">
        <div className="glow-brand -right-6 -top-8 h-28 w-28" />
        <span className="glass-pill">Best value</span>
        <p className="mt-2 text-[17px] font-bold">Kindred Lifetime</p>
        <div className="mt-1 flex items-end gap-2">
          <p className="text-[34px] leading-none font-extrabold">{LIFETIME_PRICE_LABEL}</p>
          <p className="pb-1 text-[12px] font-semibold text-muted-foreground">one time · no subscription</p>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Everything in Basic, plus unlimited family chats, the Ask helper, and reminder settings.
        </p>

        {isLifetime ? (
          <p className="mt-4 rounded-full bg-secondary py-3 text-center text-[13px] font-bold">
            ✓ You have Lifetime access
          </p>
        ) : authLoading ? (
          <p className="mt-4 text-[12px] text-muted-foreground">One moment…</p>
        ) : user ? (
          <button
            onClick={unlock}
            disabled={busy || loading}
            className="mt-4 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
          >
            {busy
              ? native
                ? "Opening Google Play…"
                : "Opening secure payment…"
              : native
                ? `Unlock Lifetime Access — ${LIFETIME_PRICE_LABEL} via Google Play`
                : `Unlock Lifetime Access — ${LIFETIME_PRICE_LABEL}`}
          </button>
        ) : (
          <>
            <button
              onClick={startSignIn}
              className="mt-4 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground"
            >
              Sign in to unlock Lifetime
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              New here? Create a free account on the next screen.
            </p>
          </>
        )}
      </div>

      {/* Basic */}
      <div className="glass-card mb-3 p-5">
        <p className="text-[17px] font-bold">Kindred Basic</p>
        <p className="mt-1 text-[22px] font-extrabold">Free forever</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          The essentials for staying connected — no card needed.
        </p>
      </div>

      {error && <p className="glass-card mb-3 px-4 py-3 text-[12px] text-destructive">{error}</p>}

      {/* Comparison */}
      <div className="glass-card mb-3 p-4">
        <p className="eyebrow">Compare plans</p>
        <div className="mt-3 grid grid-cols-[1fr_64px_72px] gap-y-2 text-[12px]">
          <span />
          <span className="text-center font-bold text-muted-foreground">Basic</span>
          <span className="text-center font-bold text-primary">Lifetime</span>
          {PLAN_COMPARISON.map((r) => (
            <div key={r.feature} className="contents">
              <span className="leading-snug">{r.feature}</span>
              <span className="text-center text-muted-foreground">{r.basic}</span>
              <span className="text-center font-semibold">{r.lifetime}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Kindred explains how to put money on commissary, send mail and set up calls, but it does not
          process deposits, mail letters, or book calls for you — those happen through the facility&apos;s official services.
        </p>
      </div>

      <div className="glass-card mb-3 p-4">
        <p className="eyebrow">How Lifetime works</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Lifetime is tied to your Kindred account, not your phone. Sign in on any device and your access is there.
          There&apos;s nothing to renew and nothing to cancel.
        </p>
        <p className="eyebrow mt-4">Refunds</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          Not happy? Ask for a full refund within 14 days of purchase and we&apos;ll return your $4.99. Lifetime access ends when a refund is issued.
        </p>
        <p className="eyebrow mt-4">Privacy</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          {native
            ? "Payments are handled securely through Google Play. Kindred never sees or stores your card number. We save only that your account has Lifetime access."
            : "Payments are handled by Stripe. Kindred never sees or stores your card number. We save only that your account has Lifetime access."}{" "}
          Your family chats are visible only to the people in them, and we never sell your information.
        </p>
        <p className="eyebrow mt-4">Terms</p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          &quot;Lifetime&quot; means for as long as Kindred is offered. Kindred gives general guidance, not legal advice —
          always confirm rules with the facility. Premium features may improve over time; features you paid for won&apos;t be moved behind a new charge.
        </p>
        <Link to="/help" className="mt-3 inline-block text-[12px] font-semibold text-primary">
          Questions? Read the plain-language help
        </Link>
      </div>

      <AppNav />
    </div>
  );
}
