import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { AlbumCard } from '../components/AlbumCard';
import { MoodFace } from '../components/MoodFace';
import { loadDailyAlbums } from '../lib/album';
import { loadLanguage } from '../lib/diaryStorage';
import { uiText } from '../lib/language';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import './AlbumsPage.css';

export function AlbumsPage() {
  const [, navigate] = useLocation();
  const { profile } = useCurrentProfile();
  const language = loadLanguage();
  const t = uiText[language];
  const albums = loadDailyAlbums(language);

  useEffect(() => {
    if (profile?.role === 'parent') navigate('/parent');
  }, [navigate, profile?.role]);

  if (profile?.role === 'parent') return null;

  return (
    <main className="albums-page">
      <header className="albums-header">
        <div>
          <p className="eyebrow">{t.albumsTitle}</p>
          <h1>{t.albumsTitle}</h1>
          <p>{t.albumsIntro}</p>
        </div>
        <Link className="back-link" href="/">
          {t.backToDiary}
        </Link>
      </header>

      {albums.length === 0 ? (
        <p className="albums-empty">{t.emptyAlbums}</p>
      ) : (
        <div className="album-days">
          {albums.map((album) => (
            <section className="album-day" key={album.date}>
              <div className="album-day__title">
                <div className={`album-day__date album-day__date--${album.sphere.emotion}`}>
                  <h2>{formatDate(album.date, language)}</h2>
                  <MoodFace emotion={album.sphere.emotion} />
                </div>
                <span>{t.moments}</span>
              </div>
              <div className="album-focus">
                <AlbumCard labels={t} language={language} moment={album.sphere} />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function formatDate(date: string, language: string) {
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
