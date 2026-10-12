import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Kindred — Family chat" },
      {
        name: "description",
        content:
          "Private conversations for your family — coordinate visits, share news, and support each other.",
      },
      { property: "og:title", content: "Kindred — Family chat" },
      {
        property: "og:description",
        content:
          "Private conversations for your family — coordinate visits, share news, and support each other.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatListPage,
});

type ThreadRow = {
  id: string;
  title: string;
  created_at: string;
};

function ChatListPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("threads")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setThreads(data ?? []);
        setFetching(false);
      });
  }, [user]);

  async function createThread() {
    if (!user) return;
    const title =
      window.prompt("Name this conversation", "Family chat")?.trim() ||
      "Family chat";
    const { data: thread, error } = await supabase
      .from("threads")
      .insert({ title, created_by: user.id })
      .select("id")
      .single();
    if (error?.message?.includes("EXTRA_CHATS_REQUIRED")) {
      if (window.confirm("Kindred Basic includes 1 family group. Unlock unlimited groups with Lifetime ($4.99 once)?"))
        navigate({ to: "/membership" });
      return;
    }
    if (error || !thread) return;
    await supabase
      .from("thread_members")
      .insert({ thread_id: thread.id, user_id: user.id });
    navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
  }

  if (loading || !user) {
    return (
      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[390px] items-center justify-center px-4">
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Family chat
          </p>
          <h1 className="text-[22px] font-extrabold tracking-tight">
            Your <span className="text-primary">conversations</span>
          </h1>
        </div>
        <button
          onClick={createThread}
          className="grid size-11 place-items-center rounded-2xl bg-primary text-[18px] font-bold text-primary-foreground"
          aria-label="New conversation"
        >
          +
        </button>
      </header>

      {fetching ? (
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      ) : threads.length === 0 ? (
        <div className="glass-card overflow-hidden p-5 text-center">
          <div className="glow-brand -right-6 -top-8 h-28 w-28" />
          <p className="text-[16px] font-bold">No conversations yet</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Start a family chat to coordinate visits, share updates, and lean on
            each other.
          </p>
          <button
            onClick={createThread}
            className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link
              key={t.id}
              to="/chat/$threadId"
              params={{ threadId: t.id }}
              className="glass-card flex items-center gap-3 p-4"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-[14px] font-bold text-primary">
                {t.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  Started{" "}
                  {new Date(t.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          ))}
        </div>
      )}

      <AppNav />
    </div>
  );
}
