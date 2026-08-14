import type { BuddyReply, PrivacyMode } from './diaryTypes';
import type { Language } from './language';

type Activity = 'swim' | 'walk' | 'rest' | 'eat' | 'sleep';

const activityWords: Record<Activity, string[]> = {
  swim: ['swim', 'swimming', 'pool', 'плавать', 'поплавать', 'бассейн', 'купаться'],
  walk: ['walk', 'outside', 'прогул', 'погулять', 'улицу', 'сыртқа'],
  rest: ['rest', 'relax', 'отдохнуть', 'расслабиться', 'демал'],
  eat: ['eat', 'hungry', 'snack', 'поесть', 'голод', 'перекус'],
  sleep: ['sleep', 'nap', 'bed', 'поспать', 'сон', 'ұйық'],
};

export function createActivityReply(
  entryText: string,
  privacy: PrivacyMode,
  language: Language,
): BuddyReply | null {
  const activity = detectActivity(entryText);
  if (!activity) return null;

  return {
    text: pick(replies[language][activity], entryText),
    parentHint: privacy === 'parent' ? '' : '',
  };
}

function detectActivity(entryText: string): Activity | null {
  const lowerText = entryText.toLowerCase();
  return (
    (Object.entries(activityWords).find(([, words]) =>
      words.some((word) => lowerText.includes(word)),
    )?.[0] as Activity | undefined) ?? null
  );
}

function pick(options: string[], seed: string) {
  const total = Array.from(seed).reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return options[total % options.length];
}

const replies: Record<Language, Record<Activity, string[]>> = {
  en: {
    swim: [
      'A swim sounds refreshing. What do you want from it most: calm, fun, or just a reset?',
      'That sounds like a good way to move the day through your body. Where would you like to swim?',
    ],
    walk: [
      'Getting outside sounds like it could help. What would make the walk feel good today?',
      'A walk might give your thoughts some room. Do you want quiet, music, or company?',
    ],
    rest: [
      'Rest sounds like a kind choice. What would help your body feel a little softer right now?',
      'That makes sense. What kind of rest do you want: quiet, comfort, or doing nothing for a bit?',
    ],
    eat: [
      'A snack or meal might help. What sounds good and easy right now?',
      'Your body may be asking for care. What would feel nice to eat?',
    ],
    sleep: [
      'Sleep sounds like it may help. What would make it easier to settle down?',
      'A nap or early night can be kind to a tired day. What do you need before sleeping?',
    ],
  },
  ru: {
    swim: [
      'Поплавать звучит здорово. Тебе сейчас больше хочется спокойствия, веселья или просто перезагрузки?',
      'Плавание может приятно стряхнуть день с тела. Где бы ты хотел поплавать?',
    ],
    walk: [
      'Прогулка может помочь голове выдохнуть. Ты хочешь тишины, музыки или чтобы кто-то был рядом?',
      'Выйти наружу звучит как хорошая идея. Что сделало бы прогулку приятной сегодня?',
    ],
    rest: [
      'Отдых сейчас звучит как добрая забота о себе. Что помогло бы тебе расслабиться хотя бы немного?',
      'Понимаю. Какой отдых тебе нужен: тишина, уют или просто ничего не делать?',
    ],
    eat: [
      'Похоже, телу нужна забота. Что было бы приятно и легко поесть сейчас?',
      'Перекус или еда могут помочь. Что тебе сейчас хочется?',
    ],
    sleep: [
      'Сон может хорошо помочь. Что сделало бы засыпание чуть легче?',
      'Поспать звучит бережно к себе. Что тебе нужно перед сном?',
    ],
  },
  kk: {
    swim: [
      'Жүзу жақсы ой сияқты. Қазір саған тыныштық, көңіл көтеру әлде жай ғана сергіп алу керек пе?',
      'Жүзу күннің ауырлығын аздап жеңілдетуі мүмкін. Қай жерде жүзгің келеді?',
    ],
    walk: [
      'Серуен ойды жеңілдетуі мүмкін. Саған тыныштық, музыка әлде қасыңда біреу болғаны керек пе?',
      'Сыртқа шығу жақсы ой сияқты. Бүгін серуенді не жағымды етер еді?',
    ],
    rest: [
      'Демалу өзіңе жұмсақ қарау сияқты. Қазір аздап босаңсуға не көмектеседі?',
      'Түсінемін. Қандай демалыс керек: тыныштық, жайлылық әлде біраз ештеңе істемеу ме?',
    ],
    eat: [
      'Денең қамқорлық сұрап тұрған шығар. Қазір не жегің келеді?',
      'Аздап тамақтану көмектесуі мүмкін. Саған не жеңіл әрі жағымды болар еді?',
    ],
    sleep: [
      'Ұйқы көмектесуі мүмкін. Ұйықтауды не жеңілдетер еді?',
      'Ұйықтап алу өзіңе жақсы күтім сияқты. Ұйқы алдында саған не керек?',
    ],
  },
};
