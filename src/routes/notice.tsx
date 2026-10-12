import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/notice")({
  head: () => ({
    meta: [
      { title: "Kindred — Explain a facility notice" },
      { name: "description", content: "Paste or photograph a jail or prison notice and get a plain-language explanation, every deadline, and clear next steps." },
      { property: "og:title", content: "Kindred — Explain a facility notice" },
      { property: "og:description", content: "Plain-language explanations of facility notices, with deadlines and next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NoticePage,
});

function NoticePage() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/notice" }), []);
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const answer = [...messages].reverse().find((m) => m.role === "assistant");
  const answerText = answer?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";

  function explain(e: React.FormEvent) {
    e.preventDefault();
    if (busy || (!text.trim() && !files?.length)) return;
    setMessages([]);
    const t = text.trim() || "Please explain this notice.";
    if (files?.length) sendMessage({ text: t, files }); else sendMessage({ text: t });
  }

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Notice explainer</p>
        <h1 className="text-[22px] font-extrabold tracking-tight">What does this <span className="text-primary">notice</span> mean?</h1>
      </header>

      <form onSubmit={explain} className="glass-card space-y-3 p-4">
        <p className="eyebrow">Paste the notice or add a photo</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
          placeholder="Paste the text of the letter, rejection slip or policy notice here…"
          className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground" />
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" aria-label="Upload notice"
          onChange={(e) => setFiles(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full rounded-full border border-border bg-secondary py-2 text-[12px] font-bold">
          {files?.length ? `📎 ${files[0]?.name ?? "File added"}` : "📷 Upload a photo or PDF"}
        </button>
        {busy ? (
          <button type="button" onClick={stop} className="w-full rounded-full bg-foreground py-2.5 text-[13px] font-bold text-background">Stop</button>
        ) : (
          <button disabled={!text.trim() && !files?.length} className="w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground disabled:opacity-40">Explain it simply</button>
        )}
      </form>

      {(busy || answerText || error) && (
        <div className="glass-card mt-3 p-4">
          <p className="eyebrow">In plain language</p>
          {error ? (
            <p className="mt-2 text-[12px] text-destructive">{error.message || "Something went wrong. Please try again."}</p>
          ) : (
            <div className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
              {answerText.replace(/\*\*/g, "") || <span className="text-muted-foreground">Reading the notice…</span>}
            </div>
          )}
        </div>
      )}
      <p className="mt-2 text-center text-[10px] text-muted-foreground">General guidance, not legal advice. Always confirm with the facility.</p>
      <AppNav />
    </div>
  );
}
