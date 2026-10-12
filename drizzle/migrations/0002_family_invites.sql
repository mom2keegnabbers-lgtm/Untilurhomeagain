CREATE TABLE public.thread_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  used_by uuid,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.thread_invites TO authenticated;
GRANT ALL ON public.thread_invites TO service_role;
ALTER TABLE public.thread_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read invites" ON public.thread_invites FOR SELECT TO authenticated USING (public.is_thread_member(thread_id, auth.uid()));
CREATE POLICY "Members create invites" ON public.thread_invites FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by AND public.is_thread_member(thread_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.accept_thread_invite(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.thread_invites%ROWTYPE; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Please sign in first'; END IF;
  SELECT * INTO inv FROM public.thread_invites WHERE token = _token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This invite link is not valid'; END IF;
  IF public.is_thread_member(inv.thread_id, uid) THEN RETURN inv.thread_id; END IF;
  IF inv.used_at IS NOT NULL THEN RAISE EXCEPTION 'This invite has already been used'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'This invite has expired'; END IF;
  INSERT INTO public.thread_members(thread_id, user_id) VALUES (inv.thread_id, uid);
  UPDATE public.thread_invites SET used_by = uid, used_at = now() WHERE id = inv.id;
  RETURN inv.thread_id;
END $$;
REVOKE ALL ON FUNCTION public.accept_thread_invite(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.accept_thread_invite(text) TO authenticated;