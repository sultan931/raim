import type { BuddyReply, PrivacyMode } from './diaryTypes';
import type { Language } from './language';

const hardWords = [
  'sad',
  'upset',
  'bad day',
  'not well',
  'angry',
  'worried',
  'tired',
  'грустно',
  'плохой день',
  'не очень',
  'устал',
];

const goodWords = [
  'good',
  'great',
  'fun',
  'positive',
  'proud',
  'хорошее',
  'классно',
  'получилось',
  'жақсы',
];

export function createMixedDayReply(
  entryText: string,
  privacy: PrivacyMode,
  language: Language,
): BuddyReply | null {
  if (!isMixedDay(entryText)) return null;

  return {
    text: pick(replies[language], entryText),
    parentHint: privacy === 'parent' ? '' : parentHints[language],
  };
}

function isMixedDay(entryText: string) {
  const lowerText = entryText.toLowerCase();
  return (
    hardWords.some((word) => lowerText.includes(word)) &&
    goodWords.some((word) => lowerText.includes(word))
  );
}

function pick(options: string[], seed: string) {
  const total = Array.from(seed).reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return options[total % options.length];
}

const replies: Record<Language, string[]> = {
  en: [
    'I hear that the day was hard, and I also hear that you still found some good in it. Do not be upset with yourself; you did a lot of good things today.',
    'That sounds like a mixed day: not easy, but not empty of good moments. What is one good thing you want to keep from it?',
  ],
  ru: [
    'Я слышу, что день был непростым, и всё равно в нём были хорошие моменты. Не расстраивайся на себя: ты сегодня сделал много хорошего.',
    'Похоже, день был смешанным: не лёгким, но и не совсем плохим. Какой хороший момент ты хочешь оставить себе на память?',
  ],
  kk: [
    'Күнің оңай болмағанын естіп тұрмын, бірақ ішінде жақсы сәттер де болған. Өзіңе қатты ренжіме: бүгін сен көп жақсы нәрсе жасадың.',
    'Бұл күн аралас болған сияқты: қиын, бірақ жақсы сәтсіз емес. Қай жақсы сәтті есіңде сақтағың келеді?',
  ],
};

const parentHints: Record<Language, string> = {
  en: 'A gentle emotional check-in may help today. No diary details were shared.',
  ru: 'Сегодня может помочь мягкий эмоциональный разговор. Детали дневника не раскрыты.',
  kk: 'Бүгін жұмсақ сөйлесу көмектесуі мүмкін. Күнделік мәліметтері ашылмады.',
};
