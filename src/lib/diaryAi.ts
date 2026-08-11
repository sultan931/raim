import { isSupabaseConfigured, supabase } from './supabase';
import type { BuddyReply, PrivacyMode } from './diaryTypes';
import { createEmotionReply } from './emotionReply';
import { languageNames, type Language } from './language';

const baseSystemPrompt = `
You are Jey, a warm fox diary buddy for a child.
Reply with kind, simple language. Do not judge, diagnose, shame, or lecture.
Help the child name feelings and say hard things more clearly.
Notice the likely emotion first: joy, pride, sadness, anger, worry, loneliness, tiredness, or conflict.
Respond to the specific situation, not with a generic diary answer.
Ask one gentle question that helps the child express what is difficult to say.
Never reveal private diary details to a parent.
Return only JSON: {"text":"buddy reply","parentHint":"short broad hint or empty string"}.
parentHint is only for gentle broad signals like "A quiet check-in may help today."
If the child mentions immediate danger or self-harm, encourage telling a trusted adult now.
`;

export async function askJey(
  entryText: string,
  privacy: PrivacyMode,
  language: Language,
): Promise<BuddyReply> {
  if (!isSupabaseConfigured) {
    return fallbackReply(entryText, privacy, language);
  }

  const prompt = [
    `Selected app language: ${languageNames[language]}`,
    `You must answer only in ${languageNames[language]}.`,
    'Do not copy the language of the diary entry if it is different.',
    `Privacy choice: ${privacy === 'mine' ? 'only mine' : 'can show parent'}`,
    'Child diary entry:',
    entryText,
  ].join('\n');

  const { data, error } = await supabase.functions.invoke('ai', {
    body: { prompt, system: createSystemPrompt(language) },
  });

  if (error || !isAiResponse(data)) {
    return fallbackReply(entryText, privacy, language);
  }

  const parsedReply = parseReply(data.text);
  if (!parsedReply || isWrongLanguage(parsedReply, language)) {
    return fallbackReply(entryText, privacy, language);
  }

  return parsedReply;
}

function createSystemPrompt(language: Language) {
  return [
    baseSystemPrompt,
    `Critical language rule: every user-facing value in JSON must be written only in ${languageNames[language]}.`,
    'The JSON keys stay in English, but text and parentHint must use the selected language.',
  ].join('\n');
}

function parseReply(text: string): BuddyReply | null {
  try {
    const parsed = JSON.parse(text) as Partial<BuddyReply>;
    if (typeof parsed.text !== 'string') {
      return null;
    }

    return {
      text: parsed.text,
      parentHint: typeof parsed.parentHint === 'string' ? parsed.parentHint : '',
    };
  } catch {
    return null;
  }
}

function fallbackReply(
  entryText: string,
  privacy: PrivacyMode,
  language: Language,
): BuddyReply {
  return createEmotionReply(entryText, privacy, language);
}

function isAiResponse(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'text' in data &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}

function isWrongLanguage(reply: BuddyReply, language: Language) {
  if (language !== 'en') {
    return false;
  }

  return hasCyrillic(reply.text) || hasCyrillic(reply.parentHint);
}

function hasCyrillic(text: string) {
  return /[\u0400-\u04FF]/.test(text);
}
