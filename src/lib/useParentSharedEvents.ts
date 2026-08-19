import { useEffect, useState } from 'react';
import { loadFamilyLinks } from './parentLinks';
import { loadParentSharedEvents, type ParentSharedEvent } from './parentSharing';

const refreshMs = 4_000;

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
    let childId: string | undefined;

    async function refresh(showLoading: boolean) {
      if (showLoading && isMounted) setIsLoading(true);

      try {
        if (!childId) childId = (await loadFamilyLinks())[0]?.child_id;
        const nextEvents = await loadParentSharedEvents(childId);
        if (isMounted) setEvents((current) => keepStableEvents(current, nextEvents));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void refresh(true);
    const intervalId = window.setInterval(() => void refresh(false), refreshMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return { events, isLoading };
}

function keepStableEvents(current: ParentSharedEvent[], next: ParentSharedEvent[]) {
  const currentIds = current.map((event) => event.id).join('|');
  const nextIds = next.map((event) => event.id).join('|');

  return currentIds === nextIds ? current : next;
}
