import { createAlbumMoment, saveAlbumMoment } from './album';
import type { PrivacyMode } from './diaryTypes';
import { isDiaryEntry } from './diaryEntryFilter';
import type { Language } from './language';
import { scheduleJeyFollowUp } from './proactiveJey';

export function saveIfDiaryEntry(
  text: string,
  privacy: PrivacyMode,
  language: Language,
) {
  if (!isDiaryEntry(text)) return;

  saveAlbumMoment(createAlbumMoment(text, privacy, language));
  scheduleJeyFollowUp(text, language);
}
