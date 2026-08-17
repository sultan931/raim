import { useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { JeyCelebration } from '../components/JeyCelebration';
import { loadLanguage } from '../lib/diaryStorage';
import { uiText } from '../lib/language';
import './RegisterPage.css';

export function RegisterPage() {
  const t = uiText[loadLanguage()];
  const [showCelebration, setShowCelebration] = useState(false);

  return (
    <main className="register-page">
      <header className="register-header">
        <div>
          <p className="eyebrow">{t.registerButton}</p>
          <h1>{t.registerButton}</h1>
        </div>
        <Link className="back-link" href="/">
          {t.backToDiary}
        </Link>
      </header>
      <Auth onSignupSuccess={() => setShowCelebration(true)} />
      {showCelebration && (
        <JeyCelebration
          message={t.registerCongrats}
          onDone={() => setShowCelebration(false)}
        />
      )}
    </main>
  );
}
