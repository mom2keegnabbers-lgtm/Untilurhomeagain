import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { apiUrl } from "@/lib/api-url";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Kindred — Ask a question" },
      { name: "description", content: "Plain-language answers about mail, commissary, visits and phone accounts, with practical next steps for your loved one's facility." },
      { property: "og:title", content: "Kindred — Ask a question" },
      { property: "og:description", content: "Plain-language answers about mail, commissary, visits and phone accounts, with practical next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskPage,
});

const SUGGESTIONS = [
  "Why was my letter returned?",
  "How do I put money on commissary?",
  "What do I need for a first visit?",
  "How do I set up a phone account?",
];

function AskPage() {
  const [facility, setFacility] = useState("");
  const [state, setState] = useState("");
  const [draft, setDraft] = useState("");
  const ctx = useRef({ facility, state });
  ctx.current = { facility, state };
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl("/api/ask"),
        body: () => ctx.current,
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const t = data.session?.access_token;
          return t ? { Authorization: `Bearer ${t}` } : {};
        },
      }),
    [],
  );
  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!busy) inputRef.current?.focus();
  }, [messages, busy]);

  function ask(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setDraft("");
    sendMessage({ text: t });
  }

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Ask Kindred</p>
        <h1 className="text-[22px] font-extrabold tracking-tight">
          Plain <span className="text-primary">answers</span>, real next steps
        </h1>
      </header>

      <div className="glass-card mb-3 p-4">
        <p className="eyebrow">Your loved one's facility</p>
        <div className="mt-2 grid grid-cols-[1fr_96px] gap-2">
          <input value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="e.g. Central State Prison"
            className="rounded-xl border border-border bg-secondary px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground" />
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State"
            className="rounded-xl border border-border bg-secondary px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Optional — helps tailor answers to that system's rules.</p>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="glass-card p-3 text-left text-[12px] font-semibold leading-snug">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          if (m.role === "user")
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-[13px] text-primary-foreground">{text}</p>
              </div>
            );
          return (
            <div key={m.id} className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
              {text || <span className="text-muted-foreground">Thinking…</span>}
            </div>
          );
        })}
        {status === "submitted" && <p className="text-[13px] text-muted-foreground">Thinking…</p>}
        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[12px] text-destructive">
            {error.message || "Something went wrong. Please try again."}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(draft); }}
        className="sticky bottom-24 mt-4 flex items-end gap-2 rounded-3xl border border-border bg-secondary p-1.5 backdrop-blur-xl"
      >
        <textarea
          ref={inputRef}
          autoFocus
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(draft); } }}
          placeholder="Ask about mail, money, visits, calls…"
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        {busy ? (
          <button type="button" onClick={stop} className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-[12px] font-bold text-background" aria-label="Stop">■</button>
        ) : (
          <button type="submit" disabled={!draft.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground disabled:opacity-40" aria-label="Ask">↑</button>
        )}
      </form>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">General guidance, not legal advice. Always confirm with the facility.</p>

      <AppNav />
    </div>
  );
}
