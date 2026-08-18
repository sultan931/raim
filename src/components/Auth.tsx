import { useState } from 'react';
import { rememberRegisteredUser } from '../lib/authStatus';
import { friendlyErrorMessage } from '../lib/friendlyError';
import { saveCurrentProfile, type AppRole } from '../lib/roles';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import './Auth.css';

type AuthProps = {
  onSignupSuccess?: () => void;
};

// Вход и регистрация по email + паролю. Это пример — Codex поможет улучшить (Google-вход и т.д.).
export function Auth({ onSignupSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AppRole>('kid');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const fn =
        mode === 'signup'
          ? supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: window.location.origin,
                data: { display_name: displayName.trim(), role },
              },
            })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) setMessage(friendlyErrorMessage(error));
      else if (mode === 'signup') {
        await saveCurrentProfile(role, displayName);
        setMessage('Готово! Проверь почту, если нужна подтверждалка.');
        rememberRegisteredUser();
        onSignupSuccess?.();
      } else {
        rememberRegisteredUser();
        setMessage('Готово, ты вошёл в Jey diary.');
      }
    } catch {
      setMessage(friendlyErrorMessage('network'));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) setMessage(friendlyErrorMessage(error));
    } catch {
      setMessage('Не получилось открыть Google-вход. Попробуй ещё раз.');
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>{mode === 'signin' ? 'Вход' : 'Регистрация'}</h2>
      <button
        className="google-button"
        disabled={busy}
        onClick={handleGoogleAuth}
        type="button"
      >
        {busy ? 'Открываем вход...' : 'Continue with Google'}
      </button>
      <div className="auth-divider">or</div>
      <form onSubmit={handleSubmit} className="form">
        {mode === 'signup' && (
          <>
            <input
              type="text"
              placeholder="как тебя зовут"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="role-choice" aria-label="Choose role">
              <button
                className={role === 'kid' ? 'is-active' : ''}
                onClick={() => setRole('kid')}
                type="button"
              >
                Kid
              </button>
              <button
                className={role === 'parent' ? 'is-active' : ''}
                onClick={() => setRole('parent')}
                type="button"
              >
                Parent
              </button>
            </div>
          </>
        )}
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="пароль (6+ символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Jey проверяет...' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <button
        className="ghost"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войти'}
      </button>
    </section>
  );
}
