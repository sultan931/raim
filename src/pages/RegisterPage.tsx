import { useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { JeyCelebration } from '../components/JeyCelebration';
import { loadLanguage } from '../lib/diaryStorage';
import { uiText } from '../lib/language';
import type { AppRole } from '../lib/roles';
import './RegisterPage.css';

export function RegisterPage() {
  const t = uiText[loadLanguage()];
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  if (!selectedRole) {
    return (
      <main className="register-page register-page--roles">
        <header className="register-header">
          <div>
            <p className="eyebrow">Jey diary</p>
            <h1>Кто ты?</h1>
          </div>
          <Link className="back-link" href="/">
            {t.backToDiary}
          </Link>
        </header>
        <section className="role-select-screen">
          <button onClick={() => setSelectedRole('kid')} type="button">
            <span>Kid</span>
            <small>Писать дневник, выбирать приватность и приглашать родителя.</small>
          </button>
          <button onClick={() => setSelectedRole('parent')} type="button">
            <span>Parent</span>
            <small>Видеть только то, чем ребёнок сам поделился, и спрашивать Jey.</small>
          </button>
        </section>
      </main>
    );
  }

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
      <button className="role-back-button" onClick={() => setSelectedRole(null)} type="button">
        Изменить роль
      </button>
      <Auth
        initialMode="signup"
        initialRole={selectedRole}
        isRoleLocked
        onSignupSuccess={() => setShowCelebration(true)}
      />
      {showCelebration && (
        <JeyCelebration
          message={t.registerCongrats}
          onDone={() => setShowCelebration(false)}
        />
      )}
    </main>
  );
}
