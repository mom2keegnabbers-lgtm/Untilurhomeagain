// Server-side check of whether a user has paid for Lifetime access.
export async function userHasLifetime(userId: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("addon_purchases")
    .select("addon")
    .eq("user_id", userId)
    .eq("addon", "lifetime")
    .maybeSingle();
  return !!data;
}

export async function grantLifetime(userId: string, sessionId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("addon_purchases")
    .upsert(
      { user_id: userId, addon: "lifetime", stripe_session_id: sessionId },
      { onConflict: "user_id,addon", ignoreDuplicates: true },
    );
  if (error) throw error;
}
