ALTER TABLE public.addon_purchases DROP CONSTRAINT IF EXISTS addon_purchases_addon_check;
ALTER TABLE public.addon_purchases ADD CONSTRAINT addon_purchases_addon_check CHECK (addon IN ('ask','chats','reminders','lifetime'));
COMMENT ON TABLE public.memberships IS 'DEPRECATED: replaced by addon_purchases (lifetime plan)';

CREATE OR REPLACE FUNCTION public.has_lifetime(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.addon_purchases WHERE user_id = _user_id AND addon IN ('lifetime','chats'))
$$;

CREATE OR REPLACE FUNCTION public.enforce_free_chat_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_lifetime(NEW.created_by)
     AND (SELECT count(*) FROM public.threads WHERE created_by = NEW.created_by) >= 1 THEN
    RAISE EXCEPTION 'EXTRA_CHATS_REQUIRED';
  END IF;
  RETURN NEW;
END $$;