import { languageOptions, type Language } from '../lib/language';
import './LanguageSelector.css';

type LanguageSelectorProps = {
  value: Language;
  onChange: (language: Language) => void;
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <label className="language-selector">
      <span>Language</span>
      <select
        onChange={(event) => onChange(event.target.value as Language)}
        value={value}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
