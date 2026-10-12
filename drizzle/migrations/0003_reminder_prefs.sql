CREATE TABLE public.reminder_prefs (
  user_id uuid PRIMARY KEY,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  phone text,
  lead_days integer[] NOT NULL DEFAULT '{1}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reminder_prefs TO authenticated;
GRANT ALL ON public.reminder_prefs TO service_role;
ALTER TABLE public.reminder_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prefs read" ON public.reminder_prefs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own prefs insert" ON public.reminder_prefs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own prefs update" ON public.reminder_prefs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reminder_sends (
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  channel text NOT NULL,
  lead_day integer NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id, channel, lead_day)
);
GRANT ALL ON public.reminder_sends TO service_role;
ALTER TABLE public.reminder_sends ENABLE ROW LEVEL SECURITY;