import { isSupabaseConfigured, supabase } from './supabase';

export type FamilyLink = {
  child_id: string;
  parent_id: string;
};

export async function loadFamilyLinks() {
  if (!isSupabaseConfigured) return [];

  const { data } = await supabase
    .from('family_links')
    .select('child_id, parent_id')
    .order('created_at', { ascending: false });

  return Array.isArray(data) ? data.filter(isFamilyLink) : [];
}

function isFamilyLink(data: unknown): data is FamilyLink {
  return (
    typeof data === 'object' &&
    data !== null &&
    'child_id' in data &&
    'parent_id' in data &&
    typeof (data as FamilyLink).child_id === 'string' &&
    typeof (data as FamilyLink).parent_id === 'string'
  );
}
