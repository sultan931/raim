import type { Language } from './language';

export const recognitionLanguages: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  kk: 'kk-KZ',
};

const jeyIntroSeenKey = 'jey-intro-seen';

export function shouldShowJeyIntro() {
  try {
    if (sessionStorage.getItem(jeyIntroSeenKey) === 'true') {
      return false;
    }

    sessionStorage.setItem(jeyIntroSeenKey, 'true');
    return true;
  } catch {
    return true;
  }
}
