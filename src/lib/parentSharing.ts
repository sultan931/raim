import type { PrivacyMode } from './diaryTypes';
import { detectEmotion } from './emotionReply';
import { isSupabaseConfigured, supabase } from './supabase';

export type ParentSharedEvent = {
  id: string;
  child_id: string;
  privacy: 'mood' | 'parent';
  mood: string;
  summary: string;
  child_text: string | null;
  created_at: string;
};

export async function shareDiaryWithParents(text: string, privacy: PrivacyMode) {
  if (!isSupabaseConfigured || privacy === 'mine') return;

  const { data: userResult } = await supabase.auth.getUser();
  const childId = userResult.user?.id;
  if (!childId) return;

  const mood = detectEmotion(text);
  const { error } = await supabase.from('parent_shared_events').insert({
    child_id: childId,
    privacy,
    mood,
    summary: privacy === 'mood' ? createMoodSummary(mood) : createParentSummary(text, mood),
    child_text: privacy === 'parent' ? text : null,
  });

  if (error) console.warn('Parent sharing failed');
}

export async function loadParentSharedEvents(childId?: string) {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('parent_shared_events')
    .select('id, child_id, privacy, mood, summary, child_text, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (childId) query = query.eq('child_id', childId);

  const { data } = await query;
  return Array.isArray(data) ? data.filter(isParentSharedEvent) : [];
}

function createMoodSummary(mood: string) {
  return `Jey noticed a ${mood} mood today. The diary words stay private.`;
}

function createParentSummary(text: string, mood: string) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const preview = cleanText.length > 160 ? `${cleanText.slice(0, 157).trim()}...` : cleanText;
  return `Shared with parent. Mood: ${mood}. ${preview}`;
}

function isParentSharedEvent(data: unknown): data is ParentSharedEvent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'child_id' in data &&
    'privacy' in data &&
    'mood' in data &&
    'summary' in data &&
    'created_at' in data &&
    typeof (data as ParentSharedEvent).id === 'string' &&
    typeof (data as ParentSharedEvent).child_id === 'string' &&
    ((data as ParentSharedEvent).privacy === 'mood' ||
      (data as ParentSharedEvent).privacy === 'parent') &&
    typeof (data as ParentSharedEvent).mood === 'string' &&
    typeof (data as ParentSharedEvent).summary === 'string' &&
    typeof (data as ParentSharedEvent).created_at === 'string'
  );
}
