import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Kindred — Conversation" },
      {
        name: "description",
        content: "A private family conversation on Kindred.",
      },
      { property: "og:title", content: "Kindred — Conversation" },
      {
        property: "og:description",
        content: "A private family conversation on Kindred.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreadPage,
});

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("Conversation");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("threads")
      .select("title")
      .eq("id", threadId)
      .single()
      .then(({ data }) => {
        if (data) setTitle(data.title);
      });
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === (payload.new as Message).id)
              ? prev
              : [...prev, payload.new as Message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !user) return;
    setSending(true);
    setDraft("");
    const { error } = await supabase
      .from("messages")
      .insert({ thread_id: threadId, sender_id: user.id, body });
    if (error) setDraft(body);
    setSending(false);
    inputRef.current?.focus();
  }

  async function invite() {
    if (!user) return;
    const { data, error } = await supabase
      .from("thread_invites")
      .insert({ thread_id: threadId, created_by: user.id })
      .select("token")
      .single();
    if (error || !data) return;
    const link = `${window.location.origin}/invite/${data.token}`;
    setInviteLink(link);
    navigator.clipboard?.writeText(link).catch(() => {});
  }

  if (loading || !user) {
    return (
      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[390px] items-center justify-center px-4">
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative z-[1] mx-auto flex min-h-screen max-w-[390px] flex-col px-4 pb-4 pt-6">
      <header className="mb-3 flex items-center gap-3">
        <Link
          to="/chat"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-[14px]"
          aria-label="Back to conversations"
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Family chat
          </p>
          <h1 className="truncate text-[18px] font-extrabold tracking-tight">
            {title}
          </h1>
        </div>
        <button
          onClick={invite}
          className="shrink-0 rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground"
        >
          + Invite
        </button>
      </header>
      {inviteLink && (
        <div className="glass-card mb-3 p-3">
          <p className="eyebrow">Invite link · one use · 7 days</p>
          <p className="mt-1 break-all text-[12px]">{inviteLink}</p>
          <p className="mt-1 text-[11px] text-good">Copied — send it to one relative by text or email.</p>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto pb-3">
        {messages.length === 0 && (
          <div className="glass-card mt-6 p-5 text-center">
            <p className="text-[15px] font-bold">Say hello 👋</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              This is your private family space. Only members can see it.
            </p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-[13px] leading-relaxed ${
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border bg-secondary"
                }`}
              >
                <p>{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="sticky bottom-4 flex items-center gap-2 rounded-full border border-border bg-secondary p-1.5 backdrop-blur-xl"
      >
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message your family…"
          className="flex-1 bg-transparent px-3 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground disabled:opacity-40"
          aria-label="Send message"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
