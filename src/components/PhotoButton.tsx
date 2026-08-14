import './PhotoButton.css';

type PhotoButtonProps = {
  onPhotoReady: (photoUrl: string) => void;
};

export function PhotoButton({ onPhotoReady }: PhotoButtonProps) {
  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <label className="photo-button" aria-label="Send photo">
      <span />
      <input accept="image/*" onChange={handlePhotoChange} type="file" />
    </label>
  );
}
