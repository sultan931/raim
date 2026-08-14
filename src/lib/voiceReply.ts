import type { BuddyReply } from './diaryTypes';
import type { Language } from './language';

export function createVoiceReply(language: Language): BuddyReply {
  const replies: Record<Language, string[]> = {
    en: [
      'I saved your voice note. I can hear that you spoke, but I could not turn the words into text this time. Can you write one short line about what you said?',
      'Your voice note is here. I could not catch the exact words yet, so tell me one tiny sentence and I will answer properly.',
    ],
    ru: [
      'Я сохранил голосовую заметку. Я вижу, что ты говорил, но сейчас не смог превратить слова в текст. Напиши одну короткую фразу о том, что ты сказал.',
      'Голосовая заметка на месте. Я пока не разобрал точные слова, поэтому напиши одну маленькую строку, и я отвечу нормально.',
    ],
    kk: [
      'Дауыс жазбаң сақталды. Сен сөйлегеніңді естіп тұрмын, бірақ сөздерді мәтінге айналдыра алмадым. Не айтқаныңды бір қысқа сөйлеммен жазшы.',
      'Дауыс жазба осында. Нақты сөздерді ұстай алмадым, бір қысқа жол жазсаң, дұрыс жауап беремін.',
    ],
  };

  return {
    text: replies[language][Date.now() % replies[language].length],
    parentHint: '',
  };
}
