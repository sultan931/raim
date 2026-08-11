import type { AlbumMoment } from './album';
import type { Emotion } from './emotionReply';

export type InnerState =
  | 'glow'
  | 'lift'
  | 'pressure'
  | 'tangle'
  | 'echo'
  | 'spark'
  | 'drift'
  | 'still';

export type AlbumVisual = {
  scene: string;
  state: InnerState;
};

const stateWords: Record<InnerState, string[]> = {
  glow: ['happy', 'love', 'warm', 'fun', 'рад', 'люблю', 'тепло'],
  lift: ['proud', 'won', 'did it', 'finished', 'горжусь', 'получилось'],
  pressure: ['tired', 'hard', 'heavy', 'устал', 'тяжело', 'нет сил'],
  tangle: ['worried', 'scared', 'nervous', 'боюсь', 'страшно', 'тревога'],
  echo: ['alone', 'lonely', 'miss', 'одиноко', 'скучаю'],
  spark: ['angry', 'mad', 'unfair', 'злюсь', 'бесит', 'несправедливо'],
  drift: ['sad', 'cry', 'upset', 'грустно', 'плакал', 'плакала'],
  still: [],
};

const emotionStates: Record<Emotion, InnerState[]> = {
  happy: ['glow', 'lift'],
  proud: ['lift', 'glow'],
  sad: ['drift', 'pressure'],
  angry: ['spark', 'pressure'],
  anxious: ['tangle', 'pressure'],
  lonely: ['echo', 'drift'],
  tired: ['pressure', 'still'],
  conflict: ['tangle', 'spark'],
  neutral: ['still', 'echo', 'glow'],
};

const scenes: Record<InnerState, string[]> = {
  glow: ['aura', 'bloom', 'pulse'],
  lift: ['rise', 'summit', 'flare'],
  pressure: ['weight', 'deep', 'lowcloud'],
  tangle: ['knot', 'maze', 'static'],
  echo: ['rings', 'distant', 'hollow'],
  spark: ['flash', 'ember', 'fracture'],
  drift: ['mist', 'rainveil', 'softfall'],
  still: ['quiet', 'float', 'nightglass'],
};

export function getAlbumVisual(moment: AlbumMoment): AlbumVisual {
  const state = detectInnerState(moment);
  const seed = Array.from(moment.id + moment.textPreview).reduce(
    (sum, letter) => sum + letter.charCodeAt(0),
    0,
  );

  return {
    state,
    scene: scenes[state][seed % scenes[state].length],
  };
}

function detectInnerState(moment: AlbumMoment): InnerState {
  const lowerText = moment.textPreview.toLowerCase();
  const scored = Object.entries(stateWords).map(([state, words]) => ({
    state: state as InnerState,
    score: words.filter((word) => lowerText.includes(word)).length,
  }));
  const winner = scored.sort((a, b) => b.score - a.score)[0];

  if (winner.score > 0) return winner.state;

  const options = emotionStates[moment.emotion];
  return options[moment.textPreview.length % options.length];
}
