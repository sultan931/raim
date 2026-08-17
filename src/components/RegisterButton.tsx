import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  forgetRegisteredUser,
  hasRememberedRegisteredUser,
  subscribeToRememberedUserChange,
} from '../lib/authStatus';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import './RegisterButton.css';

type RegisterButtonProps = {
  confirmLogoutLabel: string;
  label: string;
  logoutLabel: string;
};

export function RegisterButton({ confirmLogoutLabel, label, logoutLabel }: RegisterButtonProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [needsLogoutConfirm, setNeedsLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    function refreshKnownAuth() {
      setIsSignedIn(hasRememberedRegisteredUser());
    }

    refreshKnownAuth();
    const unsubscribeRememberedUser = subscribeToRememberedUserChange(refreshKnownAuth);

    void supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session) || hasRememberedRegisteredUser());
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session) || hasRememberedRegisteredUser());
    });

    return () => {
      data.subscription.unsubscribe();
      unsubscribeRememberedUser();
    };
  }, []);

  useEffect(() => {
    if (!needsLogoutConfirm) return undefined;

    const resetTimer = window.setTimeout(() => setNeedsLogoutConfirm(false), 3500);
    return () => window.clearTimeout(resetTimer);
  }, [needsLogoutConfirm]);

  async function handleLogout() {
    if (!needsLogoutConfirm) {
      setNeedsLogoutConfirm(true);
      return;
    }

    await supabase.auth.signOut();
    forgetRegisteredUser();
    setIsSignedIn(false);
    setNeedsLogoutConfirm(false);
  }

  if (isSignedIn) {
    return (
      <button
        className={
          needsLogoutConfirm ? 'register-button register-button--confirm' : 'register-button'
        }
        onClick={handleLogout}
        type="button"
      >
        {needsLogoutConfirm ? confirmLogoutLabel : logoutLabel}
      </button>
    );
  }

  return (
    <Link className="register-button" href="/register">
      {label}
    </Link>
  );
}
