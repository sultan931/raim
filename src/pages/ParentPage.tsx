import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ParentConversation,
  type ParentConversationMessage,
} from '../components/ParentConversation';
import { askParentJey } from '../lib/parentAi';
import { loadLanguage } from '../lib/diaryStorage';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import { useParentSharedEvents } from '../lib/useParentSharedEvents';
import './ParentPage.css';

export function ParentPage() {
  const [, navigate] = useLocation();
  const language = loadLanguage();
  const { isLoading: isProfileLoading, profile } = useCurrentProfile();
  const isParent = profile?.role === 'parent';
  const { events, isLoading } = useParentSharedEvents(!isProfileLoading && isParent);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ParentConversationMessage[]>([
    {
      role: 'jey',
      text: 'Я покажу только то, чем ребёнок сам поделился. Можешь спросить, как мягко поддержать его сегодня.',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (isProfileLoading) return;
    if (profile?.role === 'kid') {
      navigate('/');
      return;
    }
    if (profile?.role !== 'parent') {
      navigate('/register');
      return;
    }
  }, [isProfileLoading, navigate, profile?.role]);

  const visibleEvents = useMemo(() => events.slice(0, 6), [events]);

  if (isProfileLoading) {
    return (
      <main className="parent-page">
        <p className="parent-muted">Jey проверяет аккаунт...</p>
      </main>
    );
  }

  if (profile?.role !== 'parent') return null;

  async function handleAsk() {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isThinking) return;

    setQuestion('');
    setMessages((current) => [...current, { role: 'parent', text: cleanQuestion }]);
    setIsThinking(true);
    const answer = await askParentJey(cleanQuestion, events);
    setMessages((current) => [...current, { role: 'jey', text: answer }]);
    setIsThinking(false);
  }

  return (
    <main className="parent-page">
      <header className="parent-header">
        <div>
          <p className="eyebrow">Parent space</p>
          <h1>Parent chat with Jey</h1>
          <p>Здесь видны только mood/share данные, которые ребёнок разрешил показать.</p>
        </div>
        <Link className="back-link" href="/">
          Diary
        </Link>
      </header>

      <section className="parent-grid">
        <div className="parent-panel">
          <h2>Album of the day</h2>
          {isLoading ? (
            <p className="parent-muted">Jey загружает разрешённые записи...</p>
          ) : visibleEvents.length === 0 ? (
            <p className="parent-muted">Пока ребёнок ничего не открыл для родителя.</p>
          ) : (
            <div className="parent-events">
              {visibleEvents.map((event) => (
                <article className="parent-event" key={event.id}>
                  <span>{event.privacy === 'mood' ? 'Mood only' : 'Shared note'}</span>
                  <strong>{event.mood}</strong>
                  <p>{event.summary}</p>
                  {event.child_text && <blockquote>{event.child_text}</blockquote>}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="parent-panel">
          <h2>Ask Jey</h2>
          <ParentConversation
            events={events}
            isLoading={isLoading}
            isThinking={isThinking}
            messages={messages}
          />
          <div className="parent-ask">
            <input
              aria-label="Parent question"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleAsk();
              }}
              placeholder={language === 'ru' ? 'Спроси про состояние ребёнка...' : 'Ask about the child...'}
              value={question}
            />
            <button disabled={isThinking || !question.trim()} onClick={handleAsk} type="button">
              Ask
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
