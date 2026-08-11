import './BuddyAvatar.css';

type BuddyAvatarProps = {
  moodLabel: string;
};

export function BuddyAvatar({ moodLabel }: BuddyAvatarProps) {
  return (
    <div className="buddy-avatar" aria-label="Fenna the fox diary buddy">
      <div className="buddy-avatar__sparkle" />
      <div className="buddy-avatar__ears" aria-hidden="true">
        <span className="buddy-avatar__ear left" />
        <span className="buddy-avatar__ear right" />
      </div>
      <div className="buddy-avatar__face">
        <div className="buddy-avatar__cheeks" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="buddy-avatar__eyes">
          <span />
          <span />
        </div>
        <div className="buddy-avatar__nose" />
        <div className="buddy-avatar__muzzle" />
      </div>
      <p>Fenna is listening</p>
      <small>{moodLabel}</small>
    </div>
  );
}
