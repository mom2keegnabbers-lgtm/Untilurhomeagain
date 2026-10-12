import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AppNav } from "@/components/AppNav";
import { ReminderSettings } from "@/components/ReminderSettings";
import { daysUntil, isReminderDue, localToday } from "@/lib/reminders";
import { usePlan } from "@/lib/use-membership";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Kindred — Family calendar" },
      { name: "description", content: "A shared family calendar for visit dates and important deadlines, with reminders so everyone can plan together." },
      { property: "og:title", content: "Kindred — Family calendar" },
      { property: "og:description", content: "Shared visit dates, deadlines and reminders for the whole family." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

type Ev = {
  id: string; thread_id: string; title: string; kind: string; event_date: string;
  event_time: string | null; notes: string | null; remind_days_before: number;
};
type Family = { id: string; title: string };

const KINDS = [
  { v: "visit", label: "Visit" },
  { v: "deadline", label: "Deadline" },
  { v: "call", label: "Call" },
  { v: "other", label: "Other" },
];

function CalendarPage() {
  const { user, loading } = useAuth();
  const { isLifetime } = usePlan(user?.id ?? null);
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ thread_id: "", title: "", kind: "visit", event_date: "", event_time: "", notes: "", remind: "1" });
  const [err, setErr] = useState("");
  const today = localToday();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  async function load() {
    const [{ data: t }, { data: e }] = await Promise.all([
      supabase.from("threads").select("id, title").order("created_at"),
      supabase.from("family_events").select("*").gte("event_date", today).order("event_date").order("event_time"),
    ]);
    setFamilies(t ?? []);
    setEvents((e as Ev[]) ?? []);
    setForm((f) => (f.thread_id || !t?.[0] ? f : { ...f, thread_id: t[0].id }));
  }

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel("family-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "family_events" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr("");
    if (!form.thread_id || !form.title.trim() || !form.event_date) { setErr("Add a title, date and family group."); return; }
    const { error } = await supabase.from("family_events").insert({
      thread_id: form.thread_id, created_by: user.id, title: form.title.trim(), kind: form.kind,
      event_date: form.event_date, event_time: form.event_time || null, notes: form.notes.trim() || null,
      remind_days_before: Number(form.remind),
    });
    if (error) { setErr(error.message); return; }
    setForm((f) => ({ ...f, title: "", event_date: "", event_time: "", notes: "" }));
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await supabase.from("family_events").delete().eq("id", id);
    load();
  }

  if (loading || !user) return <div className="mx-auto flex min-h-screen max-w-[390px] items-center justify-center"><p className="text-[13px] text-muted-foreground">Loading…</p></div>;

  const due = events.filter((e) => isReminderDue(e.event_date, e.remind_days_before, today));
  const famName = (id: string) => families.find((f) => f.id === id)?.title ?? "Family";
  const input = "w-full rounded-xl border border-border bg-secondary px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground";

  return (
    <div className="relative z-[1] mx-auto max-w-[390px] px-4 pb-10 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Family calendar</p>
          <h1 className="text-[22px] font-extrabold tracking-tight">Plan <span className="text-primary">together</span></h1>
        </div>
        {families.length > 0 && (
          <button onClick={() => setShowForm((s) => !s)} aria-label="Add date"
            className="grid size-11 place-items-center rounded-2xl bg-primary text-[18px] font-bold text-primary-foreground">{showForm ? "×" : "+"}</button>
        )}
      </header>

      {families.length === 0 && (
        <div className="glass-card p-5 text-center">
          <p className="text-[16px] font-bold">Start a family group first</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Calendars are shared with the people in your family chat.</p>
          <Link to="/chat" className="mt-4 block rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">Go to chat</Link>
        </div>
      )}

      {families.length > 0 && (isLifetime ? (
        <ReminderSettings userId={user.id} email={user.email ?? ""} />
      ) : (
        <Link to="/membership" className="glass-card mb-3 block p-4">
          <p className="eyebrow">Reminder settings · Lifetime</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Choose how and when you get reminded before visits and deadlines. Unlock with Lifetime ($4.99 once).</p>
        </Link>
      ))}

      {due.length > 0 && (
        <div className="glass-card mb-3 overflow-hidden p-4">
          <div className="glow-accent -right-6 -top-8 h-24 w-24" />
          <p className="eyebrow">Reminders</p>
          {due.map((e) => {
            const d = daysUntil(e.event_date, today);
            return (
              <p key={e.id} className="mt-2 text-[13px] font-semibold">
                🔔 {e.title} — <span className="text-gold">{d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}</span>
              </p>
            );
          })}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="glass-card mb-3 space-y-2 p-4">
          <p className="eyebrow">New date</p>
          <input className={input} placeholder="e.g. Saturday visit, Parole hearing" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="flex gap-1.5">
            {KINDS.map((k) => (
              <button type="button" key={k.v} onClick={() => setForm({ ...form, kind: k.v })}
                className={`flex-1 rounded-full py-1.5 text-[11px] font-bold ${form.kind === k.v ? "bg-foreground text-background" : "border border-border bg-secondary"}`}>{k.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={input} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} aria-label="Date" />
            <input type="time" className={input} value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} aria-label="Time" />
          </div>
          <select className={input} value={form.remind} onChange={(e) => setForm({ ...form, remind: e.target.value })} aria-label="Reminder">
            <option value="0">Remind on the day</option>
            <option value="1">Remind 1 day before</option>
            <option value="3">Remind 3 days before</option>
            <option value="7">Remind 1 week before</option>
            <option value="14">Remind 2 weeks before</option>
          </select>
          {families.length > 1 && (
            <select className={input} value={form.thread_id} onChange={(e) => setForm({ ...form, thread_id: e.target.value })} aria-label="Share with">
              {families.map((f) => <option key={f.id} value={f.id}>Share with: {f.title}</option>)}
            </select>
          )}
          <textarea className={input} rows={2} placeholder="Notes (what to bring, ID needed…)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {err && <p className="text-[12px] text-destructive">{err}</p>}
          <button className="w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">Save to family calendar</button>
        </form>
      )}

      <div className="space-y-3">
        {families.length > 0 && events.length === 0 && !showForm && (
          <p className="text-center text-[13px] text-muted-foreground">No upcoming dates yet. Tap + to add a visit or deadline.</p>
        )}
        {events.map((e) => {
          const dt = new Date(e.event_date + "T00:00:00");
          return (
            <div key={e.id} className="glass-card flex gap-3 p-4">
              <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-primary/15 py-1 text-center">
                <p className="text-[10px] font-bold uppercase text-primary">{dt.toLocaleDateString(undefined, { month: "short" })}</p>
                <p className="text-[18px] font-extrabold leading-none">{dt.getDate()}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{e.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {KINDS.find((k) => k.v === e.kind)?.label ?? "Other"}{e.event_time ? ` · ${e.event_time}` : ""} · {famName(e.thread_id)}
                </p>
                {e.notes && <p className="mt-1 text-[12px] text-foreground/80">{e.notes}</p>}
              </div>
              <button onClick={() => remove(e.id)} aria-label={`Delete ${e.title}`} className="self-start text-[12px] text-muted-foreground">✕</button>
            </div>
          );
        })}
      </div>

      <AppNav />
    </div>
  );
}
