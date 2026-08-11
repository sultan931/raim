import type { DiaryMessage, PrivacyMode } from './diaryTypes';
import { detectEmotion, type Emotion } from './emotionReply';
import type { Language } from './language';

export type AlbumMoment = {
  id: string;
  date: string;
  description: string;
  emotion: Emotion;
  privacy: PrivacyMode;
  textPreview: string;
};

export type DailyAlbum = {
  date: string;
  moments: AlbumMoment[];
};

const albumStorageKey = 'fenna-daily-albums';

export function createAlbumMoment(
  text: string,
  privacy: PrivacyMode,
  language: Language,
): AlbumMoment {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    description: createDescription(text, language),
    emotion: detectEmotion(text),
    privacy,
    textPreview: text,
  };
}

export function saveAlbumMoment(moment: AlbumMoment) {
  const moments = loadAlbumMoments();
  localStorage.setItem(albumStorageKey, JSON.stringify([moment, ...moments]));
}

export function loadDailyAlbums(language: Language): DailyAlbum[] {
  const moments = loadAlbumMoments();
  const availableMoments = moments.length > 0 ? moments : loadLegacyMoments(language);
  const grouped = availableMoments.reduce<Record<string, AlbumMoment[]>>(
    (albums, moment) => {
      const day = moment.date.slice(0, 10);
      return { ...albums, [day]: [...(albums[day] ?? []), moment] };
    },
    {},
  );

  return Object.entries(grouped)
    .map(([date, moments]) => ({ date, moments }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function loadAlbumMoments(): AlbumMoment[] {
  const savedMoments = localStorage.getItem(albumStorageKey);
  if (!savedMoments) return [];

  try {
    return JSON.parse(savedMoments) as AlbumMoment[];
  } catch {
    return [];
  }
}

function loadLegacyMoments(language: Language): AlbumMoment[] {
  const savedMessages = localStorage.getItem('fenna-chat-diary');
  if (!savedMessages) return [];

  try {
    const messages = JSON.parse(savedMessages) as DiaryMessage[];
    return messages
      .filter((message) => message.role === 'child')
      .map((message) => createMomentFromMessage(message, language));
  } catch {
    return [];
  }
}

function createMomentFromMessage(
  message: DiaryMessage,
  language: Language,
): AlbumMoment {
  return {
    id: `album-${message.id}`,
    date: message.createdAt,
    description: createDescription(message.text, language),
    emotion: detectEmotion(message.text),
    privacy: message.privacy,
    textPreview: message.text,
  };
}

function createDescription(text: string, language: Language) {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const preview = cleanText.length > 86 ? `${cleanText.slice(0, 86)}...` : cleanText;

  if (language === 'ru') return `Момент дня: ${preview}`;
  if (language === 'kk') return `Күн сәті: ${preview}`;
  return `Moment from today: ${preview}`;
}
