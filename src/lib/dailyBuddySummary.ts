import type { AlbumMoment } from './album';
import { isSupabaseConfigured, supabase } from './supabase';
import { isDiaryEntry } from './diaryEntryFilter';
import { languageNames, type Language } from './language';

const system = [
  'Role: friend.',
  'Tone: friendly and understanding.',
  'You help a kid follow up their daily summary and important topics.',
  'Make short takeaways and a small further action plan.',
  'The plan can suggest either continuing something or changing one small thing.',
  'You may notice patterns, but you cannot provide an exact diagnosis.',
  'Keep it kind, short, and practical.',
].join('\n');

export async function createDailyBuddySummary(moment: AlbumMoment, language: Language) {
  if (!isSupabaseConfigured) return '';
  if (!isDiaryEntry(`${moment.description} ${moment.textPreview}`)) {
    return shortNotEnoughText[language];
  }

  const prompt = [
    `Answer only in ${languageNames[language]}.`,
    'Daily summary:',
    moment.description,
    'Mood reflection:',
    moment.textPreview,
    `Detected mood: ${moment.emotion}.`,
    'If the summary is only a greeting or small talk, do not make a big analysis.',
    'Return 3 very short parts: takeaway, follow-up question, action plan.',
  ].join('\n');

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { prompt, system },
    });

    if (error || !isTextResponse(data)) return '';
    return data.text;
  } catch {
    return '';
  }
}

const shortNotEnoughText: Record<Language, string> = {
  en: 'There is not enough of the day here yet. Tell me one real moment, and I will help you make a takeaway.',
  ru: 'Здесь пока мало самого дня. Расскажи один настоящий момент, и я помогу сделать вывод.',
  kk: 'Мұнда күн туралы әлі аз. Бір нақты сәт айтсаң, мен қорытынды жасауға көмектесемін.',
};

function isTextResponse(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'text' in data &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}
