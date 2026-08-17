import { preparePhoto } from '../lib/photoCompression';
import './PhotoButton.css';

type PhotoButtonProps = {
  onPhotoReady: (photoUrl: string) => void;
};

export function PhotoButton({ onPhotoReady }: PhotoButtonProps) {
  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const photoUrl = await preparePhoto(file);
      onPhotoReady(photoUrl);
    } finally {
      event.target.value = '';
    }
  }

  return (
    <label className="photo-button" aria-label="Send photo">
      <span />
      <input accept="image/*" onChange={handlePhotoChange} type="file" />
    </label>
  );
}
