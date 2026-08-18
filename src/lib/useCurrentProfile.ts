import { useEffect, useState } from 'react';
import { loadCurrentProfile, type UserProfile } from './roles';
import { isSupabaseConfigured, supabase } from './supabase';

type CurrentProfileState = {
  isLoading: boolean;
  profile: UserProfile | null;
};

export function useCurrentProfile(): CurrentProfileState {
  const [state, setState] = useState<CurrentProfileState>({
    isLoading: isSupabaseConfigured,
    profile: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState({ isLoading: false, profile: null });
      return undefined;
    }

    let isMounted = true;

    async function refreshProfile() {
      const profile = await loadCurrentProfile();
      if (isMounted) setState({ isLoading: false, profile });
    }

    void refreshProfile();

    const { data } = supabase.auth.onAuthStateChange(() => {
      setState((current) => ({ ...current, isLoading: true }));
      void refreshProfile();
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
