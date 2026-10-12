import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/use-auth";
import { usePlan } from "@/lib/use-membership";
import { LIFETIME_PRICE_LABEL } from "@/lib/membership";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kindred — Home" },
      {
        name: "description",
        content:
          "Your loved one's hub: commissary balance, letters, visits, and family messages in one place.",
      },
      { property: "og:title", content: "Kindred — Home" },
      {
        property: "og:description",
        content:
          "Your loved one's hub: commissary balance, letters, visits, and family messages in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Good morning, Maya
          </p>
          <h1 className="text-[22px] font-extrabold tracking-tight">
            Marcus is <span className="text-good">waiting</span>
          </h1>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl border border-border bg-secondary text-[15px] font-bold">
          M
        </div>
      </header>

      <div className="glass-card mb-3 overflow-hidden p-5">
        <div className="glow-brand -right-6 -top-8 h-28 w-28" />
        <p className="eyebrow tracking-[0.2em]">Next visit · Saturday 10:00</p>
        <p className="mt-1 text-[17px] font-bold leading-snug">
          Central State · Visit Room B
        </p>
        <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-bold text-background">
          Reserve window <span className="opacity-50">→</span>
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <Link to="/money" className="glass-card block p-4">
          <p className="eyebrow">Commissary</p>
          <p className="mt-1 text-[22px] font-extrabold text-gold">$32.40</p>
          <p className="text-[11px] text-muted-foreground">this week</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="ml-auto text-[11px] font-semibold text-foreground/70">
              Add funds
            </span>
          </div>
        </Link>
        <Link to="/chat" className="glass-card block p-4">
          <p className="eyebrow">Family chat</p>
          <p className="mt-1 text-[22px] font-extrabold">3 new</p>
          <p className="text-[11px] text-muted-foreground">from the family</p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="ml-auto text-[11px] font-semibold text-foreground/70">
              Open
            </span>
          </div>
        </Link>
      </div>

      <div className="glass-card mb-3 overflow-hidden p-4">
        <div className="glow-accent -left-6 -bottom-8 h-24 w-24" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Send mail</p>
            <p className="mt-1 text-[16px] font-bold">Physical letter · 2 days</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              We print, stamp and drop it at the facility — no trips to the post
              office.
            </p>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-[13px] font-bold">
            1
          </div>
        </div>
        <Link
          to="/send"
          className="mt-3 block w-full rounded-full bg-primary py-2.5 text-center text-[13px] font-bold text-primary-foreground"
        >
          Write to Marcus
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="eyebrow">Video call</p>
          <p className="mt-1 text-[16px] font-bold">Book a slot</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Thu · Sat · Sun</p>
          <span className="glass-pill mt-3">1:15 PM open</span>
        </div>
        <Link to="/help" className="glass-card block p-4">
          <p className="eyebrow">System help</p>
          <p className="mt-1 text-[16px] font-bold">Plain answers</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Rules, fees, appeal steps
          </p>
          <span className="glass-pill mt-3">Ask a question</span>
        </Link>
      </div>

      <div className="glass-card mt-3 p-4">
        <p className="eyebrow">This week</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
            1
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              Letter delivered to Marcus
            </p>
            <p className="text-[11px] text-muted-foreground">Mon · 4:12 PM</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-good">
            Done
          </span>
        </div>
        <div className="my-2 h-px bg-border" />
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
            2
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              Commissary order in review
            </p>
            <p className="text-[11px] text-muted-foreground">Mon · 9:00 AM</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
            Pending
          </span>
        </div>
      </div>

      <MembershipCard />

      <AppNav />
    </div>
  );
}

function MembershipCard() {
  const { user } = useAuth();
  const { isLifetime } = usePlan(user?.id ?? null);

  return (
    <Link to="/membership" className="glass-card mt-3 block overflow-hidden p-4">
      <div className="glow-brand -right-8 -bottom-8 h-24 w-24" />
      <p className="eyebrow">Your plan</p>
      <p className="mt-1 text-[16px] font-bold">
        {isLifetime ? "Kindred Lifetime" : `Kindred Basic · free`}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        {isLifetime
          ? "Every premium tool is unlocked on all your devices."
          : `Unlock unlimited chats, the Ask helper and reminders once for ${LIFETIME_PRICE_LABEL}.`}
      </p>
      <span className="glass-pill mt-3">{isLifetime ? "View plan" : "See plans"}</span>
    </Link>
  );
}
