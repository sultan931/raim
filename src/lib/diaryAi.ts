import { isSupabaseConfigured, supabase } from './supabase';
import type { BuddyReply, PrivacyMode } from './diaryTypes';
import { createActivityReply } from './activityReply';
import { createEmotionReply } from './emotionReply';
import { languageNames, type Language } from './language';

const baseSystemPrompt = `
You are Jey, a warm fox diary buddy for a child.
Reply with kind, simple language. Do not judge, diagnose, shame, or lecture.
Act like a friendly and understanding buddy, not a doctor or therapist.
Help the child name feelings and say hard things more clearly.
Help the child follow up on their daily summary and important topics over time.
When useful, make one short takeaway and one tiny action plan:
either something to continue or one small thing to change.
You may notice patterns gently, but you cannot provide an exact diagnosis.
Notice the likely emotion first: joy, pride, sadness, anger, worry, loneliness, tiredness, or conflict.
Respond to the specific situation, not with a generic diary answer.
If the child names a concrete event, place, person, activity, object, or photo,
mention that concrete topic in your reply before asking a question.
If the child mentions a simple plan or wish, like swimming, walking, eating, resting, or sleeping,
respond to that activity directly before asking a gentle question.
If the day was hard but also had good moments, name both: validate the hard part,
then remind the child of the good things they did without dismissing their feelings.
If the child only greets you, greet them back warmly and invite them to share.
If the child starts with a greeting but also tells you something real after it,
briefly acknowledge the greeting and respond mainly to the real topic.
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
  const activityReply = createActivityReply(entryText, privacy, language);
  if (activityReply) return activityReply;

  if (!isSupabaseConfigured) {
    return fallbackReply(entryText, privacy, language);
  }

  const prompt = [
    `Selected app language: ${languageNames[language]}`,
    `You must answer only in ${languageNames[language]}.`,
    'Do not copy the language of the diary entry if it is different.',
    `Privacy choice: ${getPrivacyDescription(privacy)}`,
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

function getPrivacyDescription(privacy: PrivacyMode) {
  if (privacy === 'mine') return 'only mine';
  if (privacy === 'mood') return 'share only the mood, not the diary text';
  return 'can show parent';
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
