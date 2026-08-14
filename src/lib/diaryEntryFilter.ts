export function isDiaryEntry(text: string) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  if (normalizedText.length < 18) return false;
  if (isSmallTalk(normalizedText)) return false;
  return countWords(normalizedText) >= 4 || hasDiarySignal(normalizedText);
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function hasDiarySignal(text: string) {
  return /\b(today|day|felt|feel|school|friend|home|sad|happy|tired|angry|worried)\b/i.test(text);
}

function isSmallTalk(text: string) {
  const cleanText = text.toLowerCase().replace(/[!?.,"'’]/g, '').trim();
  return smallTalkPhrases.some((phrase) => cleanText === phrase || cleanText.startsWith(phrase));
}

const smallTalkPhrases = [
  'hi',
  'hello',
  'hey',
  'how are you',
  'how are things',
  'hi how are you',
  'hi how are things',
  'привет',
  'как дела',
  'сәлем',
];
