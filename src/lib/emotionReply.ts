import type { BuddyReply, PrivacyMode } from './diaryTypes';
import type { Language } from './language';

export type Emotion =
  | 'happy'
  | 'proud'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'lonely'
  | 'tired'
  | 'conflict'
  | 'neutral';

const emotionWords: Record<Emotion, string[]> = {
  happy: ['happy', 'fun', 'great', 'cool', 'good', 'рад', 'весело', 'классно'],
  proud: ['proud', 'won', 'finished', 'did it', 'горжусь', 'получилось'],
  sad: ['sad', 'cry', 'cried', 'upset', 'грустно', 'плакал', 'плакала'],
  angry: ['angry', 'mad', 'hate', 'annoyed', 'злюсь', 'бесит', 'ненавижу'],
  anxious: ['scared', 'worried', 'afraid', 'nervous', 'страшно', 'боюсь'],
  lonely: ['alone', 'lonely', 'ignored', 'одиноко', 'один', 'одна'],
  tired: ['tired', 'exhausted', 'sleepy', 'устал', 'устала', 'нет сил'],
  conflict: ['fight', 'argued', 'bully', 'shouted', 'ссора', 'поругались'],
  neutral: [],
};

export function createEmotionReply(
  entryText: string,
  privacy: PrivacyMode,
  language: Language,
): BuddyReply {
  const emotion = detectEmotion(entryText);
  const reply = replies[language][emotion];
  const parentHint = parentHints[language][emotion] ?? '';

  return {
    text: pick(reply, entryText),
    parentHint: privacy === 'mine' ? parentHint : '',
  };
}

export function detectEmotion(entryText: string): Emotion {
  const lowerText = entryText.toLowerCase();
  const scored = Object.entries(emotionWords).map(([emotion, words]) => ({
    emotion: emotion as Emotion,
    score: words.filter((word) => lowerText.includes(word)).length,
  }));
  const winner = scored.sort((a, b) => b.score - a.score)[0];

  return winner.score > 0 ? winner.emotion : 'neutral';
}

function pick(options: string[], seed: string) {
  const total = Array.from(seed).reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return options[total % options.length];
}

const replies: Record<Language, Record<Emotion, string[]>> = {
  en: {
    happy: [
      'That sounds like a bright part of your day. What made it feel special?',
      'I can hear a little spark in this. Where did you feel that happiness in your body?',
    ],
    proud: [
      'You did something that mattered to you. What helped you keep going?',
      'That sounds like a proud moment. What would you like to remember about yourself from it?',
    ],
    sad: [
      'That sounds sad, and I am glad you wrote it here. What do you wish someone understood?',
      'I hear a soft, heavy feeling in this. What part of it is hardest to explain?',
    ],
    angry: [
      'That anger sounds like it is trying to protect something important. What felt unfair?',
      'Big anger can be loud. If it could speak calmly, what would it ask for?',
    ],
    anxious: [
      'Worry can make everything feel closer and bigger. What is the smallest next thing you can control?',
      'That sounds scary. What would help you feel one step safer right now?',
    ],
    lonely: [
      'Feeling alone can hurt quietly. Who is one person you might want near you, even a little?',
      'I am here with you in this note. What did you need today that you did not get?',
    ],
    tired: [
      'Your day sounds like it used a lot of energy. What would rest look like for you tonight?',
      'Being tired can make feelings heavier. What is one thing you can make easier for yourself?',
    ],
    conflict: [
      'Arguments can leave words stuck inside. What did you want to say but could not?',
      'That sounds tense. What part was about the problem, and what part was about feelings?',
    ],
    neutral: [
      'I am listening. What feeling would you give this moment if it had a name?',
      'Thanks for telling me. What small detail from today keeps coming back to your mind?',
    ],
  },
  ru: {
    happy: ['В этом есть тёплая искра. Что сделало этот момент особенным?'],
    proud: ['Похоже, ты сделал что-то важное для себя. Что помогло тебе продолжать?'],
    sad: ['Похоже, тебе было грустно. Что ты хочешь, чтобы кто-то понял?'],
    angry: ['Злость часто защищает что-то важное. Что показалось несправедливым?'],
    anxious: ['Тревога может делать всё больше. Что маленькое ты можешь контролировать сейчас?'],
    lonely: ['Одиночество может болеть тихо. Кто мог бы быть рядом хотя бы немного?'],
    tired: ['Кажется, день забрал много сил. Какой отдых тебе нужен сегодня?'],
    conflict: ['После ссоры слова могут застрять внутри. Что ты хотел сказать?'],
    neutral: ['Я слушаю. Какое имя ты дал бы этому чувству?'],
  },
  kk: {
    happy: ['Бұл күніңнің жылы сәті сияқты. Оны ерекше еткен не?'],
    proud: ['Сен үшін маңызды нәрсе жасаған сияқтысың. Саған не көмектесті?'],
    sad: ['Бұл мұңды естіледі. Біреу нені түсінсе екен дейсің?'],
    angry: ['Ашу кейде маңызды нәрсені қорғайды. Не әділетсіз көрінді?'],
    anxious: ['Уайым бәрін үлкен етіп көрсетеді. Қазір нені аздап басқара аласың?'],
    lonely: ['Жалғыздық үнсіз ауыртады. Кімнің қасыңда болғанын қалар едің?'],
    tired: ['Күнің көп күш алған сияқты. Бүгін саған қандай демалыс керек?'],
    conflict: ['Ұрыстан кейін сөздер іште қалып қояды. Не айтқың келді?'],
    neutral: ['Мен тыңдап тұрмын. Осы сезімге қандай ат қояр едің?'],
  },
};

const parentHints: Record<Language, Partial<Record<Emotion, string>>> = {
  en: {
    sad: 'A gentle emotional check-in may help today. No diary details were shared.',
    angry: 'A calm moment to listen may help today. No diary details were shared.',
    anxious: 'Extra reassurance may help today. No diary details were shared.',
    lonely: 'Warm attention may matter today. No diary details were shared.',
    conflict: 'A quiet check-in after tension may help. No diary details were shared.',
  },
  ru: {
    sad: 'Сегодня может помочь мягкий эмоциональный разговор. Детали дневника не раскрыты.',
    angry: 'Сегодня может помочь спокойное выслушивание. Детали дневника не раскрыты.',
    anxious: 'Сегодня может помочь больше поддержки. Детали дневника не раскрыты.',
    lonely: 'Сегодня может быть особенно важно тёплое внимание. Детали дневника не раскрыты.',
    conflict: 'После напряжения может помочь спокойный разговор. Детали дневника не раскрыты.',
  },
  kk: {
    sad: 'Бүгін жұмсақ сөйлесу көмектесуі мүмкін. Күнделік мәліметтері ашылмады.',
    angry: 'Бүгін сабырмен тыңдау көмектесуі мүмкін. Күнделік мәліметтері ашылмады.',
    anxious: 'Бүгін көбірек қолдау қажет болуы мүмкін. Күнделік мәліметтері ашылмады.',
    lonely: 'Бүгін жылы көңіл бөлу маңызды болуы мүмкін. Күнделік мәліметтері ашылмады.',
    conflict: 'Кернеуден кейін жай сөйлесу көмектесуі мүмкін. Күнделік мәліметтері ашылмады.',
  },
};
