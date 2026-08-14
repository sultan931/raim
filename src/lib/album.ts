import type { DiaryMessage, PrivacyMode } from './diaryTypes';
import { detectEmotion, type Emotion } from './emotionReply';
import type { Language } from './language';
import { createDayReflection, createQuietReflection } from './albumReflection';
import { isDiaryEntry } from './diaryEntryFilter';
import { createMomentDescription } from './albumMomentText';

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
  sphere: AlbumMoment;
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
    description: createMomentDescription(text, language),
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
  const diaryMoments = availableMoments.filter((moment) => isDiaryEntry(moment.textPreview));
  if (diaryMoments.length === 0) return [createQuietAlbum(language)];

  const grouped = diaryMoments.reduce<Record<string, AlbumMoment[]>>(
    (albums, moment) => {
      const day = moment.date.slice(0, 10);
      return { ...albums, [day]: [...(albums[day] ?? []), moment] };
    },
    {},
  );

  return Object.entries(grouped)
    .map(([date, moments]) => ({ date, sphere: createDaySphere(date, moments, language) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function createDaySphere(
  date: string,
  moments: AlbumMoment[],
  language: Language,
): AlbumMoment {
  const mainEmotion = getDominantEmotion(moments);
  const firstMoment = moments[0];
  const reflection = createDayReflection(
    moments.map((moment) => moment.textPreview),
    moments.map((moment) => moment.privacy),
    mainEmotion,
    language,
  );

  return {
    id: `day-sphere-${date}`,
    date: firstMoment.date,
    description: reflection.description,
    emotion: mainEmotion,
    privacy: reflection.privacy,
    textPreview: reflection.textPreview,
  };
}

function createQuietAlbum(language: Language): DailyAlbum {
  const date = new Date().toISOString();
  const day = date.slice(0, 10);
  const reflection = createQuietReflection(language);
  return {
    date: day,
    sphere: {
      id: `day-sphere-empty-${day}`,
      date,
      description: reflection.description,
      emotion: 'neutral',
      privacy: reflection.privacy,
      textPreview: reflection.textPreview,
    },
  };
}

function getDominantEmotion(moments: AlbumMoment[]): Emotion {
  const counts = moments.reduce<Partial<Record<Emotion, number>>>((emotionCounts, moment) => {
    return { ...emotionCounts, [moment.emotion]: (emotionCounts[moment.emotion] ?? 0) + 1 };
  }, {});

  return moments
    .map((moment) => moment.emotion)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))[0];
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

function createMomentFromMessage(message: DiaryMessage, language: Language): AlbumMoment {
  return {
    id: `album-${message.id}`,
    date: message.createdAt,
    description: createMomentDescription(message.text, language),
    emotion: detectEmotion(message.text),
    privacy: message.privacy,
    textPreview: message.text,
  };
}
