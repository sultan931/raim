import type { Emotion } from '../lib/emotionReply';
import './MoodFace.css';

type MoodFaceProps = {
  emotion: Emotion;
};

const moodNames: Record<Emotion, string> = {
  happy: 'happy',
  proud: 'proud',
  sad: 'sad',
  angry: 'angry',
  anxious: 'worried',
  lonely: 'lonely',
  tired: 'tired',
  conflict: 'tense',
  neutral: 'quiet',
};

export function MoodFace({ emotion }: MoodFaceProps) {
  return (
    <span
      aria-label={`${moodNames[emotion]} mood`}
      className={`mood-face mood-face--${emotion}`}
      title={moodNames[emotion]}
    >
      <span className="mood-face__eye mood-face__eye--left" />
      <span className="mood-face__eye mood-face__eye--right" />
      <span className="mood-face__mouth" />
    </span>
  );
}
