import jeyFox from '../assets/jey-fox.png';
import './BuddyAvatar.css';

type BuddyAvatarProps = {
  moodLabel: string;
};

export function BuddyAvatar({ moodLabel }: BuddyAvatarProps) {
  return (
    <div className="buddy-avatar" aria-label="Jey the fox diary buddy">
      <img alt="Jey, a fox diary buddy with glasses and a teal hoodie" src={jeyFox} />
      <p>Jey is listening</p>
      <small>{moodLabel}</small>
    </div>
  );
}
