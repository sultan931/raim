import type { AlbumMoment } from '../lib/album';
import { getAlbumVisual } from '../lib/albumVisual';
import './AlbumCard.css';
import './AlbumInnerArt.css';
import './AlbumInnerVariants.css';
import './AlbumDepth.css';

type AlbumCardProps = {
  labels: {
    onlyMine: string;
    parentBadge: string;
  };
  moment: AlbumMoment;
};

export function AlbumCard({ labels, moment }: AlbumCardProps) {
  const visual = getAlbumVisual(moment);

  return (
    <article className="album-card">
      <div
        aria-label={`${moment.emotion} ${visual.state} inner state image`}
        className={`album-art ${moment.emotion} ${visual.state} ${visual.scene}`}
        role="img"
      >
        <span className="album-art__orb" />
        <span className="album-art__shape one" />
        <span className="album-art__shape two" />
        <span className="album-art__shape three" />
        <span className="album-art__shape four" />
        <span className="album-art__shape five" />
        <span className="album-art__ground" />
      </div>
      <div className="album-card__body">
        <div className="album-card__meta">
          <span>{visual.state}</span>
          <small>
            {moment.privacy === 'mine' ? labels.onlyMine : labels.parentBadge}
          </small>
        </div>
        <p>{moment.description}</p>
      </div>
    </article>
  );
}
