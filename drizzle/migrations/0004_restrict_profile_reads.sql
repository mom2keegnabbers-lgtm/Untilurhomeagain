CREATE OR REPLACE FUNCTION public.shares_thread_with(_other uuid, _me uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.thread_members a
    JOIN public.thread_members b ON a.thread_id = b.thread_id
    WHERE a.user_id = _me AND b.user_id = _other
  )
$$;
REVOKE EXECUTE ON FUNCTION public.shares_thread_with(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_thread_with(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
CREATE POLICY "Read own or family profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.shares_thread_with(id, auth.uid()));