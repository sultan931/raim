import type { DiaryMessage } from './diaryTypes';
import { detectEmotion, type Emotion } from './emotionReply';
import type { Language } from './language';

type FollowUp = {
  dueAt: string;
  emotion: Emotion;
  id: string;
  language: Language;
  topic: Topic;
};

const followUpStorageKey = 'jey-follow-ups';
const minimumGapDays = 3;
type Topic = 'good-day' | 'hard-feeling' | 'conflict' | 'energy' | 'connection';

export function scheduleJeyFollowUp(text: string, language: Language) {
  const emotion = detectEmotion(text);
  const topic = getTopic(emotion, text);
  if (!topic) return;

  const followUps = loadFollowUps();
  const dueAt = createFutureMorning(minimumGapDays).toISOString();
  const id = `jey-follow-up-${dueAt.slice(0, 10)}-${topic}`;
  const alreadyScheduled = followUps.some((followUp) => followUp.topic === topic);

  if (alreadyScheduled || wasRecentlySent(topic)) return;
  saveFollowUps([...followUps, { dueAt, emotion, id, language, topic }]);
}

export function addDueJeyFollowUps(messages: DiaryMessage[]) {
  const now = Date.now();
  const followUps = loadFollowUps();
  const due = followUps.filter((followUp) => Date.parse(followUp.dueAt) <= now);
  if (due.length === 0) return messages;

  const existingIds = new Set(messages.map((message) => message.id));
  const newMessages = due
    .filter((followUp) => !existingIds.has(followUp.id))
    .map(createFollowUpMessage);
  const waiting = followUps.filter((followUp) => Date.parse(followUp.dueAt) > now);

  saveFollowUps(waiting);
  return [...messages, ...newMessages];
}

export function addJeyTestMessage(messages: DiaryMessage[], language: Language) {
  const id = `jey-test-${new Date().toISOString().slice(0, 10)}`;
  if (messages.some((message) => message.id === id)) return messages;

  const message: DiaryMessage = {
    id,
    role: 'buddy',
    text: testText[language],
    privacy: 'mine',
    createdAt: new Date().toISOString(),
  };

  return [...messages, message];
}

function createFollowUpMessage(followUp: FollowUp): DiaryMessage {
  const topic = followUp.topic ?? getTopic(followUp.emotion, '') ?? 'hard-feeling';

  return {
    id: followUp.id,
    role: 'buddy',
    text: followUpText[followUp.language][topic],
    privacy: 'mine',
    createdAt: new Date().toISOString(),
  };
}

function createFutureMorning(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(9, 0, 0, 0);
  return date;
}

function getTopic(emotion: Emotion, text: string): Topic | null {
  if (emotion === 'happy' || emotion === 'proud') return hasSignificantWords(text) ? 'good-day' : null;
  if (emotion === 'sad' || emotion === 'angry' || emotion === 'anxious') return 'hard-feeling';
  if (emotion === 'conflict') return 'conflict';
  if (emotion === 'tired') return 'energy';
  if (emotion === 'lonely') return 'connection';
  return null;
}

function hasSignificantWords(text: string) {
  return /\b(best|amazing|important|won|finished|birthday|friend|family|really good)\b/i.test(text);
}

function wasRecentlySent(topic: Topic) {
  const recentDate = createFutureMorning(-minimumGapDays);
  return loadFollowUps().some((followUp) => {
    return followUp.topic === topic && Date.parse(followUp.dueAt) >= recentDate.getTime();
  });
}

function loadFollowUps(): FollowUp[] {
  const saved = localStorage.getItem(followUpStorageKey);
  if (!saved) return [];

  try {
    return JSON.parse(saved) as FollowUp[];
  } catch {
    return [];
  }
}

function saveFollowUps(followUps: FollowUp[]) {
  localStorage.setItem(followUpStorageKey, JSON.stringify(followUps));
}

const followUpText: Record<Language, Record<Topic, string>> = {
  en: {
    'good-day': 'I remembered that something good mattered to you a few days ago. Has any of that feeling stayed with you?',
    'hard-feeling': 'I was thinking about that hard feeling you shared. Is it still close, or has it changed shape?',
    conflict: 'I remembered there was some tension before. Do things feel calmer now, or is there still something unsaid?',
    energy: 'A few days ago you sounded tired. Has your body had any real rest since then?',
    connection: 'I remembered that lonely feeling. Has anyone felt a little closer lately?',
  },
  ru: {
    'good-day': 'Я помню, что несколько дней назад для тебя случилось что-то хорошее. Это чувство ещё немного осталось с тобой?',
    'hard-feeling': 'Я думал о трудном чувстве, которым ты делился. Оно всё ещё рядом или уже изменилось?',
    conflict: 'Я помню, что раньше было напряжение. Сейчас стало спокойнее или внутри ещё осталось что-то несказанное?',
    energy: 'Несколько дней назад ты звучал уставшим. Тело успело хоть немного по-настоящему отдохнуть?',
    connection: 'Я помню то чувство одиночества. Кто-то стал хоть немного ближе за эти дни?',
  },
  kk: {
    'good-day': 'Бірнеше күн бұрын саған жақсы бір нәрсе маңызды болғаны есімде. Сол сезім әлі сенімен бірге ме?',
    'hard-feeling': 'Сен бөліскен қиын сезім есімде. Ол әлі жақын ба, әлде өзгерді ме?',
    conflict: 'Бұрын біраз кернеу болғаны есімде. Қазір тыныштау ма, әлде айтылмаған нәрсе қалды ма?',
    energy: 'Бірнеше күн бұрын сен шаршаған сияқты едің. Денең шынымен демала алды ма?',
    connection: 'Жалғыздық сезімі есімде. Осы күндері біреу саған сәл жақынырақ болды ма?',
  },
};

const testText: Record<Language, string> = {
  en: 'Test message from Jey: I can come back later and gently check in with you.',
  ru: 'Тестовое сообщение от Jey: я могу возвращаться позже и мягко спрашивать, как ты.',
  kk: 'Jey-ден тест хабарлама: мен кейін қайта келіп, халіңді жұмсақ сұрай аламын.',
};
