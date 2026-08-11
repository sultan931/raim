import { loadRecording } from './audioStore';
import type { DiaryMessage } from './diaryTypes';
import { uiText, type Language } from './language';

export const messageStorageKey = 'fenna-chat-diary';
export const languageStorageKey = 'fenna-language';
const welcomeId = 'fenna-welcome';
const legacyWelcomeId = 'lumi-welcome';
const legacyMessageStorageKey = 'lumi-chat-diary';

export function loadMessages(language: Language): DiaryMessage[] {
  const savedMessages =
    localStorage.getItem(messageStorageKey) ??
    localStorage.getItem(legacyMessageStorageKey);
  if (!savedMessages) return [createWelcomeMessage(language)];

  try {
    const parsed = JSON.parse(savedMessages) as DiaryMessage[];
    return parsed.length > 0
      ? translateWelcomeMessage(parsed, language)
      : [createWelcomeMessage(language)];
  } catch {
    return [createWelcomeMessage(language)];
  }
}

export function loadLanguage(): Language {
  const savedLanguage = localStorage.getItem(languageStorageKey);
  return savedLanguage === 'ru' || savedLanguage === 'kk' ? savedLanguage : 'en';
}

export function translateWelcomeMessage(
  messages: DiaryMessage[],
  language: Language,
): DiaryMessage[] {
  return messages.map((message) =>
    isWelcomeMessage(message) ? createWelcomeMessage(language) : message,
  );
}

export async function hydrateAudioUrls(
  messages: DiaryMessage[],
  setAudioUrls: (urls: Record<string, string>) => void,
) {
  const audioEntries = await Promise.all(
    messages
      .filter((message) => message.audioId)
      .map(async (message) => {
        const audioId = message.audioId ?? '';
        const blob = await loadRecording(audioId);
        return blob ? [audioId, URL.createObjectURL(blob)] : null;
      }),
  );

  setAudioUrls(Object.fromEntries(audioEntries.filter((entry) => entry !== null)));
}

function createWelcomeMessage(language: Language): DiaryMessage {
  return {
    id: welcomeId,
    role: 'buddy',
    text: uiText[language].welcome,
    privacy: 'mine',
    createdAt: new Date(0).toISOString(),
  };
}

function isWelcomeMessage(message: DiaryMessage) {
  const lowerText = message.text.toLowerCase();

  return (
    message.id === welcomeId ||
    message.id === legacyWelcomeId ||
    lowerText.includes('i am lumi') ||
    lowerText.includes('i am fenna') ||
    lowerText.includes('я фенна') ||
    lowerText.includes('мен феннамын')
  );
}
