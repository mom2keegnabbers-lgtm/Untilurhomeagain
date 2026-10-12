CREATE TABLE public.family_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'visit',
  event_date date NOT NULL,
  event_time text,
  notes text,
  remind_days_before integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_events TO authenticated;
GRANT ALL ON public.family_events TO service_role;
ALTER TABLE public.family_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read events" ON public.family_events FOR SELECT TO authenticated USING (public.is_thread_member(thread_id, auth.uid()));
CREATE POLICY "Members add events" ON public.family_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND public.is_thread_member(thread_id, auth.uid()));
CREATE POLICY "Members update events" ON public.family_events FOR UPDATE TO authenticated USING (public.is_thread_member(thread_id, auth.uid()));
CREATE POLICY "Members delete events" ON public.family_events FOR DELETE TO authenticated USING (public.is_thread_member(thread_id, auth.uid()));
CREATE INDEX family_events_thread_date ON public.family_events(thread_id, event_date);