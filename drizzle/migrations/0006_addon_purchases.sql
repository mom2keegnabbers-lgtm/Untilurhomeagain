CREATE TABLE public.addon_purchases (
  user_id uuid NOT NULL,
  addon text NOT NULL CHECK (addon IN ('ask','chats','reminders')),
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, addon)
);
GRANT SELECT ON public.addon_purchases TO authenticated;
GRANT ALL ON public.addon_purchases TO service_role;
ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own addons" ON public.addon_purchases FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_free_chat_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.addon_purchases WHERE user_id = NEW.created_by AND addon = 'chats')
     AND (SELECT count(*) FROM public.threads WHERE created_by = NEW.created_by) >= 1 THEN
    RAISE EXCEPTION 'EXTRA_CHATS_REQUIRED';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER free_chat_limit BEFORE INSERT ON public.threads FOR EACH ROW EXECUTE FUNCTION public.enforce_free_chat_limit();