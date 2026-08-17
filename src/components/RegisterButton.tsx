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
  label: string;
  logoutLabel: string;
};

export function RegisterButton({ label, logoutLabel }: RegisterButtonProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    forgetRegisteredUser();
    setIsSignedIn(false);
  }

  if (isSignedIn) {
    return (
      <button className="register-button" onClick={handleLogout} type="button">
        {logoutLabel}
      </button>
    );
  }

  return (
    <Link className="register-button" href="/register">
      {label}
    </Link>
  );
}
