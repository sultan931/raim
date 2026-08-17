import { AlbumButton } from './AlbumButton';
import { BuddyAvatar } from './BuddyAvatar';
import { LanguageSelector } from './LanguageSelector';
import { RegisterButton } from './RegisterButton';
import type { Language } from '../lib/language';
import './HomeHero.css';

type HomeHeroProps = {
  labels: {
    albumsButton: string;
    diaryName: string;
    headline: string;
    intro: string;
    logoutButton: string;
    registerButton: string;
  };
  language: Language;
  moodLabel: string;
  onLanguageChange: (language: Language) => void;
};

export function HomeHero({
  labels,
  language,
  moodLabel,
  onLanguageChange,
}: HomeHeroProps) {
  return (
    <section className="diary-hero">
      <div>
        <p className="eyebrow">{labels.diaryName}</p>
        <h1>{labels.headline}</h1>
        <p>{labels.intro}</p>
      </div>
      <div className="hero-side">
        <div className="hero-controls">
          <LanguageSelector value={language} onChange={onLanguageChange} />
          <RegisterButton label={labels.registerButton} logoutLabel={labels.logoutButton} />
        </div>
        <div className="hero-buddy">
          <BuddyAvatar moodLabel={moodLabel} />
          <AlbumButton label={labels.albumsButton} />
        </div>
      </div>
    </section>
  );
}
