import { useState } from 'react';
import { preparePhoto } from '../lib/photoCompression';
import './PhotoButton.css';

type PhotoButtonProps = {
  onPhotoReady: (photoUrl: string) => void;
};

export function PhotoButton({ onPhotoReady }: PhotoButtonProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);
    try {
      const photoUrl = await preparePhoto(file);
      onPhotoReady(photoUrl);
    } catch {
      setError('Фото не загрузилось. Попробуй выбрать другое.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  }

  return (
    <span className="photo-control">
      <label className="photo-button" aria-label="Send photo">
        <span className={isLoading ? 'loading' : ''} />
        <input accept="image/*" onChange={handlePhotoChange} type="file" />
      </label>
      {error && <small>{error}</small>}
    </span>
  );
}
