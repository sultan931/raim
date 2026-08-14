import type { Language } from './language';
import { isDiaryEntry } from './diaryEntryFilter';

export function createDayRecap(texts: string[], mood: string, language: Language) {
  const memory = findMemory(texts);
  if (!memory) return quietRecap(language);

  if (language === 'ru') return `Коротко о дне: ${memory}. Настроение было ${mood}.`;
  if (language === 'kk') return `Күн қысқаша: ${memory}. Көңіл күй ${mood} болды.`;
  return `Day recap: ${memory}. The mood felt ${mood}.`;
}

function findMemory(texts: string[]) {
  const cleaned = texts
    .map((text) => text.replace(/\s+/g, ' ').trim())
    .filter((text) => text && isDiaryEntry(text) && !isVoicePlaceholder(text));
  const firstMemory = cleaned[0] ?? '';
  if (!firstMemory) return '';

  return trimSentence(firstMemory);
}

function trimSentence(text: string) {
  const firstSentence = text.match(/^[^.!?。！？]+[.!?。！？]?/)?.[0] ?? text;
  const trimmed = firstSentence.trim();
  return trimmed.length > 96 ? `${trimmed.slice(0, 96).trim()}...` : trimmed;
}

function quietRecap(language: Language) {
  if (language === 'ru') return 'Коротко о дне: пока он кажется тихим и почти нерассказанным.';
  if (language === 'kk') return 'Күн қысқаша: әзірге ол тыныш, әлі көп айтылмаған сияқты.';
  return 'Day recap: it feels quiet so far, with most of the story still unwritten.';
}

function isVoicePlaceholder(text: string) {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('saved a voice note') ||
    lowerText.includes('сохранил голосовую заметку') ||
    lowerText.includes('дауыс жазбасын сақтадым')
  );
}
