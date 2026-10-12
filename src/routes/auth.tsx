import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Kindred — Sign in" },
      {
        name: "description",
        content: "Sign in to Kindred to join your family chat and stay connected.",
      },
      { property: "og:title", content: "Kindred — Sign in" },
      {
        property: "og:description",
        content: "Sign in to Kindred to join your family chat and stay connected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const goNext = () => {
    const next = typeof window !== "undefined" ? sessionStorage.getItem("kindred_next") : null;
    if (next && next.startsWith("/")) {
      sessionStorage.removeItem("kindred_next");
      window.location.assign(next);
      return;
    }
    navigate({ to: "/chat" });
  };
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) goNext();
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice(
            "Check your email to confirm your account, then come back and sign in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        goNext();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-[1] mx-auto flex min-h-screen max-w-[390px] flex-col justify-center px-4 py-10">
      <div className="glass-card overflow-hidden p-6">
        <div className="glow-brand -right-6 -top-8 h-28 w-28" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Kindred family chat
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Join your family"}
        </h1>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Sign in to pick up the conversation."
            : "Create an account to talk with your family and coordinate support."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {error && (
            <p className="rounded-2xl bg-destructive/15 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-2xl bg-good/15 px-3 py-2 text-[12px] text-good">
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-40"
          >
            {busy
              ? "One moment…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 w-full text-center text-[12px] font-semibold text-muted-foreground"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
