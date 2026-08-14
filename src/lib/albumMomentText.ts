import type { Language } from './language';

export function createMomentDescription(text: string, language: Language) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const preview = cleanText.length > 86 ? `${cleanText.slice(0, 86)}...` : cleanText;

  if (language === 'ru') return `Момент дня: ${preview}`;
  if (language === 'kk') return `Күн сәті: ${preview}`;
  return `Moment from today: ${preview}`;
}
