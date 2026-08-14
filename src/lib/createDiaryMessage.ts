import type { DiaryMessage, PrivacyMode } from './diaryTypes';

type MessageMedia = {
  audioId?: string;
  photoUrl?: string;
};

export function createDiaryMessage(
  role: DiaryMessage['role'],
  text: string,
  privacy: PrivacyMode,
  media: MessageMedia = {},
): DiaryMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    privacy,
    audioId: media.audioId,
    photoUrl: media.photoUrl,
    createdAt: new Date().toISOString(),
  };
}
