import { isSupabaseConfigured, supabase } from './supabase';

export type AppRole = 'kid' | 'parent';

export type UserProfile = {
  id: string;
  role: AppRole;
  display_name: string;
};

export async function loadCurrentProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, role, display_name')
    .eq('id', userId)
    .maybeSingle();

  return isUserProfile(data) ? data : null;
}

export async function saveCurrentProfile(role: AppRole, displayName: string) {
  if (!isSupabaseConfigured) return;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult.user?.id;
  if (!userId) return;

  await supabase.from('profiles').upsert({
    id: userId,
    role,
    display_name: displayName.trim() || 'Jey friend',
  });
}

function isUserProfile(data: unknown): data is UserProfile {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'role' in data &&
    'display_name' in data &&
    typeof (data as UserProfile).id === 'string' &&
    ((data as UserProfile).role === 'kid' || (data as UserProfile).role === 'parent') &&
    typeof (data as UserProfile).display_name === 'string'
  );
}
