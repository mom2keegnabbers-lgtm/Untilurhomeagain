import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LEADS = [
  { v: 0, label: "Day of" },
  { v: 1, label: "1 day" },
  { v: 3, label: "3 days" },
  { v: 7, label: "1 week" },
  { v: 14, label: "2 weeks" },
];

export function ReminderSettings({ userId, email }: { userId: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState({ email_enabled: true, sms_enabled: false, phone: "", lead_days: [1] as number[] });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("reminder_prefs").select("*").eq("user_id", userId).maybeSingle().then(({ data }) => {
      if (data) setP({ email_enabled: data.email_enabled, sms_enabled: data.sms_enabled, phone: data.phone ?? "", lead_days: data.lead_days });
    });
  }, [userId]);

  const toggleLead = (v: number) =>
    setP((s) => ({ ...s, lead_days: s.lead_days.includes(v) ? s.lead_days.filter((x) => x !== v) : [...s.lead_days, v].sort((a, b) => a - b) }));

  async function save() {
    setMsg("");
    if (p.sms_enabled && !/^\+?[0-9 ()-]{7,}$/.test(p.phone)) { setMsg("Enter a valid mobile number for texts."); return; }
    if (p.lead_days.length === 0) { setMsg("Pick at least one reminder time."); return; }
    const { error } = await supabase.from("reminder_prefs").upsert({
      user_id: userId, email_enabled: p.email_enabled, sms_enabled: p.sms_enabled,
      phone: p.phone.trim() || null, lead_days: p.lead_days, updated_at: new Date().toISOString(),
    });
    setMsg(error ? error.message : "Saved ✓");
  }

  const chip = (on: boolean) => `rounded-full px-3 py-1.5 text-[11px] font-bold ${on ? "bg-foreground text-background" : "border border-border bg-secondary"}`;
  const input = "w-full rounded-xl border border-border bg-secondary px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground";

  return (
    <div className="glass-card mb-3 p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span><span className="eyebrow">My reminders</span><span className="block text-[12px] text-muted-foreground">How and when you hear about dates</span></span>
        <span className="text-[13px] font-bold">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <button type="button" className={chip(p.email_enabled)} onClick={() => setP({ ...p, email_enabled: !p.email_enabled })}>✉️ Email</button>
            <button type="button" className={chip(p.sms_enabled)} onClick={() => setP({ ...p, sms_enabled: !p.sms_enabled })}>💬 Text</button>
          </div>
          {p.email_enabled && <p className="text-[11px] text-muted-foreground">Emails go to {email}</p>}
          {p.sms_enabled && <input className={input} type="tel" placeholder="Mobile number, e.g. +1 555 123 4567" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">Remind me before each date</p>
            <div className="flex flex-wrap gap-1.5">
              {LEADS.map((l) => <button type="button" key={l.v} className={chip(p.lead_days.includes(l.v))} onClick={() => toggleLead(l.v)}>{l.label}</button>)}
            </div>
          </div>
          {msg && <p className="text-[12px] text-muted-foreground">{msg}</p>}
          <button onClick={save} className="w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">Save my reminders</button>
        </div>
      )}
    </div>
  );
}
