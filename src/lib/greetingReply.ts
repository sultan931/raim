import type { BuddyReply } from './diaryTypes';
import type { Language } from './language';

export function createGreetingReply(
  entryText: string,
  language: Language,
): BuddyReply | null {
  if (!isGreeting(entryText)) return null;

  return { text: pick(greetingReplies[language], entryText), parentHint: '' };
}

function isGreeting(entryText: string) {
  const normalizedText = entryText
    .toLowerCase()
    .replace(/[!?.,"'’]/g, '')
    .trim();
  const greetingWords = [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'привет',
    'здравствуй',
    'здравствуйте',
    'сәлем',
    'салем',
  ];

  return greetingWords.some(
    (greeting) =>
      normalizedText === greeting ||
      normalizedText.startsWith(`${greeting} `),
  );
}

function pick(options: string[], seed: string) {
  const total = Array.from(seed).reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return options[total % options.length];
}

const greetingReplies: Record<Language, string[]> = {
  en: [
    'Hey, I am here. Want to tell me a little about your day?',
    'Hi. I am glad you came back. What would you like to write first?',
  ],
  ru: [
    'Привет. Я здесь. Хочешь немного рассказать, как прошёл день?',
    'Привет, я рад тебя видеть. С чего начнём?',
  ],
  kk: [
    'Сәлем. Мен осындамын. Бүгінгі күнің туралы аздап айтқың келе ме?',
    'Сәлем, келгеніңе қуаныштымын. Неден бастаймыз?',
  ],
};
