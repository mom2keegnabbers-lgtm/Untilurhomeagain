import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasLifetimeAccess } from "@/lib/membership";

// Reads the signed-in user's saved purchases (written only by the server after Stripe confirms payment).
export function usePlan(userId: string | null) {
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);

  const load = useCallback(async () => {
    if (!userId) {
      setOwned([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("addon_purchases").select("addon").eq("user_id", userId);
    setOwned((data ?? []).map((r) => r.addon));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(!!userId);
    void load();
  }, [load, userId]);

  return { loading, isLifetime: hasLifetimeAccess(owned), refresh: load };
}
