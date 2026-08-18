import { isSupabaseConfigured, supabase } from './supabase';

export type ParentInvite = {
  child_id: string;
  child_name: string;
  token: string;
};

export async function createParentInvite(childName: string) {
  if (!isSupabaseConfigured) return '';

  const { data: userResult } = await supabase.auth.getUser();
  const childId = userResult.user?.id;
  if (!childId) return '';

  const token = crypto.randomUUID();
  const { error } = await supabase.from('parent_invites').insert({
    child_id: childId,
    token,
    child_name: childName.trim() || 'Someone',
  });

  if (error) return '';
  return `${window.location.origin}/invite/${token}`;
}

export async function loadInvite(token: string): Promise<ParentInvite | null> {
  if (!isSupabaseConfigured) return null;

  const { data } = await supabase
    .from('parent_invites')
    .select('child_id, child_name, token')
    .eq('token', token)
    .maybeSingle();

  return isParentInvite(data) ? data : null;
}

export async function acceptParentInvite(invite: ParentInvite) {
  if (!isSupabaseConfigured) return false;

  const { data: userResult } = await supabase.auth.getUser();
  const parentId = userResult.user?.id;
  if (!parentId) return false;

  const { error: inviteError } = await supabase
    .from('parent_invites')
    .update({ accepted_by: parentId })
    .eq('token', invite.token);
  if (inviteError) return false;

  const { error: linkError } = await supabase.from('family_links').insert({
    child_id: invite.child_id,
    parent_id: parentId,
  });

  return !linkError;
}

function isParentInvite(data: unknown): data is ParentInvite {
  return (
    typeof data === 'object' &&
    data !== null &&
    'child_id' in data &&
    'child_name' in data &&
    'token' in data &&
    typeof (data as ParentInvite).child_id === 'string' &&
    typeof (data as ParentInvite).child_name === 'string' &&
    typeof (data as ParentInvite).token === 'string'
  );
}
