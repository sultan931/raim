import { useState } from 'react';
import type { AlbumMoment } from '../lib/album';
import { createDailyBuddySummary } from '../lib/dailyBuddySummary';
import { getAlbumVisual } from '../lib/albumVisual';
import type { Language } from '../lib/language';
import './AlbumCard.css';
import './AlbumOrbOpen.css';
import './AlbumInnerArt.css';
import './AlbumInnerVariants.css';
import './AlbumDepth.css';

type AlbumCardProps = {
  labels: {
    aiTakeaway: string;
    aiTakeawayEmpty: string;
    aiTakeawayLoading: string;
    moodBadge: string;
    onlyMine: string;
    parentBadge: string;
  };
  language: Language;
  moment: AlbumMoment;
};

export function AlbumCard({ labels, language, moment }: AlbumCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const visual = getAlbumVisual(moment);

  async function handleAiSummary() {
    if (isLoading) return;

    setIsLoading(true);
    const text = await createDailyBuddySummary(moment, language);
    setSummary(text || labels.aiTakeawayEmpty);
    setIsLoading(false);
  }

  return (
    <article className={isOpen ? 'album-card open' : 'album-card'}>
      <button
        aria-label={`${moment.emotion} ${visual.state} inner state image`}
        className={`album-art ${moment.emotion} ${visual.state} ${visual.scene}`}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="album-art__memory" />
        <span className="album-art__orb" />
        <span className="album-art__shape one" />
        <span className="album-art__shape two" />
        <span className="album-art__shape three" />
        <span className="album-art__shape four" />
        <span className="album-art__shape five" />
        <span className="album-art__ground" />
        <span className="album-art__panel top" />
        <span className="album-art__panel right" />
        <span className="album-art__panel bottom" />
        <span className="album-art__panel left" />
      </button>
      <div className="album-card__body">
        <div className="album-card__meta">
          <span>{visual.state}</span>
          <small>{getPrivacyLabel(moment.privacy, labels)}</small>
        </div>
        <p>{moment.description}</p>
        {isOpen && (
          <>
            <p className="album-card__details">{moment.textPreview}</p>
            <button className="album-card__ai" onClick={handleAiSummary} type="button">
              {isLoading ? labels.aiTakeawayLoading : labels.aiTakeaway}
            </button>
            {summary && <p className="album-card__details">{summary}</p>}
          </>
        )}
      </div>
    </article>
  );
}

function getPrivacyLabel(
  privacy: AlbumMoment['privacy'],
  labels: AlbumCardProps['labels'],
) {
  if (privacy === 'mine') return labels.onlyMine;
  if (privacy === 'mood') return labels.moodBadge;
  return labels.parentBadge;
}
