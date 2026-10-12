import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Kindred — You're invited" },
      { name: "description", content: "Join your family's private Kindred chat to share updates and support your loved one together." },
      { property: "og:title", content: "Kindred — You're invited" },
      { property: "og:description", content: "Join your family's private chat on Kindred." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function join() {
    setJoining(true);
    setError("");
    const { data, error } = await supabase.rpc("accept_thread_invite", { _token: token });
    setJoining(false);
    if (error || !data) { setError(error?.message ?? "Could not join."); return; }
    navigate({ to: "/chat/$threadId", params: { threadId: data as string } });
  }

  useEffect(() => {
    if (!loading && !user) sessionStorage.setItem("kindred_next", `/invite/${token}`);
  }, [loading, user, token]);

  return (
    <div className="relative z-[1] mx-auto flex min-h-screen max-w-[390px] items-center px-4">
      <div className="glass-card w-full overflow-hidden p-6 text-center">
        <div className="glow-brand -right-6 -top-8 h-28 w-28" />
        <p className="eyebrow">Family invitation</p>
        <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">You've been invited to a private family chat</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">Only invited family members can read and post. This link works once and expires in 7 days.</p>
        {loading ? null : user ? (
          <button onClick={join} disabled={joining} className="mt-5 w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground disabled:opacity-50">
            {joining ? "Joining…" : "Join the family chat"}
          </button>
        ) : (
          <Link to="/auth" className="mt-5 block w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">Sign in or create an account to join</Link>
        )}
        {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
