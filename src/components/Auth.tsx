import { useState } from 'react';
import { rememberRegisteredUser } from '../lib/authStatus';
import { friendlyErrorMessage } from '../lib/friendlyError';
import { loadCurrentProfile, saveCurrentProfile, type AppRole } from '../lib/roles';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthSignupFields } from './AuthSignupFields';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import './Auth.css';

type AuthProps = {
  initialMode?: 'signin' | 'signup';
  initialRole?: AppRole;
  isRoleLocked?: boolean;
  onAuthSuccess?: (role: AppRole) => void;
  onSignupSuccess?: () => void;
};

// Вход и регистрация по email + паролю. Это пример — Codex поможет улучшить (Google-вход и т.д.).
export function Auth({
  initialMode = 'signin',
  initialRole = 'kid',
  isRoleLocked = false,
  onAuthSuccess,
  onSignupSuccess,
}: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AppRole>(initialRole);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
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
        rememberRegisteredUser();
        onSignupSuccess?.();
        onAuthSuccess?.(role);
      } else {
        const profile = await loadCurrentProfile();
        rememberRegisteredUser();
        onAuthSuccess?.(profile?.role ?? 'kid');
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
      {mode === 'signin' && (
        <>
          <button
            className="google-button"
            disabled={busy}
            onClick={handleGoogleAuth}
            type="button"
          >
            {busy ? 'Открываем вход...' : 'Continue with Google'}
          </button>
          <div className="auth-divider">or</div>
        </>
      )}
      <form onSubmit={handleSubmit} className="form">
        {mode === 'signup' && (
          <AuthSignupFields
            displayName={displayName}
            isRoleLocked={isRoleLocked}
            role={role}
            onDisplayNameChange={setDisplayName}
            onRoleChange={setRole}
          />
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
