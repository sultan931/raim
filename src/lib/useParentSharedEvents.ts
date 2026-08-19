import { useEffect, useState } from 'react';
import { loadFamilyLinks } from './parentLinks';
import { loadParentSharedEvents, type ParentSharedEvent } from './parentSharing';
import { isSupabaseConfigured, supabase } from './supabase';

const refreshMs = 2_000;

type ParentSharedEventsState = {
  events: ParentSharedEvent[];
  isLoading: boolean;
};

export function useParentSharedEvents(enabled: boolean): ParentSharedEventsState {
  const [events, setEvents] = useState<ParentSharedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    let isRefreshing = false;
    let childId: string | undefined;

    async function refresh(showLoading: boolean) {
      if (isRefreshing) return;
      isRefreshing = true;
      if (showLoading && isMounted) setIsLoading(true);

      try {
        if (!childId) childId = (await loadFamilyLinks())[0]?.child_id;
        const nextEvents = await loadParentSharedEvents(childId);
        if (isMounted) setEvents((current) => keepStableEvents(current, nextEvents));
      } finally {
        isRefreshing = false;
        if (isMounted) setIsLoading(false);
      }
    }

    void refresh(true);
    const intervalId = window.setInterval(() => void refresh(false), refreshMs);
    const channel = isSupabaseConfigured
      ? supabase
          .channel('parent-shared-events')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'parent_shared_events' },
            () => void refresh(false),
          )
          .subscribe()
      : null;

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [enabled]);

  return { events, isLoading };
}

function keepStableEvents(current: ParentSharedEvent[], next: ParentSharedEvent[]) {
  const currentIds = current.map((event) => event.id).join('|');
  const nextIds = next.map((event) => event.id).join('|');

  return currentIds === nextIds ? current : next;
}
