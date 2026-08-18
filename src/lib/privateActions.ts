import { hasRememberedRegisteredUser } from './authStatus';
import { isSupabaseConfigured, supabase } from './supabase';

export async function canUsePrivateActions() {
  if (!isSupabaseConfigured) return true;
  if (hasRememberedRegisteredUser()) return true;

  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}
