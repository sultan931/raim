import type { PrivacyMode } from './diaryTypes';
import type { Emotion } from './emotionReply';
import type { Language } from './language';
import { createDayRecap } from './albumRecap';

export type DayReflection = {
  description: string;
  privacy: PrivacyMode;
  textPreview: string;
};

const emotionNames: Record<Language, Record<Emotion, string>> = {
  en: {
    happy: 'bright',
    proud: 'proud',
    sad: 'heavy',
    angry: 'stormy',
    anxious: 'worried',
    lonely: 'lonely',
    tired: 'tired',
    conflict: 'tense',
    neutral: 'quiet',
  },
  ru: {
    happy: 'светлым',
    proud: 'гордым',
    sad: 'тяжёлым',
    angry: 'бурным',
    anxious: 'тревожным',
    lonely: 'одиноким',
    tired: 'уставшим',
    conflict: 'напряжённым',
    neutral: 'спокойным',
  },
  kk: {
    happy: 'жарық',
    proud: 'мақтанышты',
    sad: 'ауыр',
    angry: 'дауылды',
    anxious: 'уайымды',
    lonely: 'жалғыз',
    tired: 'шаршаңқы',
    conflict: 'кернеулі',
    neutral: 'тыныш',
  },
};

export function createDayReflection(
  texts: string[],
  privacyModes: PrivacyMode[],
  emotion: Emotion,
  language: Language,
): DayReflection {
  const wordCount = countWords(texts.join(' '));
  const entryCount = texts.length;
  const amount = getAmount(wordCount, entryCount);
  const mood = emotionNames[language][emotion];
  const privacy = getDayPrivacy(privacyModes);

  return {
    description: createDayRecap(texts, mood, language),
    privacy,
    textPreview: createPreview(amount, mood, language),
  };
}

function getDayPrivacy(privacyModes: PrivacyMode[]): PrivacyMode {
  if (privacyModes.some((mode) => mode === 'parent')) return 'parent';
  if (privacyModes.some((mode) => mode === 'mood')) return 'mood';
  return 'mine';
}

export function createQuietReflection(language: Language): DayReflection {
  const mood = emotionNames[language].neutral;

  return {
    description: createDayRecap([], mood, language),
    privacy: 'mine',
    textPreview: createPreview('silent', mood, language),
  };
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getAmount(wordCount: number, entryCount: number) {
  if (wordCount === 0) return 'silent';
  if (wordCount < 18 || entryCount === 1) return 'small';
  if (wordCount < 70) return 'steady';
  return 'full';
}

function createPreview(amount: string, mood: string, language: Language) {
  if (language === 'ru') return ruReflection(amount, mood);
  if (language === 'kk') return kkReflection(amount, mood);
  return enReflection(amount, mood);
}

function enReflection(amount: string, mood: string) {
  if (amount === 'silent') return 'This feels like a quiet day, still waiting for its first words.';
  if (amount === 'small') return `A soft ${mood} feeling came through, like a little note left in the room.`;
  if (amount === 'steady') return `Your day seemed to move mostly through a ${mood} mood, with enough pieces to feel its shape.`;
  return `There was a lot living inside this day, and the ${mood} feeling seemed to need room to breathe.`;
}

function ruReflection(amount: string, mood: string) {
  if (amount === 'silent') return 'Этот день кажется тихим, будто он ещё ждёт свои первые слова.';
  if (amount === 'small') return `Сквозь день мягко проступило ${mood} чувство, как маленькая записка на память.`;
  if (amount === 'steady') return `Похоже, день в основном шёл через ${mood} настроение, и его уже можно почувствовать.`;
  return `В этом дне было много внутри, и этому состоянию будто нужно было больше места.`;
}

function kkReflection(amount: string, mood: string) {
  if (amount === 'silent') return 'Бұл күн тыныш сияқты, әлі алғашқы сөздерін күтіп тұрғандай.';
  if (amount === 'small') return `${mood} сезім жұмсақ көрінді, естелікке қалған кішкентай белгі сияқты.`;
  if (amount === 'steady') return `Күнің көбіне ${mood} көңіл күймен өткен сияқты, оның пішінін сезуге болады.`;
  return `Бұл күннің ішінде көп нәрсе болған, сол күйге кеңірек орын керек сияқты.`;
}
