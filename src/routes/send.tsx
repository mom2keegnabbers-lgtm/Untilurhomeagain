import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Kindred — Write a letter" },
      {
        name: "description",
        content:
          "Write a letter to your loved one — we print, stamp, and deliver it to the facility for you.",
      },
      { property: "og:title", content: "Kindred — Write a letter" },
      {
        property: "og:description",
        content:
          "Write a letter to your loved one — we print, stamp, and deliver it to the facility for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Send mail
        </p>
        <h1 className="text-[22px] font-extrabold tracking-tight">
          Write to <span className="text-primary">Marcus</span>
        </h1>
      </header>

      {sent ? (
        <div className="glass-card overflow-hidden p-5 text-center">
          <div className="glow-brand -right-6 -top-8 h-28 w-28" />
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-good/20 text-[20px] text-good">
            ✓
          </div>
          <p className="mt-3 text-[17px] font-bold">Your letter is on its way</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            We'll print, stamp, and drop it at Central State. Delivery usually
            takes 2 days — we'll tell you when it arrives.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setBody("");
            }}
            className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground"
          >
            Write another
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden p-4">
            <div className="glow-accent -left-6 -bottom-8 h-24 w-24" />
            <p className="eyebrow">Your letter</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear Marcus…"
              rows={8}
              className="mt-2 w-full resize-none rounded-2xl border border-border bg-secondary p-3 text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="mt-2 flex items-center justify-between">
              <button className="glass-pill">＋ Attach a photo</button>
              <span className="text-[11px] text-muted-foreground">
                {body.length} / 2,000
              </span>
            </div>
          </div>

          <div className="glass-card mt-3 p-4">
            <p className="eyebrow">Central State mail rules</p>
            <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-good">✓</span> Plain white paper, no
                stickers or glitter
              </li>
              <li className="flex gap-2">
                <span className="text-good">✓</span> Up to 5 photos per envelope,
                4×6 only
              </li>
              <li className="flex gap-2">
                <span className="text-accent">✕</span> No cash, cards, or
                explicit content
              </li>
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              We check your letter against these rules before it ships.
            </p>
          </div>

          <button
            onClick={() => body.trim() && setSent(true)}
            disabled={!body.trim()}
            className="mt-4 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
          >
            Send letter · $1.25
          </button>
        </>
      )}

      <AppNav />
    </div>
  );
}
