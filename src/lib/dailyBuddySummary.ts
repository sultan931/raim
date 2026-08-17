import type { AlbumMoment } from './album';
import { isSupabaseConfigured, supabase } from './supabase';
import { isDiaryEntry } from './diaryEntryFilter';
import { languageNames, type Language } from './language';

const system = [
  'Role: friend.',
  'Tone: friendly and understanding.',
  'You help a kid follow up their daily summary and important topics.',
  'Make short takeaways and a small further action plan.',
  'Stay on the exact topic from the diary entry.',
  'Mention concrete details from the child instead of generic mood phrases.',
  'The plan can suggest either continuing something or changing one small thing.',
  'You may notice patterns, but you cannot provide an exact diagnosis.',
  'Keep it kind, short, and practical.',
].join('\n');

export async function createDailyBuddySummary(moment: AlbumMoment, language: Language) {
  const diaryText = moment.textPreview;

  if (!isDiaryEntry(diaryText)) {
    return shortNotEnoughText[language];
  }
  if (!isSupabaseConfigured) return createLocalDailySummary(moment, language);

  const prompt = [
    `Answer only in ${languageNames[language]}.`,
    'Original diary entry:',
    diaryText,
    `Detected mood: ${moment.emotion}.`,
    'Use the concrete activity, place, person, or event from the original diary entry.',
    'Do not answer with a generic greeting or a generic mood analysis.',
    'If the summary is only a greeting or small talk, do not make a big analysis.',
    'Return 3 very short parts: takeaway, follow-up question, action plan.',
  ].join('\n');

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { prompt, system },
    });

    if (error || !isTextResponse(data) || !isUsefulSummary(data.text, diaryText)) {
      return createLocalDailySummary(moment, language);
    }

    return data.text;
  } catch {
    return createLocalDailySummary(moment, language);
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

function createLocalDailySummary(moment: AlbumMoment, language: Language) {
  const topic = getShortTopic(moment.textPreview || moment.description);

  if (language === 'ru') {
    return [
      `Вывод: сегодня тебе запомнилось ${topic}.`,
      'Вопрос: что в этом моменте было самым приятным?',
      'План: сохрани это чувство и завтра добавь ещё один маленький хороший момент.',
    ].join('\n');
  }

  if (language === 'kk') {
    return [
      `Қорытынды: бүгін есіңде қалғаны - ${topic}.`,
      'Сұрақ: осы сәттің ең жылы бөлігі қандай болды?',
      'Жоспар: осы сезімді сақтап, ертең тағы бір жақсы сәт қос.',
    ].join('\n');
  }

  return [
    `Takeaway: today, ${topic} stood out to you.`,
    'Question: what felt best about that moment?',
    'Plan: keep that feeling and add one more small good moment tomorrow.',
  ].join('\n');
}

function getShortTopic(text: string) {
  const cleanText = stripGreeting(text.replace(/\s+/g, ' ').trim());
  const firstSentence = cleanText.split(/[.!?。]/)[0]?.trim() || cleanText;
  return firstSentence.length > 90 ? `${firstSentence.slice(0, 87).trim()}...` : firstSentence;
}

function isUsefulSummary(summary: string, diaryText: string) {
  const cleanSummary = summary.trim();
  if (!cleanSummary) return false;

  const keywords = getKeywords(diaryText);
  if (keywords.length === 0) return true;

  const normalizedSummary = normalizeText(cleanSummary);
  return keywords.some((keyword) => normalizedSummary.includes(keyword));
}

function getKeywords(text: string) {
  return normalizeText(stripGreeting(text))
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zа-яёәғқңөұүһі]/gi, ''))
    .filter((word) => word.length >= 4 && !stopWords.has(word))
    .slice(0, 12);
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function stripGreeting(text: string) {
  return text
    .replace(/^(привет|здравствуй|hi|hello|hey)[,!.\s]+/i, '')
    .replace(/^(как дела|how are you)[?!.:\s]+/i, '')
    .replace(/^(сегодня|today)\s+/i, '')
    .trim() || text;
}

const stopWords = new Set([
  'привет',
  'сегодня',
  'очень',
  'хорошо',
  'понравилось',
  'hello',
  'today',
  'very',
  'really',
  'good',
  'liked',
  'сәлем',
  'бүгін',
  'жақсы',
]);
