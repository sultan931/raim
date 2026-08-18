import { useState } from 'react';
import { rememberRegisteredUser } from '../lib/authStatus';
import { friendlyErrorMessage } from '../lib/friendlyError';
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
              options: { emailRedirectTo: window.location.origin },
            })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) setMessage(friendlyErrorMessage(error));
      else if (mode === 'signup') {
        setMessage('Готово! Проверь почту, если нужна подтверждалка.');
        rememberRegisteredUser();
        onSignupSuccess?.();
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
