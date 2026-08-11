import { Link } from 'wouter';
import './AlbumButton.css';

type AlbumButtonProps = {
  label: string;
};

export function AlbumButton({ label }: AlbumButtonProps) {
  return (
    <Link className="album-button" href="/albums">
      {label}
    </Link>
  );
}
