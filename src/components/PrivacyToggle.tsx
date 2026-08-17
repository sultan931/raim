import { useState } from 'react';
import type { PrivacyMode } from '../lib/diaryTypes';
import './PrivacyToggle.css';

type PrivacyToggleProps = {
  labels: {
    mineHelp: string;
    moodHelp: string;
    moodOnly: string;
    onlyMine: string;
    parentHelp: string;
    parentOk: string;
  };
  value: PrivacyMode;
  onChange: (value: PrivacyMode) => void;
};

export function PrivacyToggle({ labels, value, onChange }: PrivacyToggleProps) {
  const [openHelp, setOpenHelp] = useState<PrivacyMode | null>(null);
  const helpText = getHelpText(openHelp, labels);

  function toggleHelp(mode: PrivacyMode) {
    setOpenHelp((current) => (current === mode ? null : mode));
  }

  return (
    <>
      <div className="privacy-toggle" aria-label="Privacy choice">
        <div className="privacy-toggle__option">
          <button
            className={value === 'mine' ? 'privacy-toggle__choice active' : 'privacy-toggle__choice'}
            onClick={() => onChange('mine')}
            type="button"
          >
            {labels.onlyMine}
          </button>
          <button
            aria-expanded={openHelp === 'mine'}
            aria-label={labels.mineHelp}
            className="privacy-toggle__help"
            onClick={() => toggleHelp('mine')}
            type="button"
          >
            ?
          </button>
        </div>
        <div className="privacy-toggle__option">
          <button
            className={value === 'mood' ? 'privacy-toggle__choice active' : 'privacy-toggle__choice'}
            onClick={() => onChange('mood')}
            type="button"
          >
            {labels.moodOnly}
          </button>
          <button
            aria-expanded={openHelp === 'mood'}
            aria-label={labels.moodHelp}
            className="privacy-toggle__help"
            onClick={() => toggleHelp('mood')}
            type="button"
          >
            ?
          </button>
        </div>
        <div className="privacy-toggle__option">
          <button
            className={value === 'parent' ? 'privacy-toggle__choice active' : 'privacy-toggle__choice'}
            onClick={() => onChange('parent')}
            type="button"
          >
            {labels.parentOk}
          </button>
          <button
            aria-expanded={openHelp === 'parent'}
            aria-label={labels.parentHelp}
            className="privacy-toggle__help"
            onClick={() => toggleHelp('parent')}
            type="button"
          >
            ?
          </button>
        </div>
      </div>
      {openHelp && <p className="privacy-toggle__explanation">{helpText}</p>}
    </>
  );
}

function getHelpText(openHelp: PrivacyMode | null, labels: PrivacyToggleProps['labels']) {
  if (openHelp === 'mine') return labels.mineHelp;
  if (openHelp === 'mood') return labels.moodHelp;
  return labels.parentHelp;
}
