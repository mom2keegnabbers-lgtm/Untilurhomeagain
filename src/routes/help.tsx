import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Kindred — Guidance & answers" },
      {
        name: "description",
        content:
          "Plain-language answers about commissary, mail rules, visits, and navigating the system.",
      },
      { property: "og:title", content: "Kindred — Guidance & answers" },
      {
        property: "og:description",
        content:
          "Plain-language answers about commissary, mail rules, visits, and navigating the system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const guides = [
  {
    title: "How commissary actually works",
    body: "Commissary is the facility's store where your loved one buys food, hygiene items, and stationery. You deposit money into their account, and they spend from it. Most facilities limit deposits to $100–$300 per month and charge a processing fee of $2–$7 per deposit.",
  },
  {
    title: "Why was my letter returned?",
    body: "The most common reasons: colored paper, stickers, glitter, perfume, more photos than allowed, or a missing inmate ID number. Always write the full name and ID on the envelope, use plain white paper, and keep photos to 4×6 prints.",
  },
  {
    title: "Setting up phone calls",
    body: "Your loved one can't receive incoming calls — they call out, collect or prepaid. You'll need an account with the facility's phone provider, and your number must be on their approved call list. Ask them to add you on their next call.",
  },
  {
    title: "Preparing for your first visit",
    body: "Bring a valid photo ID, arrive 30 minutes early, and dress conservatively — no revealing clothing, and some facilities ban certain colors. Leave your phone and bags in the car or a locker. Children usually need a birth certificate.",
  },
  {
    title: "What to do if money never arrived",
    body: "Deposits can take 1–3 business days. If it's been longer, get your receipt number and call the facility's trust fund office — not the front desk. Keep every confirmation email; they're your proof if a dispute is needed.",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          System help
        </p>
        <h1 className="text-[22px] font-extrabold tracking-tight">
          Plain <span className="text-primary">answers</span>
        </h1>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          The system rarely explains itself. We do — in everyday language.
        </p>
      </header>

      <div className="space-y-3">
        {guides.map((g, i) => (
          <div key={g.title} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/20 text-[13px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="flex-1 text-[14px] font-bold">{g.title}</span>
              <span className="text-muted-foreground">
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && (
              <p className="px-4 pb-4 text-[12px] leading-relaxed text-muted-foreground">
                {g.body}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card mt-4 overflow-hidden p-4">
        <div className="glow-accent -left-6 -bottom-8 h-24 w-24" />
        <p className="text-[15px] font-bold">Still stuck?</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Ask the family chat — someone has probably been through the exact same
          thing at this facility.
        </p>
      </div>

      <AppNav />
    </div>
  );
}
