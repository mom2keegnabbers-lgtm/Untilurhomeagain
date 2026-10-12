import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/money")({
  head: () => ({
    meta: [
      { title: "Kindred — Add commissary funds" },
      {
        name: "description",
        content:
          "Add money to your loved one's commissary account with a clear, guided 3-step flow.",
      },
      { property: "og:title", content: "Kindred — Add commissary funds" },
      {
        property: "og:description",
        content:
          "Add money to your loved one's commissary account with a clear, guided 3-step flow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoneyPage,
});

const amounts = [10, 25, 50, 100];

function MoneyPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(25);

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Commissary
        </p>
        <h1 className="text-[22px] font-extrabold tracking-tight">
          Add funds for <span className="text-gold">Marcus</span>
        </h1>
      </header>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">How it works</p>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Step {step} of 3
          </span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                n <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-5">
            <p className="text-[15px] font-bold">Pick an amount</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {amounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`rounded-full py-2 text-[13px] font-bold ${
                    amount === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground/70"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-secondary p-3 text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-gold">Central State rule:</span>{" "}
              max $150 per month from family. Marcus has $32.40 this week.
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5">
            <p className="text-[15px] font-bold">Confirm payment</p>
            <div className="mt-3 rounded-2xl border border-border bg-secondary p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">${amount}.00</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Processing fee</span>
                <span className="font-bold">$2.95</span>
              </div>
              <div className="my-2 h-px bg-border" />
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-semibold">Total</span>
                <span className="font-extrabold text-gold">
                  ${(amount + 2.95).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-secondary p-3 text-[12px] text-muted-foreground">
              Paying with Visa ···· 4242
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full bg-secondary py-3 text-[14px] font-bold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground"
              >
                Send ${amount}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-good/20 text-[20px] text-good">
              ✓
            </div>
            <p className="mt-3 text-[17px] font-bold">${amount} is on its way</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Funds usually land in Marcus's account within 1–2 business days.
              We'll notify you the moment they do.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-4 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground"
            >
              Done
            </button>
          </div>
        )}
      </div>

      <div className="glass-card mt-3 p-4">
        <p className="eyebrow">Why the fee?</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Facilities charge families processing fees that are rarely explained.
          We show you the real cost up front — no surprises on your statement.
        </p>
      </div>

      <AppNav />
    </div>
  );
}
