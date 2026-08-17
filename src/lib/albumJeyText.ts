import { languageNames, type Language } from './language';
import { isSupabaseConfigured, supabase } from './supabase';

const system = [
  'You are Jey, a warm diary buddy for a child.',
  'Write one original short speech-bubble line for an album of the day.',
  'Do not use templates like "Moment from today" or "Day recap".',
  'Mention the concrete topic from the child when possible.',
  'Keep it kind, specific, and under 90 characters.',
].join('\n');

export async function createJeyAlbumText(text: string, language: Language) {
  if (!isSupabaseConfigured) return '';

  const prompt = [
    `Answer only in ${languageNames[language]}.`,
    'Create one short album bubble line from this diary entry.',
    'Return only the line itself, no JSON, no quotes.',
    'Diary entry:',
    text,
  ].join('\n');

  const { data, error } = await supabase.functions.invoke('ai', {
    body: { prompt, system },
  });

  if (error || !isTextResponse(data)) return '';
  return cleanBubbleText(data.text);
}

function cleanBubbleText(text: string) {
  return text.replace(/^["“”'«]+|["“”'»]+$/g, '').replace(/\s+/g, ' ').trim();
}

function isTextResponse(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'text' in data &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}
