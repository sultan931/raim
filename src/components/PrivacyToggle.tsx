import type { PrivacyMode } from '../lib/diaryTypes';
import './PrivacyToggle.css';

type PrivacyToggleProps = {
  labels: {
    moodOnly: string;
    onlyMine: string;
    parentOk: string;
  };
  value: PrivacyMode;
  onChange: (value: PrivacyMode) => void;
};

export function PrivacyToggle({ labels, value, onChange }: PrivacyToggleProps) {
  return (
    <div className="privacy-toggle" aria-label="Privacy choice">
      <button
        className={value === 'mine' ? 'active' : ''}
        onClick={() => onChange('mine')}
        type="button"
      >
        {labels.onlyMine}
      </button>
      <button
        className={value === 'mood' ? 'active' : ''}
        onClick={() => onChange('mood')}
        type="button"
      >
        {labels.moodOnly}
      </button>
      <button
        className={value === 'parent' ? 'active' : ''}
        onClick={() => onChange('parent')}
        type="button"
      >
        {labels.parentOk}
      </button>
    </div>
  );
}
