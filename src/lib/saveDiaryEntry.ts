import { createAlbumMoment, saveAlbumMoment } from './album';
import { createJeyAlbumText } from './albumJeyText';
import type { PrivacyMode } from './diaryTypes';
import { isDiaryEntry } from './diaryEntryFilter';
import type { Language } from './language';
import { scheduleJeyFollowUp } from './proactiveJey';

export async function saveIfDiaryEntry(
  text: string,
  privacy: PrivacyMode,
  language: Language,
) {
  if (!isDiaryEntry(text)) return;

  const jeyText = await createJeyAlbumText(text, language);
  saveAlbumMoment(createAlbumMoment(text, privacy, language, jeyText || undefined));
  scheduleJeyFollowUp(text, language);
}
